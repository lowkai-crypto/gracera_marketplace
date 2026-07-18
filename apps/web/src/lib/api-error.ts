import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { AuthError, ForbiddenError } from "@/lib/auth";

export function errorResponse(status: number, code: string, message: string, field?: string) {
  return NextResponse.json({ error: { code, message, ...(field ? { field } : {}) } }, { status });
}

export function validationErrorResponse(error: ZodError) {
  const first = error.issues[0];
  return errorResponse(400, "VALIDATION_ERROR", first.message, first.path.join("."));
}

/** Shared catch-block for requireAuth/requireAdminRole -- rethrows anything unexpected. */
export function authErrorResponse(err: unknown) {
  if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
  if (err instanceof ForbiddenError) return errorResponse(403, "FORBIDDEN", err.message);
  throw err;
}
