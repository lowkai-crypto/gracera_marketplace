import { fileURLToPath } from "node:url";

import bcrypt from "bcryptjs";

import { getDb } from "../client";
import { users } from "../schema";
import { eq } from "drizzle-orm";

// docs/28-portal-navigation.md: the first super_admin must be bootstrapped
// outside the Staff Accounts UI, since granting the first admin_role
// requires an existing super_admin to do the granting -- a chicken-and-egg
// lockout otherwise. Run once per environment:
//
//   pnpm --filter @gracera/db seed:super-admin <email> <password>
//
// Refuses to touch an existing account -- admin accounts are meant to be
// separate internal logins, never a promoted supplier/buyer account.
async function seedSuperAdmin(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Usage: seed-super-admin.ts <email> <password>");
  }
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters for a super_admin account.");
  }

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    throw new Error(
      `A user with email ${email} already exists (id ${existing.id}). Refusing to modify an ` +
        "existing account -- use a dedicated email for the internal admin account.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "admin",
      adminRole: "super_admin",
      // Bootstrap-only exception to "MFA before role grant" -- this account
      // is created out-of-band, not through the Staff Accounts UI, so there's
      // no earlier super_admin to have enforced that sequencing. Enroll real
      // MFA at /admin/settings immediately after first login regardless.
      mfaEnabled: true,
      emailVerified: true,
    })
    .returning();

  return created;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const [, , email, password] = process.argv;
  seedSuperAdmin(email, password)
    .then((user) => {
      console.log(`Created super_admin ${user.email} (id ${user.id}).`);
      console.log(
        "mfaEnabled was set to true as a bootstrap exception -- enroll real TOTP MFA at " +
          "/admin/settings on first login and treat this password as temporary.",
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to seed super_admin:", err.message ?? err);
      process.exit(1);
    });
}
