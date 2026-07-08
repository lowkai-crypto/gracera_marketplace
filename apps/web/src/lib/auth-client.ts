import { useSyncExternalStore } from "react";

const STORAGE_KEY = "gracera.session";

export type Session = {
  userId: string;
  email: string;
  role: "supplier" | "buyer" | "both";
  accessToken: string;
  refreshToken: string;
};

export function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

// useSyncExternalStore requires getSnapshot to return a referentially
// stable value when the underlying data hasn't changed (it compares with
// Object.is). JSON.parse-ing on every call would return a new object
// reference each time even when localStorage is unchanged, which makes
// React think the store changes on every render -> infinite render loop
// (React error #185, "Maximum update depth exceeded"). Cache by raw string.
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSession;

  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return cachedSession;
  }
  try {
    cachedSession = JSON.parse(raw) as Session;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

const noopSubscribe = () => () => {};

/**
 * Reads the session for use in a render. useSyncExternalStore (rather than
 * useState+useEffect) avoids a hydration mismatch — the server always
 * "sees" no session (no localStorage), so the snapshot must resolve the
 * same way during the client's first render too.
 */
export function useSession(): Session | null {
  return useSyncExternalStore(noopSubscribe, getSession, () => null);
}

/**
 * fetch() wrapper that attaches the session's access token and, on a 401,
 * refreshes once via /api/auth/refresh before retrying — docs/10's API is
 * Bearer-header auth, not cookies, so the client is the one responsible
 * for holding and refreshing the token.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const session = getSession();
  const headers = new Headers(init.headers);
  if (session) headers.set("Authorization", `Bearer ${session.accessToken}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status !== 401 || !session) return response;

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });
  if (!refreshResponse.ok) {
    clearSession();
    return response;
  }

  const { access_token: accessToken } = await refreshResponse.json();
  saveSession({ ...session, accessToken });
  headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(input, { ...init, headers });
}
