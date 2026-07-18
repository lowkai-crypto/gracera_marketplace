import { NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_ROLES, hashPassword, requireAdminRole } from "@/lib/auth";
import { authErrorResponse, errorResponse, validationErrorResponse } from "@/lib/api-error";
import { writeAuditLog } from "@/lib/audit";
import { and, eq, getDb, users } from "@/lib/db";

// docs/28: Staff Accounts is the prerequisite for the rest of the admin
// section -- super_admin only, and every mutation is audit-logged.
export async function GET(request: Request) {
  try {
    await requireAdminRole(request, { roles: ["super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const db = getDb();
  const staff = await db
    .select({
      id: users.id,
      email: users.email,
      adminRole: users.adminRole,
      mfaEnabled: users.mfaEnabled,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "admin"));

  return NextResponse.json({ results: staff });
}

const CreateSchema = z.object({
  action: z.literal("create"),
  email: z.string().email(),
  password: z.string().min(12),
});
const AssignSchema = z.object({
  action: z.literal("assign"),
  userId: z.string().uuid(),
  adminRole: z.enum(ADMIN_ROLES),
});
const RevokeSchema = z.object({
  action: z.literal("revoke"),
  userId: z.string().uuid(),
});
const StaffActionSchema = z.discriminatedUnion("action", [CreateSchema, AssignSchema, RevokeSchema]);

export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAdminRole(request, { roles: ["super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const parsed = StaffActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const db = getDb();

  if (parsed.data.action === "create") {
    const { email, password } = parsed.data;
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return errorResponse(409, "EMAIL_TAKEN", "A user with this email already exists");
    }

    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash: await hashPassword(password),
        role: "admin",
        emailVerified: true,
      })
      .returning({ id: users.id, email: users.email });

    await writeAuditLog(db, {
      actorType: "admin",
      actorId: auth.sub,
      action: "admin.staff.create",
      entityType: "user",
      entityId: created.id,
      after: { email: created.email, role: "admin" },
    });

    return NextResponse.json({ id: created.id, email: created.email }, { status: 201 });
  }

  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, parsed.data.userId), eq(users.role, "admin")))
    .limit(1);
  if (!target) {
    return errorResponse(404, "NOT_FOUND", "No staff account with that id");
  }

  if (parsed.data.action === "assign") {
    if (!target.mfaEnabled) {
      return errorResponse(
        422,
        "MFA_REQUIRED_FIRST",
        "This staff member must enroll MFA (at /admin/settings) before being granted a role",
      );
    }

    await db
      .update(users)
      .set({ adminRole: parsed.data.adminRole })
      .where(eq(users.id, target.id));
    await writeAuditLog(db, {
      actorType: "admin",
      actorId: auth.sub,
      action: "admin.staff.assign_role",
      entityType: "user",
      entityId: target.id,
      before: { adminRole: target.adminRole },
      after: { adminRole: parsed.data.adminRole },
    });

    return NextResponse.json({ id: target.id, adminRole: parsed.data.adminRole });
  }

  // revoke
  await db.update(users).set({ adminRole: null }).where(eq(users.id, target.id));
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: auth.sub,
    action: "admin.staff.revoke_role",
    entityType: "user",
    entityId: target.id,
    before: { adminRole: target.adminRole },
    after: { adminRole: null },
  });

  return NextResponse.json({ id: target.id, adminRole: null });
}
