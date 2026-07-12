-- Backfill an empty profile row for every existing account, matching its
-- role(s). From this point forward, new accounts get this row created
-- directly at registration (see apps/web/src/app/api/auth/register/route.ts)
-- -- this migration only catches up accounts that already existed before
-- that change shipped. Idempotent via NOT EXISTS, safe to run more than once.
INSERT INTO "supplier_profiles" ("user_id")
SELECT "id" FROM "users"
WHERE "role" IN ('supplier', 'both')
AND NOT EXISTS (SELECT 1 FROM "supplier_profiles" WHERE "supplier_profiles"."user_id" = "users"."id");
--> statement-breakpoint
INSERT INTO "buyer_profiles" ("user_id")
SELECT "id" FROM "users"
WHERE "role" IN ('buyer', 'both')
AND NOT EXISTS (SELECT 1 FROM "buyer_profiles" WHERE "buyer_profiles"."user_id" = "users"."id");
