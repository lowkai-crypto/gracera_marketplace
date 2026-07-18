import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/platform-settings";

// Public, no auth -- this is the same brand/contact info a visitor could
// already see on the public site (logo, company address, support email).
export async function GET() {
  const db = getDb();
  const settings = await getOrCreatePlatformSettings(db);

  return NextResponse.json({
    logoKey: settings.logoKey,
    companyLegalName: settings.companyLegalName,
    supportEmail: settings.supportEmail,
    address: {
      line1: settings.addressLine1,
      line2: settings.addressLine2,
      city: settings.city,
      region: settings.region,
      postalCode: settings.postalCode,
      country: settings.country,
    },
  });
}
