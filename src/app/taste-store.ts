import type { RoutineTheme } from "./content-data";

const STORAGE_KEY = "itdam_taste_profile_v1";

export type TastePreferenceId =
  | "food"
  | "nature"
  | "photo"
  | "cafe"
  | "history"
  | "ocean"
  | "shopping"
  | "night";

export type TasteOption = {
  id: TastePreferenceId;
  label: string;
  emoji: string;
};

export type TasteProfile = {
  preferenceIds: TastePreferenceId[];
  dominantTheme: RoutineTheme | null;
  updatedAt: string;
};

type ThemeScoreMap = Record<RoutineTheme, number>;
type ThemeWeight = Partial<ThemeScoreMap>;

type TasteMeta = TasteOption & {
  weight: ThemeWeight;
};

const allThemes: RoutineTheme[] = ["맛집", "사진", "자연", "카페", "야경", "역사"];

const tasteMeta: TasteMeta[] = [
  { id: "food", label: "맛집 탐방", emoji: "🍽️", weight: { 맛집: 3 } },
  { id: "nature", label: "자연 풍경", emoji: "🌿", weight: { 자연: 3 } },
  { id: "photo", label: "사진 스팟", emoji: "📸", weight: { 사진: 3 } },
  { id: "cafe", label: "카페 투어", emoji: "☕", weight: { 카페: 3 } },
  { id: "history", label: "역사/문화", emoji: "🏛️", weight: { 역사: 3 } },
  { id: "ocean", label: "바다/해변", emoji: "🌊", weight: { 자연: 2, 사진: 1 } },
  { id: "shopping", label: "쇼핑", emoji: "🛍️", weight: { 사진: 2, 카페: 1 } },
  { id: "night", label: "야경/밤산책", emoji: "🌃", weight: { 야경: 3 } },
];

const tasteMap = new Map(tasteMeta.map((item) => [item.id, item]));

export const tasteOptions: TasteOption[] = tasteMeta.map(({ id, label, emoji }) => ({
  id,
  label,
  emoji,
}));

function readStorage(): TasteProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as TasteProfile;
    if (!Array.isArray(parsed.preferenceIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(profile: TasteProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function deriveDominantTheme(preferenceIds: TastePreferenceId[]): RoutineTheme | null {
  if (preferenceIds.length === 0) return null;

  const score = allThemes.reduce<ThemeScoreMap>((acc, theme) => {
    acc[theme] = 0;
    return acc;
  }, {} as ThemeScoreMap);

  preferenceIds.forEach((id) => {
    const meta = tasteMap.get(id);
    if (!meta) return;

    Object.entries(meta.weight).forEach(([theme, value]) => {
      if (!value) return;
      score[theme as RoutineTheme] += value;
    });
  });

  return allThemes.reduce<RoutineTheme | null>((best, theme) => {
    if (!best) return theme;
    return score[theme] > score[best] ? theme : best;
  }, null);
}

export function getUserTasteProfile(): TasteProfile | null {
  return readStorage();
}

export function saveUserTasteProfile(preferenceIds: TastePreferenceId[]): TasteProfile {
  const uniqueIds = [...new Set(preferenceIds)];
  const profile: TasteProfile = {
    preferenceIds: uniqueIds,
    dominantTheme: deriveDominantTheme(uniqueIds),
    updatedAt: new Date().toISOString(),
  };
  writeStorage(profile);
  return profile;
}

export function clearUserTasteProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

