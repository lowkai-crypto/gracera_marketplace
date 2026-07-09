import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { eq, getDb, notifications } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const db = getDb();
  const [existing] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  if (!existing) return errorResponse(404, "NOT_FOUND", "Notification not found");
  if (existing.userId !== auth.sub) return errorResponse(403, "FORBIDDEN", "This notification does not belong to you");

  const [updated] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
  return NextResponse.json(updated);
}
