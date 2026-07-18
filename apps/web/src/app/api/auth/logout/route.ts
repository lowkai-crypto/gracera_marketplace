import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_GATE_COOKIE_NAME } from "@/lib/auth";

// There was no logout endpoint before this -- sign-out elsewhere in the app
// is purely a client-side clearSession() (localStorage). This only exists to
// clear the admin gate cookie proxy.ts checks; regular supplier/buyer
// sessions don't need a server round trip to sign out.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_GATE_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
