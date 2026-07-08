import { z } from "zod";

import { hashPassword, signAccessToken, signRefreshToken } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { eq, getDb, users } from "@/lib/db";
import { NextResponse } from "next/server";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["supplier", "buyer", "both"]),
});

export async function POST(request: Request) {
  const parsed = RegisterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const { email, password, role } = parsed.data;

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return errorResponse(422, "EMAIL_TAKEN", "An account with this email already exists", "email");
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, role })
    .returning();

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, role: user.role }),
    signRefreshToken({ sub: user.id, role: user.role }),
  ]);

  return NextResponse.json(
    {
      user_id: user.id,
      email: user.email,
      role: user.role,
      access_token: accessToken,
      refresh_token: refreshToken,
    },
    { status: 201 },
  );
}
