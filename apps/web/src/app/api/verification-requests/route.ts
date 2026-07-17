import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { buyerProfiles, eq, getDb, or, supplierProfiles, verificationRequests } from "@/lib/db";

const RequestSchema = z.object({
  profileType: z.enum(["supplier", "buyer"]),
  profileId: z.string().uuid(),
});

export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const { profileType, profileId } = parsed.data;

  const db = getDb();

  // Identity-ish fields only -- no phone, matching the "never send contact
  // fields into an AI call" caution used by the coaching/deal-assist
  // routes. Two explicit branches (not one generic `table` variable) so
  // TypeScript can actually narrow the profile shape per profileType.
  let profileContext: Record<string, unknown>;
  let ownerUserId: string;
  if (profileType === "supplier") {
    const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, profileId)).limit(1);
    if (!profile) return errorResponse(404, "NOT_FOUND", "supplier profile not found", "profileId");
    ownerUserId = profile.userId;
    profileContext = {
      companyName: profile.companyName,
      displayName: profile.displayName,
      country: profile.country,
      headquartersCity: profile.headquartersCity,
      businessRegNumber: profile.businessRegNumber,
      description: profile.description,
      tagline: profile.tagline,
      primaryContactEmail: profile.primaryContactEmail,
    };
  } else {
    const [profile] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.id, profileId)).limit(1);
    if (!profile) return errorResponse(404, "NOT_FOUND", "buyer profile not found", "profileId");
    ownerUserId = profile.userId;
    profileContext = {
      companyName: profile.companyName,
      displayName: profile.displayName,
      country: profile.country,
      headquartersCity: profile.headquartersCity,
      businessRegNumber: profile.businessRegNumber,
      industry: profile.industry,
      primaryContactEmail: profile.primaryContactEmail,
    };
  }
  if (ownerUserId !== auth.sub) return errorResponse(403, "FORBIDDEN", "You do not own this profile");

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${aiServiceUrl}/assist/verification-triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({ profile: profileContext }),
    });
  } catch (err) {
    console.error("[verification-requests] fetch to ai-service failed:", err);
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Could not reach the verification service");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    return errorResponse(upstream.status === 400 ? 400 : 502, "TRIAGE_FAILED", body?.detail ?? "Triage failed");
  }

  const [created] = await db
    .insert(verificationRequests)
    .values({
      profileType,
      supplierProfileId: profileType === "supplier" ? profileId : undefined,
      buyerProfileId: profileType === "buyer" ? profileId : undefined,
      triageFlags: body.flags ?? [],
      triageSummary: body.overall_assessment ?? "",
    })
    .returning();

  return NextResponse.json({
    id: created.id,
    flags: created.triageFlags,
    overallAssessment: created.triageSummary,
    createdAt: created.createdAt,
  });
}

export async function GET(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const db = getDb();
  const [ownedSupplierProfiles, ownedBuyerProfiles] = await Promise.all([
    db.select({ id: supplierProfiles.id }).from(supplierProfiles).where(eq(supplierProfiles.userId, auth.sub)),
    db.select({ id: buyerProfiles.id }).from(buyerProfiles).where(eq(buyerProfiles.userId, auth.sub)),
  ]);
  const supplierIds = ownedSupplierProfiles.map((p) => p.id);
  const buyerIds = ownedBuyerProfiles.map((p) => p.id);

  if (supplierIds.length === 0 && buyerIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const conditions = [
    ...supplierIds.map((id) => eq(verificationRequests.supplierProfileId, id)),
    ...buyerIds.map((id) => eq(verificationRequests.buyerProfileId, id)),
  ];
  const results = await db
    .select()
    .from(verificationRequests)
    .where(or(...conditions));

  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      profileType: r.profileType,
      flags: r.triageFlags,
      overallAssessment: r.triageSummary,
      createdAt: r.createdAt,
    })),
  });
}
