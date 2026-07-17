import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { loadMatchAndCallerSide } from "@/lib/match-party";

// Contact fields are never sent as prompt context -- coaching only needs
// what the viewer's own profile already says about itself, matching the
// "never echo contact info into an AI call" caution used elsewhere.
function stripContact<T extends Record<string, unknown>>(profile: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primaryContactEmail, primaryContactPhone, userId, ...rest } = profile;
  return rest;
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

  const found = await loadMatchAndCallerSide(id, auth.sub);
  if (found.status === "not_found") return errorResponse(404, "NOT_FOUND", "Match not found");
  if (found.status === "forbidden") return errorResponse(403, "FORBIDDEN", "You are not a party to this match");

  const { match, side, supplierProfile, buyerProfile } = found;
  const viewerProfile = side === "supplier" ? supplierProfile : buyerProfile;
  const rationale = match.aiRationale as { dimensions?: Record<string, { score: number; rationale: string }>; summary?: string } | null;

  if (!rationale?.dimensions) {
    return NextResponse.json({ items: [] });
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${aiServiceUrl}/assist/match-coaching`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({
        dimensions: rationale.dimensions,
        summary: rationale.summary ?? "",
        viewer_side: side,
        viewer_profile: stripContact(viewerProfile),
      }),
    });
  } catch (err) {
    console.error("[matches/coach] fetch to ai-service failed:", err);
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Could not reach the coaching service");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    return errorResponse(upstream.status === 400 ? 400 : 502, "COACHING_FAILED", body?.detail ?? "Coaching failed");
  }

  const items = (body.items ?? []).map((item: Record<string, unknown>) => ({
    dimension: item.dimension,
    actionType: item.action_type,
    suggestedText: item.suggested_text,
    targetField: item.target_field ?? null,
  }));

  return NextResponse.json({ items });
}
