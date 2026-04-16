import type { Routine } from "./content-data";

const STORAGE_KEY = "itdam_cloned_routines_v1";

function readStorage(): Routine[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Routine[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStorage(routines: Routine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

export function getClonedRoutines(): Routine[] {
  return readStorage();
}

export function isRoutineCloned(routineId: string): boolean {
  return readStorage().some((routine) => routine.id === routineId);
}

export function cloneRoutine(routine: Routine): Routine[] {
  const current = readStorage();
  const alreadyExists = current.some((item) => item.id === routine.id);
  const next = alreadyExists ? current : [routine, ...current];
  writeStorage(next);
  return next;
}

export function removeClonedRoutine(routineId: string): Routine[] {
  const next = readStorage().filter((routine) => routine.id !== routineId);
  writeStorage(next);
  return next;
}
