import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_GATE_COOKIE_NAME, verifyAdminGateCookie } from "@/lib/auth";

// Optimistic-only gate for the admin portal (docs/28: "/admin ... protected
// by role-based middleware"). Reads the gracera_admin_gate cookie set at
// login for admin accounts -- no DB call here, per Next's own guidance that
// Proxy runs on every request (including prefetches) and shouldn't do slow
// data fetching. The real, DB-backed authorization check is
// requireAdminRole(), run on every /api/admin/** request regardless of
// whether this redirect fires.
export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_GATE_COOKIE_NAME)?.value;

  if (!cookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const payload = await verifyAdminGateCookie(cookie);
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
