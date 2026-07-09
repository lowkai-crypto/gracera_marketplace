import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { getDb, messages, notifications } from "@/lib/db";
import { loadDealAndCallerSide } from "@/lib/deal-party";

// Text only for v0 — attachments need the presign upload flow from
// docs/10-api-reference.md, which isn't built anywhere in the app yet.
const SendMessageSchema = z.object({ body: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const parsed = SendMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const result = await loadDealAndCallerSide(id, auth.sub);
  if (result.status === "not_found") return errorResponse(404, "NOT_FOUND", "Deal not found");
  if (result.status === "forbidden") return errorResponse(403, "FORBIDDEN", "You are not a party to this deal");

  const { side, supplierProfile, buyerProfile } = result;
  const db = getDb();
  const [message] = await db
    .insert(messages)
    .values({ dealId: id, senderUserId: auth.sub, body: parsed.data.body })
    .returning();

  // Notify the counterpart only — never the sender.
  const senderName = side === "supplier" ? supplierProfile.companyName : buyerProfile.companyName;
  const recipientUserId = side === "supplier" ? buyerProfile.userId : supplierProfile.userId;
  await db.insert(notifications).values({
    userId: recipientUserId,
    type: "message.new",
    title: "New message",
    body: `${senderName ?? "Your deal counterpart"} sent you a message.`,
    entityType: "deal",
    entityId: id,
  });

  return NextResponse.json(message, { status: 201 });
}
