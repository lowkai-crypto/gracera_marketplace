import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function errorResponse(status: number, code: string, message: string, field?: string) {
  return NextResponse.json({ error: { code, message, ...(field ? { field } : {}) } }, { status });
}

export function validationErrorResponse(error: ZodError) {
  const first = error.issues[0];
  return errorResponse(400, "VALIDATION_ERROR", first.message, first.path.join("."));
}
