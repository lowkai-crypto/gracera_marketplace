import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  let auth;
  try {
    auth = await requireAdminRole(request);
  } catch (err) {
    return authErrorResponse(err);
  }

  return NextResponse.json({
    email: auth.email,
    adminRole: auth.adminRole,
    mfaEnabled: auth.mfaEnabled,
  });
}
