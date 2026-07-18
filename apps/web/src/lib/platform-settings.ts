import { getDb, platformSettings } from "@/lib/db";

/**
 * platform_settings is a singleton -- enforced here (read-or-create-default)
 * rather than a DB constraint, since the only writer is the admin PATCH
 * route below. Shared by every reader (public API, admin API, the
 * privacy/terms Server Components) so there's one definition of "no row yet
 * means these defaults," not three.
 */
export async function getOrCreatePlatformSettings(db: ReturnType<typeof getDb>) {
  const [existing] = await db.select().from(platformSettings).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(platformSettings).values({}).returning();
  return created;
}
