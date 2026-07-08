import { NextResponse } from "next/server";
import { z } from "zod";

import { signAccessToken, verifyRefreshToken } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";

const RefreshSchema = z.object({
  refresh_token: z.string(),
});

export async function POST(request: Request) {
  const parsed = RefreshSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    const payload = await verifyRefreshToken(parsed.data.refresh_token);
    const accessToken = await signAccessToken(payload);
    return NextResponse.json({ access_token: accessToken });
  } catch {
    return errorResponse(401, "INVALID_TOKEN", "Refresh token is invalid or expired");
  }
}
