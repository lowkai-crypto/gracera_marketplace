import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { eq, getDb, matches, messages } from "@/lib/db";
import { loadDealAndCallerSide } from "@/lib/deal-party";

const RequestSchema = z.object({
  mode: z.enum(["draft", "translate"]),
  intent: z.string().optional(),
  text: z.string().optional(),
  targetLanguage: z.string().optional(),
});

// Contact fields are never sent as prompt context -- same caution as the
// match-coaching route.
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

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const found = await loadDealAndCallerSide(id, auth.sub);
  if (found.status === "not_found") return errorResponse(404, "NOT_FOUND", "Deal not found");
  if (found.status === "forbidden") return errorResponse(403, "FORBIDDEN", "You are not a party to this deal");

  const { deal, side, supplierProfile, buyerProfile } = found;
  const counterpartProfile = side === "supplier" ? buyerProfile : supplierProfile;

  const db = getDb();
  const [match] = await db.select().from(matches).where(eq(matches.id, deal.matchId)).limit(1);
  const rationale = match?.aiRationale as { summary?: string } | null | undefined;

  const dealMessages = await db.select().from(messages).where(eq(messages.dealId, id));
  dealMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const recentMessages = dealMessages.slice(-10).map((m) => ({
    sender: m.senderUserId === auth.sub ? "me" : "them",
    body: m.body,
  }));

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${aiServiceUrl}/assist/deal-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({
        mode: parsed.data.mode,
        intent: parsed.data.intent,
        text: parsed.data.text,
        target_language: parsed.data.targetLanguage,
        counterpart_context: stripContact(counterpartProfile),
        match_summary: rationale?.summary ?? "",
        recent_messages: recentMessages,
      }),
    });
  } catch (err) {
    console.error("[deals/assist-message] fetch to ai-service failed:", err);
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Could not reach the assist service");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    return errorResponse(upstream.status === 400 ? 400 : 502, "ASSIST_FAILED", body?.detail ?? "Assist request failed");
  }

  return NextResponse.json({ draft: body.draft });
}
