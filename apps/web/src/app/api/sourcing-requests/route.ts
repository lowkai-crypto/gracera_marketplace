import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import {
  and,
  buyerProfiles,
  canPublishSourcingRequest,
  computeSourcingRequestCompleteness,
  eq,
  getDb,
  scanProhibitedGoods,
  sourcingRequests,
} from "@/lib/db";
import { CreateSourcingRequestSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buyerProfileId = searchParams.get("buyer_profile_id");
  const status = searchParams.get("status");

  const db = getDb();
  const conditions = [
    buyerProfileId ? eq(sourcingRequests.buyerProfileId, buyerProfileId) : undefined,
    status ? eq(sourcingRequests.status, status as "open" | "paused" | "closed" | "fulfilled") : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const results = await db
    .select()
    .from(sourcingRequests)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return NextResponse.json({ results, total: results.length });
}

export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const parsed = CreateSourcingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const { buyerProfileId, ...fields } = parsed.data;

  const db = getDb();
  const [buyerProfile] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.id, buyerProfileId)).limit(1);
  if (!buyerProfile) return errorResponse(404, "NOT_FOUND", "Buyer profile not found", "buyerProfileId");
  if (buyerProfile.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this buyer profile");
  }

  // docs/06 §2.1 has no "draft" status — a sourcing request is "open" (i.e.
  // published) as soon as it's created, so the docs/06 §3 completeness gate
  // applies here rather than at a separate publish step.
  const { ok, reasons } = canPublishSourcingRequest(fields);
  if (!ok) return errorResponse(422, "INCOMPLETE_REQUEST", reasons.join("; "));

  const completenessScore = computeSourcingRequestCompleteness(fields);

  // docs/20-admin-ops-spec.md §8.3: scanned against the prohibited goods
  // list (docs/25 §7.2) at publish time; a match holds the request instead
  // of publishing it, pending trust_team review.
  const flaggedKeywords = scanProhibitedGoods(
    fields.title,
    fields.description,
    fields.productName,
    fields.qualityRequirements,
    fields.idealSupplierDescription,
    fields.dealbreakers,
  );

  const [request_] = await db
    .insert(sourcingRequests)
    .values({
      ...fields,
      buyerProfileId,
      completenessScore,
      status: flaggedKeywords.length > 0 ? "pending_moderation" : "open",
    })
    .returning();

  return NextResponse.json(request_, { status: 201 });
}
