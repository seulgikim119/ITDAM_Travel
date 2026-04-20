import { createStore } from "zustand/vanilla";

const STORAGE_KEY = "itdam_auth_v1";
const LEGACY_SESSION_KEY = "itdam_auth_v1";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
};

type AuthStoreState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  hydrateFromStorage: () => void;
};

function isValidUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== "object") return false;
  const casted = user as Partial<AuthUser>;
  return Boolean(casted.id && casted.name && casted.email);
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const localRaw = window.localStorage.getItem(STORAGE_KEY);
  if (localRaw) {
    try {
      const parsed = JSON.parse(localRaw);
      return isValidUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  const sessionRaw = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
  if (!sessionRaw) return null;

  try {
    const parsed = JSON.parse(sessionRaw);
    if (!isValidUser(parsed)) return null;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

const authStore = createStore<AuthStoreState>()((set) => ({
  user: readStoredUser(),
  setUser: (user) => {
    writeStoredUser(user);
    set({ user });
  },
  hydrateFromStorage: () => {
    set({ user: readStoredUser() });
  },
}));

export function getAuthState(): AuthState {
  const user = authStore.getState().user;
  return {
    isLoggedIn: Boolean(user),
    user,
  };
}

export function login(input: { name: string; email: string }): AuthState {
  const user: AuthUser = {
    id: `user-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  };
  authStore.getState().setUser(user);
  return getAuthState();
}

export function logout(): AuthState {
  authStore.getState().setUser(null);
  return getAuthState();
}

export function subscribeAuth(listener: () => void): () => void {
  const unsubscribeStore = authStore.subscribe(() => listener());

  if (typeof window === "undefined") {
    return unsubscribeStore;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    authStore.getState().hydrateFromStorage();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    unsubscribeStore();
    window.removeEventListener("storage", handleStorage);
  };
}

