const STORAGE_KEY = "itdam_auth_v1";
const AUTH_CHANGE_EVENT = "itdam-auth-change";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
};

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.name || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAuthState(): AuthState {
  const user = readUser();
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
  writeUser(user);
  return getAuthState();
}

export function logout(): AuthState {
  writeUser(null);
  return getAuthState();
}

export function subscribeAuth(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => listener();
  window.addEventListener(AUTH_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
