import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";

const RequestSchema = z.object({ url: z.string().url() });

// ai-service returns snake_case field names (its own internal convention,
// matching apps/ai-service/models.py) — translate to the camelCase names
// CreateSupplierProfileSchema (apps/web/src/lib/schemas.ts) uses, so the
// frontend can merge the result straight into form state.
const FIELD_NAME_MAP: Record<string, string> = {
  company_name: "companyName",
  display_name: "displayName",
  tagline: "tagline",
  description: "description",
  country: "country",
  categories: "categories",
  target_geographies: "targetGeographies",
  languages_spoken: "languagesSpoken",
  certifications: "certifications",
  primary_contact_email: "primaryContactEmail",
  primary_contact_phone: "primaryContactPhone",
};

export async function POST(request: Request) {
  try {
    await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${aiServiceUrl}/extract/website`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({ url: parsed.data.url }),
    });
  } catch {
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Could not reach the extraction service");
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body) {
    return errorResponse(
      upstream.status === 400 ? 400 : 502,
      "EXTRACTION_FAILED",
      body?.detail ?? "Website extraction failed",
    );
  }

  const fields: Record<string, { value: string | string[]; confidence: string }> = {};
  for (const [snakeName, extracted] of Object.entries(body.fields ?? {})) {
    const camelName = FIELD_NAME_MAP[snakeName];
    if (camelName) fields[camelName] = extracted as { value: string | string[]; confidence: string };
  }

  return NextResponse.json({ sourceUrl: body.source_url, fields, warnings: body.warnings ?? [] });
}
