import { createStore } from "zustand/vanilla";

const STORAGE_KEY = "itdam_completed_plans_v1";

export type CompletedPlanStop = {
  id: string;
  name: string;
  duration: number;
  memo: string;
  kind: "base" | "suggested" | "lodging";
};

export type CompletedPlan = {
  id: string;
  sourceRoutineId: string | null;
  title: string;
  region: string;
  travelDate?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  tripNights?: number;
  tripDays?: number;
  totalStops: number;
  totalMinutes: number;
  plannedStops?: CompletedPlanStop[];
  finalizedAt: string;
};

type SaveCompletedPlanInput = Omit<CompletedPlan, "id" | "finalizedAt"> & {
  id?: string;
  finalizedAt?: string;
};

type CompletedPlanStoreState = {
  plans: CompletedPlan[];
  setPlans: (plans: CompletedPlan[]) => void;
  hydrateFromStorage: () => void;
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

const completedPlanStore = createStore<CompletedPlanStoreState>()((set) => ({
  plans: readStorage(),
  setPlans: (plans) => {
    writeStorage(plans);
    set({ plans });
  },
  hydrateFromStorage: () => {
    set({ plans: readStorage() });
  },
}));

export function getCompletedPlans(): CompletedPlan[] {
  return completedPlanStore.getState().plans;
}

export function saveCompletedPlan(input: SaveCompletedPlanInput): CompletedPlan[] {
  const plan: CompletedPlan = {
    id: input.id ?? `plan-${Date.now()}`,
    finalizedAt: input.finalizedAt ?? new Date().toISOString(),
    sourceRoutineId: input.sourceRoutineId,
    title: input.title,
    region: input.region,
    travelDate: input.travelDate,
    travelStartDate: input.travelStartDate,
    travelEndDate: input.travelEndDate,
    tripNights: input.tripNights,
    tripDays: input.tripDays,
    totalStops: input.totalStops,
    totalMinutes: input.totalMinutes,
    plannedStops: input.plannedStops,
  };

  const current = completedPlanStore.getState().plans;
  const next = [plan, ...current].slice(0, 30);
  completedPlanStore.getState().setPlans(next);
  return next;
}

export function removeCompletedPlan(planId: string): CompletedPlan[] {
  const next = completedPlanStore.getState().plans.filter((plan) => plan.id !== planId);
  completedPlanStore.getState().setPlans(next);
  return next;
}
