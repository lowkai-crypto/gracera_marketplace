CREATE TABLE IF NOT EXISTS "verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_type" text NOT NULL,
	"supplier_profile_id" uuid,
	"buyer_profile_id" uuid,
	"triage_flags" jsonb NOT NULL,
	"triage_summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_supplier_profile_id_supplier_profiles_id_fk" FOREIGN KEY ("supplier_profile_id") REFERENCES "public"."supplier_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
