import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_GATE_COOKIE_NAME,
  signAccessToken,
  signAdminGateCookie,
  signRefreshToken,
  verifyPassword,
} from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { eq, getDb, users } from "@/lib/db";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const { email, password } = parsed.data;

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorResponse(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, role: user.role }),
    signRefreshToken({ sub: user.id, role: user.role }),
  ]);

  // docs/28: /admin is gated by proxy.ts reading this cookie. It's not the
  // Bearer access token above -- it can't call any API, it only lets the
  // optimistic redirect check prove "this browser recently signed in as an
  // admin" without a DB round trip on every navigation.
  if (user.role === "admin") {
    const adminGateToken = await signAdminGateCookie({ sub: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_GATE_COOKIE_NAME, adminGateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    role: user.role,
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}
