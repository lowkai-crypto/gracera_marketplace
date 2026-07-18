import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse, validationErrorResponse } from "@/lib/api-error";
import { writeAuditLog } from "@/lib/audit";
import { LOGO_CANDIDATES } from "@/lib/logo-candidates";
import { eq, getDb, platformSettings } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/platform-settings";

export async function GET(request: Request) {
  try {
    await requireAdminRole(request, { roles: ["super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const db = getDb();
  const settings = await getOrCreatePlatformSettings(db);
  return NextResponse.json(settings);
}

const PatchSchema = z.object({
  logoKey: z
    .string()
    .nullable()
    .optional()
    .refine((val) => val == null || LOGO_CANDIDATES.some((c) => c.key === val), {
      message: "Unknown logo key",
    }),
  companyLegalName: z.string().max(255).nullable().optional(),
  supportEmail: z.string().email().nullable().optional(),
  addressLine1: z.string().max(255).nullable().optional(),
  addressLine2: z.string().max(255).nullable().optional(),
  city: z.string().max(255).nullable().optional(),
  region: z.string().max(255).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  country: z.string().length(2).nullable().optional(),
  privacyPolicyContent: z.string().nullable().optional(),
  termsOfServiceContent: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  let auth;
  try {
    auth = await requireAdminRole(request, { roles: ["super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const db = getDb();
  const before = await getOrCreatePlatformSettings(db);

  const [after] = await db
    .update(platformSettings)
    .set({ ...parsed.data, updatedAt: new Date(), updatedById: auth.sub })
    .where(eq(platformSettings.id, before.id))
    .returning();

  await writeAuditLog(db, {
    actorType: "admin",
    actorId: auth.sub,
    action: "admin.platform_settings.update",
    entityType: "platform_settings",
    entityId: before.id,
    before,
    after,
  });

  return NextResponse.json(after);
}
