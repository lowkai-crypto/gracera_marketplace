import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AuthError,
  hashPassword,
  requireAuth,
  requireInternalSecret,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyPassword,
  verifyRefreshToken,
} from "./auth";

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });
});

describe("access tokens", () => {
  it("round-trips subject and role", async () => {
    const token = await signAccessToken({ sub: "user-123", role: "supplier" });
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("user-123");
    expect(payload.role).toBe("supplier");
  });

  it("fails verification with the wrong secret", async () => {
    const token = await signAccessToken({ sub: "user-123", role: "supplier" });
    process.env.JWT_ACCESS_SECRET = "a-different-secret";
    await expect(verifyAccessToken(token)).rejects.toThrow();
  });
});

describe("refresh tokens", () => {
  it("round-trips subject and role", async () => {
    const token = await signRefreshToken({ sub: "user-123", role: "buyer" });
    const payload = await verifyRefreshToken(token);
    expect(payload.sub).toBe("user-123");
    expect(payload.role).toBe("buyer");
  });
});

describe("requireAuth", () => {
  it("throws AuthError when the header is missing", async () => {
    const req = new Request("http://localhost/api/x");
    await expect(requireAuth(req)).rejects.toThrow(AuthError);
  });

  it("throws AuthError when the scheme is not Bearer", async () => {
    const req = new Request("http://localhost/api/x", {
      headers: { authorization: "Basic abc123" },
    });
    await expect(requireAuth(req)).rejects.toThrow(AuthError);
  });

  it("returns the payload for a valid Bearer token", async () => {
    const token = await signAccessToken({ sub: "user-123", role: "supplier" });
    const req = new Request("http://localhost/api/x", {
      headers: { authorization: `Bearer ${token}` },
    });
    const payload = await requireAuth(req);
    expect(payload.sub).toBe("user-123");
  });
});

describe("requireInternalSecret", () => {
  const ORIGINAL_SECRET = process.env.INTERNAL_JOB_SECRET;
  afterEach(() => {
    process.env.INTERNAL_JOB_SECRET = ORIGINAL_SECRET;
  });

  it("skips the check when unconfigured", () => {
    delete process.env.INTERNAL_JOB_SECRET;
    expect(() => requireInternalSecret(new Request("http://localhost/api/internal/x"))).not.toThrow();
  });

  it("throws when configured and the header is missing", () => {
    process.env.INTERNAL_JOB_SECRET = "shh";
    expect(() => requireInternalSecret(new Request("http://localhost/api/internal/x"))).toThrow(AuthError);
  });

  it("throws when configured and the header is wrong", () => {
    process.env.INTERNAL_JOB_SECRET = "shh";
    const req = new Request("http://localhost/api/internal/x", { headers: { "x-internal-secret": "wrong" } });
    expect(() => requireInternalSecret(req)).toThrow(AuthError);
  });

  it("passes when the header matches", () => {
    process.env.INTERNAL_JOB_SECRET = "shh";
    const req = new Request("http://localhost/api/internal/x", { headers: { "x-internal-secret": "shh" } });
    expect(() => requireInternalSecret(req)).not.toThrow();
  });
});
