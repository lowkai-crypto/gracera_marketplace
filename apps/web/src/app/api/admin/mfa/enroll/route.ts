import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-error";
import { encryptSecret, generateTotpEnrollment } from "@/lib/mfa";
import { eq, getDb, users } from "@/lib/db";

// Generates a fresh TOTP secret and stores it encrypted, but does NOT mark
// mfaEnabled -- that only happens once /api/admin/mfa/verify confirms the
// admin actually has it working in an authenticator app.
export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAdminRole(request);
  } catch (err) {
    return authErrorResponse(err);
  }

  const { base32Secret, otpauthUri } = generateTotpEnrollment(auth.email);

  const db = getDb();
  await db
    .update(users)
    .set({ mfaSecretEncrypted: encryptSecret(base32Secret) })
    .where(eq(users.id, auth.sub));

  return NextResponse.json({ base32Secret, otpauthUri });
}
