import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { buyerProfiles, eq, getDb } from "@/lib/db";

const RequestSchema = z.object({
  text: z.string().min(1),
  buyerProfileId: z.string().uuid(),
});

// ai-service returns snake_case field names -- translate to the camelCase
// names the sourcing-request form's state uses, same pattern as
// extract-website/route.ts's FIELD_NAME_MAP.
const FIELD_NAME_MAP: Record<string, string> = {
  title: "title",
  category: "category",
  product_name: "productName",
  quantity_required: "quantityRequired",
  quantity_unit: "quantityUnit",
  order_frequency: "orderFrequency",
  budget_range: "budgetRange",
  max_lead_time_days: "maxLeadTimeDays",
  required_certifications: "requiredCertifications",
  ideal_supplier_description: "idealSupplierDescription",
  description: "description",
};

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

  const db = getDb();
  const [buyerProfile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.id, parsed.data.buyerProfileId))
    .limit(1);
  if (!buyerProfile) return errorResponse(404, "NOT_FOUND", "Buyer profile not found", "buyerProfileId");
  if (buyerProfile.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this buyer profile");
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${aiServiceUrl}/extract/sourcing-request-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({
        text: parsed.data.text,
        buyer_context: {
          country: buyerProfile.country,
          industry: buyerProfile.industry,
          preferred_supplier_countries: buyerProfile.preferredSupplierCountries,
        },
      }),
    });
  } catch (err) {
    console.error("[extract-sourcing-request-text] fetch to ai-service failed:", err);
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Could not reach the extraction service");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    return errorResponse(
      upstream.status === 400 ? 400 : 502,
      "EXTRACTION_FAILED",
      body?.detail ?? "Sourcing request extraction failed",
    );
  }

  const fields: Record<string, { value: string | string[]; confidence: string }> = {};
  for (const [snakeName, extracted] of Object.entries(body.fields ?? {})) {
    const camelName = FIELD_NAME_MAP[snakeName];
    if (camelName) fields[camelName] = extracted as { value: string | string[]; confidence: string };
  }

  return NextResponse.json({ fields, warnings: body.warnings ?? [] });
}
