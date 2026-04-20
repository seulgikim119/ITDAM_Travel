import { createStore } from "zustand/vanilla";
import type { Routine } from "./content-data";

const STORAGE_KEY = "itdam_wishlist_routines_v1";
const LEGACY_STORAGE_KEY = "itdam_cloned_routines_v1";

type CloneStoreState = {
  routines: Routine[];
  setRoutines: (routines: Routine[]) => void;
  hydrateFromStorage: () => void;
};

function isRoutineArray(value: unknown): value is Routine[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => item && typeof item === "object" && typeof (item as Routine).id === "string");
}

function readRawStorage(key: string): Routine[] | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isRoutineArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readStorage(): Routine[] {
  if (typeof window === "undefined") return [];

  const current = readRawStorage(STORAGE_KEY);
  if (current) return current;

  const legacy = readRawStorage(LEGACY_STORAGE_KEY);
  if (!legacy) return [];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  return legacy;
}

function writeStorage(routines: Routine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

const cloneStore = createStore<CloneStoreState>()((set) => ({
  routines: readStorage(),
  setRoutines: (routines) => {
    writeStorage(routines);
    set({ routines });
  },
  hydrateFromStorage: () => {
    set({ routines: readStorage() });
  },
}));

export function getClonedRoutines(): Routine[] {
  return cloneStore.getState().routines;
}

export function isRoutineCloned(routineId: string): boolean {
  return cloneStore.getState().routines.some((routine) => routine.id === routineId);
}

export function cloneRoutine(routine: Routine): Routine[] {
  const current = cloneStore.getState().routines;
  const alreadyExists = current.some((item) => item.id === routine.id);
  const next = alreadyExists ? current : [routine, ...current];
  cloneStore.getState().setRoutines(next);
  return next;
}

export function removeClonedRoutine(routineId: string): Routine[] {
  const next = cloneStore.getState().routines.filter((routine) => routine.id !== routineId);
  cloneStore.getState().setRoutines(next);
  return next;
}

export function getWishlistRoutines(): Routine[] {
  return getClonedRoutines();
}

