import { createStore } from "zustand/vanilla";
import { routineThemes, type RoutineTheme } from "./content-data";

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

type TasteStoreState = {
  profile: TasteProfile | null;
  setProfile: (profile: TasteProfile | null) => void;
  hydrateFromStorage: () => void;
};

const ALL_PREFERENCE_IDS: TastePreferenceId[] = [
  "food",
  "nature",
  "photo",
  "cafe",
  "history",
  "ocean",
  "shopping",
  "night",
];

const tasteOptionMap: Record<TastePreferenceId, TasteOption> = {
  food: { id: "food", label: "맛집 탐방", emoji: "🍜" },
  nature: { id: "nature", label: "자연 풍경", emoji: "🌿" },
  photo: { id: "photo", label: "사진 스팟", emoji: "📸" },
  cafe: { id: "cafe", label: "카페 투어", emoji: "☕" },
  history: { id: "history", label: "역사/문화", emoji: "🏛️" },
  ocean: { id: "ocean", label: "바다/해변", emoji: "🌊" },
  shopping: { id: "shopping", label: "쇼핑", emoji: "🛍️" },
  night: { id: "night", label: "야경/산책", emoji: "🌙" },
};

const themeWeightByPreference: Record<TastePreferenceId, number[]> = {
  food: [3, 0, 0, 0, 0, 0],
  nature: [0, 0, 3, 0, 0, 0],
  photo: [0, 3, 0, 0, 0, 0],
  cafe: [0, 0, 0, 3, 0, 0],
  history: [0, 0, 0, 0, 0, 3],
  ocean: [0, 1, 2, 0, 0, 0],
  shopping: [0, 2, 0, 1, 0, 0],
  night: [0, 0, 0, 0, 3, 0],
};

function isValidPreferenceId(value: unknown): value is TastePreferenceId {
  return typeof value === "string" && ALL_PREFERENCE_IDS.includes(value as TastePreferenceId);
}

function readStorage(): TasteProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<TasteProfile>;
    if (!Array.isArray(parsed.preferenceIds)) return null;
    const preferenceIds = parsed.preferenceIds.filter(isValidPreferenceId);
    const dominantTheme =
      parsed.dominantTheme && routineThemes.includes(parsed.dominantTheme)
        ? parsed.dominantTheme
        : null;
    return {
      preferenceIds,
      dominantTheme,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeStorage(profile: TasteProfile | null) {
  if (typeof window === "undefined") return;
  if (!profile) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function deriveDominantTheme(preferenceIds: TastePreferenceId[]): RoutineTheme | null {
  if (preferenceIds.length === 0 || routineThemes.length === 0) return null;

  const score = new Array<number>(routineThemes.length).fill(0);
  preferenceIds.forEach((id) => {
    const weight = themeWeightByPreference[id];
    weight.forEach((value, index) => {
      if (index < score.length) score[index] += value;
    });
  });

  let bestIndex = 0;
  for (let i = 1; i < score.length; i += 1) {
    if (score[i] > score[bestIndex]) bestIndex = i;
  }
  return routineThemes[bestIndex] ?? null;
}

const tasteStore = createStore<TasteStoreState>()((set) => ({
  profile: readStorage(),
  setProfile: (profile) => {
    writeStorage(profile);
    set({ profile });
  },
  hydrateFromStorage: () => {
    set({ profile: readStorage() });
  },
}));

export const tasteOptions: TasteOption[] = ALL_PREFERENCE_IDS.map((id) => tasteOptionMap[id]);

export function getUserTasteProfile(): TasteProfile | null {
  return tasteStore.getState().profile;
}

export function saveUserTasteProfile(preferenceIds: TastePreferenceId[]): TasteProfile {
  const uniqueIds = [...new Set(preferenceIds.filter(isValidPreferenceId))];
  const profile: TasteProfile = {
    preferenceIds: uniqueIds,
    dominantTheme: deriveDominantTheme(uniqueIds),
    updatedAt: new Date().toISOString(),
  };
  tasteStore.getState().setProfile(profile);
  return profile;
}

export function clearUserTasteProfile() {
  tasteStore.getState().setProfile(null);
}

