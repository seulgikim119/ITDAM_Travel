import { createStore } from "zustand/vanilla";

const STORAGE_KEY = "itdam_search_presets_v1";
const MAX_PRESETS = 20;

export type SearchPreset = {
  id: string;
  name: string;
  keyword: string;
  region?: string;
  tags?: string[];
  updatedAt: string;
};

type SearchPresetStoreState = {
  presets: SearchPreset[];
  setPresets: (presets: SearchPreset[]) => void;
};

function readStorage(): SearchPreset[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SearchPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(presets: SearchPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

const searchPresetStore = createStore<SearchPresetStoreState>()((set) => ({
  presets: readStorage(),
  setPresets: (presets) => {
    writeStorage(presets);
    set({ presets });
  },
}));

export function getSearchPresets(): SearchPreset[] {
  return searchPresetStore.getState().presets;
}

export function saveSearchPreset(input: Omit<SearchPreset, "id" | "updatedAt"> & { id?: string }): SearchPreset[] {
  const current = searchPresetStore.getState().presets;
  const now = new Date().toISOString();
  const targetId = input.id ?? `preset-${Date.now()}`;

  const nextPreset: SearchPreset = {
    id: targetId,
    name: input.name,
    keyword: input.keyword,
    region: input.region,
    tags: input.tags ?? [],
    updatedAt: now,
  };

  const withoutTarget = current.filter((preset) => preset.id !== targetId);
  const next = [nextPreset, ...withoutTarget].slice(0, MAX_PRESETS);
  searchPresetStore.getState().setPresets(next);
  return next;
}

export function removeSearchPreset(id: string): SearchPreset[] {
  const next = searchPresetStore.getState().presets.filter((preset) => preset.id !== id);
  searchPresetStore.getState().setPresets(next);
  return next;
}

export function clearSearchPresets(): SearchPreset[] {
  searchPresetStore.getState().setPresets([]);
  return [];
}

