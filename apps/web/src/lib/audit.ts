import type { getDb } from "@/lib/db";
import { auditLog } from "@/lib/db";

// docs/20-admin-ops-spec.md §12: every admin mutation writes here.
// Append-only -- nothing in the app updates or deletes a row.
export async function writeAuditLog(
  db: ReturnType<typeof getDb>,
  entry: {
    actorType: "admin" | "system" | "user";
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
    reason?: string;
  },
): Promise<void> {
  await db.insert(auditLog).values({
    actorType: entry.actorType,
    actorId: entry.actorId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    before: entry.before ?? null,
    after: entry.after ?? null,
    reason: entry.reason ?? null,
  });
}
