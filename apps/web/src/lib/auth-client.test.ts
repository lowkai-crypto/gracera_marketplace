import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearSession, getSession, saveSession } from "./auth-client";

// useSyncExternalStore requires getSnapshot() to return a referentially
// stable value (Object.is) when the underlying store hasn't changed —
// this is what actually broke in production: calling JSON.parse() fresh
// on every call returned a new object each time, causing an infinite
// render loop (React error #185, "Maximum update depth exceeded").
function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  // @ts-expect-error -- minimal test shim, not the full Storage interface
  global.localStorage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
  // getSession() guards on `typeof window === "undefined"` to detect SSR;
  // the vitest "node" environment has no window either, so it must be
  // shimmed too or every read short-circuits to null regardless of the
  // localStorage mock above.
  // @ts-expect-error -- minimal test shim
  global.window = global;
}

const SAMPLE_SESSION = {
  userId: "user-1",
  email: "test@example.com",
  role: "buyer" as const,
  accessToken: "access",
  refreshToken: "refresh",
};

describe("getSession referential stability", () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it("returns the same object reference across calls when storage is unchanged", () => {
    saveSession(SAMPLE_SESSION);

    const first = getSession();
    const second = getSession();
    expect(first).toEqual(SAMPLE_SESSION);
    expect(first).toBe(second);
  });

  it("returns null consistently (same reference) when no session exists", () => {
    expect(getSession()).toBeNull();
    expect(getSession()).toBe(getSession());
  });

  it("returns a new reference only after the session actually changes", () => {
    saveSession(SAMPLE_SESSION);
    const first = getSession();

    saveSession({ ...SAMPLE_SESSION, accessToken: "new-access" });
    const second = getSession();

    expect(first).not.toBe(second);
    expect(second?.accessToken).toBe("new-access");
  });

  it("returns the same reference again after clearSession then re-reading null", () => {
    saveSession(SAMPLE_SESSION);
    clearSession();
    const first = getSession();
    const second = getSession();
    expect(first).toBeNull();
    expect(first).toBe(second);
  });
});
