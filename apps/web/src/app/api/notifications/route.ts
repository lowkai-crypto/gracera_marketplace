import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { eq, getDb, notifications } from "@/lib/db";

export async function GET(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const db = getDb();
  const rows = await db.select().from(notifications).where(eq(notifications.userId, auth.sub));
  const sorted = [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const unreadCount = sorted.filter((n) => !n.read).length;

  return NextResponse.json({ notifications: sorted, unreadCount });
}
