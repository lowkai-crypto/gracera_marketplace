import { NextResponse } from "next/server";
import { z } from "zod";

import { signAccessToken, signRefreshToken, verifyPassword } from "@/lib/auth";
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

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    role: user.role,
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}
