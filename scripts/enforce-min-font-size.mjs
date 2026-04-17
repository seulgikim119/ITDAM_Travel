import { promises as fs } from "node:fs";
import path from "node:path";

const MIN_FONT_SIZE = 14;
const ROOT_DIR = process.cwd();
const TARGET_DIRS = ["src/app/components"];
const TARGET_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeContent(source) {
  let changed = false;

  const withInlineFontSize = source.replace(/(fontSize\s*:\s*)(\d+)\b/g, (_, prefix, value) => {
    const normalized = Math.max(Number(value), MIN_FONT_SIZE);
    if (normalized !== Number(value)) changed = true;
    return `${prefix}${normalized}`;
  });

  const withPixelClass = withInlineFontSize.replace(/(text-\[)(\d+)(px\])/g, (_, prefix, value, suffix) => {
    const normalized = Math.max(Number(value), MIN_FONT_SIZE);
    if (normalized !== Number(value)) changed = true;
    return `${prefix}${normalized}${suffix}`;
  });

  return { changed, content: withPixelClass };
}

async function run() {
  let changedFiles = 0;
  const touched = [];

  for (const dir of TARGET_DIRS) {
    const absoluteDir = path.join(ROOT_DIR, dir);
    const files = await walk(absoluteDir);

    for (const filePath of files) {
      const original = await fs.readFile(filePath, "utf8");
      const { changed, content } = normalizeContent(original);
      if (!changed) continue;

      await fs.writeFile(filePath, content, "utf8");
      changedFiles += 1;
      touched.push(path.relative(ROOT_DIR, filePath));
    }
  }

  console.log(`[font:min14] Updated ${changedFiles} file(s).`);
  if (touched.length) {
    for (const file of touched) {
      console.log(` - ${file}`);
    }
  }
}

run().catch((error) => {
  console.error("[font:min14] Failed:", error);
  process.exit(1);
});
