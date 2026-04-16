const STORAGE_KEY = "itdam_completed_plans_v1";

export type CompletedPlan = {
  id: string;
  sourceRoutineId: string | null;
  title: string;
  region: string;
  totalStops: number;
  totalMinutes: number;
  finalizedAt: string;
};

type SaveCompletedPlanInput = Omit<CompletedPlan, "id" | "finalizedAt"> & {
  id?: string;
  finalizedAt?: string;
};

function readStorage(): CompletedPlan[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CompletedPlan[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStorage(plans: CompletedPlan[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function getCompletedPlans(): CompletedPlan[] {
  return readStorage();
}

export function saveCompletedPlan(input: SaveCompletedPlanInput): CompletedPlan[] {
  const plan: CompletedPlan = {
    id: input.id ?? `plan-${Date.now()}`,
    finalizedAt: input.finalizedAt ?? new Date().toISOString(),
    sourceRoutineId: input.sourceRoutineId,
    title: input.title,
    region: input.region,
    totalStops: input.totalStops,
    totalMinutes: input.totalMinutes,
  };

  const current = readStorage();
  const next = [plan, ...current].slice(0, 30);
  writeStorage(next);
  return next;
}

