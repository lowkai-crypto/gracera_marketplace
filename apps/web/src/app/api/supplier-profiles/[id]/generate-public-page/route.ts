import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { eq, getDb, productLines, supplierProfiles } from "@/lib/db";

async function loadProfile(id: string) {
  const db = getDb();
  const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, id)).limit(1);
  if (!profile) return null;
  const lines = await db.select().from(productLines).where(eq(productLines.supplierProfileId, id));
  return { profile, lines };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const found = await loadProfile(id);
  if (!found || found.profile.profileStatus === "deleted") {
    return errorResponse(404, "NOT_FOUND", "Supplier profile not found");
  }
  if (found.profile.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this profile");
  }
  // A public page only makes sense for a published profile -- generating
  // one for a draft would create real public content for something
  // nobody has actually decided to make visible yet.
  if (found.profile.profileStatus !== "active") {
    return errorResponse(422, "NOT_PUBLISHED", "Publish your profile before generating a public page");
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primaryContactEmail, primaryContactPhone, ...profileContext } = found.profile;

  let upstream: Response;
  try {
    upstream = await fetch(`${aiServiceUrl}/assist/generate-public-page`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({ supplier_profile: profileContext, product_lines: found.lines }),
    });
  } catch (err) {
    console.error("[generate-public-page] fetch to ai-service failed:", err);
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Could not reach the public-page service");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    return errorResponse(upstream.status === 400 ? 400 : 502, "GENERATION_FAILED", body?.detail ?? "Generation failed");
  }

  const publicPageContent = { headline: body.headline, summary: body.summary, sections: body.sections ?? [] };

  const db = getDb();
  await db.update(supplierProfiles).set({ publicPageContent }).where(eq(supplierProfiles.id, id));

  return NextResponse.json(publicPageContent);
}
