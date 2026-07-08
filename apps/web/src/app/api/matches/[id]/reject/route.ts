import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { eq, getDb, matches } from "@/lib/db";
import { loadMatchAndCallerSide } from "@/lib/match-party";
import { RejectMatchSchema } from "@/lib/schemas";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const parsed = RejectMatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const result = await loadMatchAndCallerSide(id, auth.sub);
  if (result.status === "not_found") return errorResponse(404, "NOT_FOUND", "Match not found");
  if (result.status === "forbidden") return errorResponse(403, "FORBIDDEN", "You are not a party to this match");

  const { side } = result;
  const db = getDb();
  const [updated] = await db
    .update(matches)
    .set(
      side === "supplier"
        ? { supplierStatus: "rejected", supplierRejectionReason: parsed.data.reason }
        : { buyerStatus: "rejected", buyerRejectionReason: parsed.data.reason },
    )
    .where(eq(matches.id, id))
    .returning();

  return NextResponse.json({
    id: updated.id,
    supplierStatus: updated.supplierStatus,
    buyerStatus: updated.buyerStatus,
  });
}
