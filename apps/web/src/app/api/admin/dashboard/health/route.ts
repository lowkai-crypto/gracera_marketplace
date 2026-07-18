import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-error";
import { getDb, gte, matches, sql, users } from "@/lib/db";

// docs/28 Platform Health: only what's honestly computable from Postgres
// today. AI service latency (p50/p99) and error rate need an APM/logging
// pipeline this app doesn't have -- omitted rather than faked.
export async function GET(request: Request) {
  try {
    await requireAdminRole(request, { roles: ["super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const db = getDb();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [[activeUsers], [matchVolume]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.lastLoginAt, since24h)),
    db.select({ count: sql<number>`count(*)::int` }).from(matches),
  ]);

  return NextResponse.json({
    activeUsers24h: activeUsers.count,
    totalMatches: matchVolume.count,
    aiServiceLatency: null,
    errorRate: null,
    note: "AI service latency/error rate require an APM pipeline that isn't built yet.",
  });
}
