import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { eq, getDb, messages } from "@/lib/db";
import { loadDealAndCallerSide } from "@/lib/deal-party";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const result = await loadDealAndCallerSide(id, auth.sub);
  if (result.status === "not_found") return errorResponse(404, "NOT_FOUND", "Deal not found");
  if (result.status === "forbidden") return errorResponse(403, "FORBIDDEN", "You are not a party to this deal");

  const { deal, side, supplierProfile, buyerProfile } = result;
  const counterpartProfile = side === "supplier" ? buyerProfile : supplierProfile;

  const db = getDb();
  const dealMessages = await db.select().from(messages).where(eq(messages.dealId, id));
  dealMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return NextResponse.json({
    id: deal.id,
    stage: deal.stage,
    counterpartProfile,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
    closedAt: deal.closedAt,
    messages: dealMessages,
  });
}
