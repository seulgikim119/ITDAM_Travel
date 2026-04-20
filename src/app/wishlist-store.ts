import { createStore } from "zustand/vanilla";

const STORAGE_KEY = "itdam_wishlist_destinations_v1";

export type WishlistItem = {
  id: string;
  title: string;
  region?: string;
  image?: string;
  savedAt: string;
};

type WishlistStoreState = {
  items: WishlistItem[];
  setItems: (items: WishlistItem[]) => void;
};

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const wishlistStore = createStore<WishlistStoreState>()((set) => ({
  items: readStorage(),
  setItems: (items) => {
    writeStorage(items);
    set({ items });
  },
}));

export function getWishlistItems(): WishlistItem[] {
  return wishlistStore.getState().items;
}

export function isWishlisted(id: string): boolean {
  return wishlistStore.getState().items.some((item) => item.id === id);
}

export function saveWishlistItem(input: Omit<WishlistItem, "savedAt">): WishlistItem[] {
  const current = wishlistStore.getState().items;
  const exists = current.some((item) => item.id === input.id);
  const next = exists
    ? current
    : [{ ...input, savedAt: new Date().toISOString() }, ...current].slice(0, 100);
  wishlistStore.getState().setItems(next);
  return next;
}

export function removeWishlistItem(id: string): WishlistItem[] {
  const next = wishlistStore.getState().items.filter((item) => item.id !== id);
  wishlistStore.getState().setItems(next);
  return next;
}

export function clearWishlistItems(): WishlistItem[] {
  wishlistStore.getState().setItems([]);
  return [];
}

