import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { Secret, TOTP } from "otpauth";

// docs/20-admin-ops-spec.md §1: TOTP MFA is mandatory for admin accounts.
// The raw secret is never stored -- only its AES-256-GCM ciphertext
// (users.mfaSecretEncrypted), keyed by MFA_ENCRYPTION_KEY (32 raw bytes,
// base64-encoded in the env var).
const ISSUER = "Gracera";

function encryptionKey(): Buffer {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!value) throw new Error("MFA_ENCRYPTION_KEY is not set");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    throw new Error("MFA_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(
    ".",
  );
}

export function decryptSecret(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Generates a fresh TOTP secret + otpauth:// URI for enrollment. Not yet stored. */
export function generateTotpEnrollment(email: string): { base32Secret: string; otpauthUri: string } {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  return { base32Secret: secret.base32, otpauthUri: totp.toString() };
}

/** Verifies a 6-digit code against an already-encrypted-at-rest secret. */
export function verifyTotpCode(encryptedSecret: string, code: string): boolean {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(decryptSecret(encryptedSecret)),
  });
  // window: 1 tolerates +/-30s clock drift between server and authenticator app.
  return totp.validate({ token: code, window: 1 }) !== null;
}
