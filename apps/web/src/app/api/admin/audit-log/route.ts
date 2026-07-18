import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-error";
import { and, auditLog, desc, eq, getDb } from "@/lib/db";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    await requireAdminRole(request, { roles: ["super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const url = new URL(request.url);
  const entityType = url.searchParams.get("entityType");
  const actorId = url.searchParams.get("actorId");

  const conditions = [
    entityType ? eq(auditLog.entityType, entityType) : undefined,
    actorId ? eq(auditLog.actorId, actorId) : undefined,
  ].filter((c) => c !== undefined);

  const db = getDb();
  const results = await db
    .select()
    .from(auditLog)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(PAGE_SIZE);

  return NextResponse.json({ results });
}
