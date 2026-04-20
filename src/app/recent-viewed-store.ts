import { createStore } from "zustand/vanilla";

const STORAGE_KEY = "itdam_recent_viewed_destinations_v1";
const MAX_RECENT_ITEMS = 30;

export type RecentViewedDestination = {
  id: string;
  title: string;
  region?: string;
  image?: string;
  viewedAt: string;
};

type RecentViewedStoreState = {
  items: RecentViewedDestination[];
  setItems: (items: RecentViewedDestination[]) => void;
};

function readStorage(): RecentViewedDestination[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as RecentViewedDestination[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: RecentViewedDestination[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const recentViewedStore = createStore<RecentViewedStoreState>()((set) => ({
  items: readStorage(),
  setItems: (items) => {
    writeStorage(items);
    set({ items });
  },
}));

export function getRecentViewedDestinations(): RecentViewedDestination[] {
  return recentViewedStore.getState().items;
}

export function addRecentViewedDestination(
  input: Omit<RecentViewedDestination, "viewedAt"> & { viewedAt?: string }
): RecentViewedDestination[] {
  const current = recentViewedStore.getState().items;
  const nextItem: RecentViewedDestination = {
    id: input.id,
    title: input.title,
    region: input.region,
    image: input.image,
    viewedAt: input.viewedAt ?? new Date().toISOString(),
  };
  const deduped = current.filter((item) => item.id !== input.id);
  const next = [nextItem, ...deduped].slice(0, MAX_RECENT_ITEMS);
  recentViewedStore.getState().setItems(next);
  return next;
}

export function clearRecentViewedDestinations(): RecentViewedDestination[] {
  recentViewedStore.getState().setItems([]);
  return [];
}

