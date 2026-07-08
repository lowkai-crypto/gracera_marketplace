CREATE TYPE "public"."match_party_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."match_rejection_reason" AS ENUM('wrong_category', 'wrong_volume', 'already_connected', 'other');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_profile_id" uuid NOT NULL,
	"buyer_profile_id" uuid NOT NULL,
	"sourcing_request_id" uuid,
	"ai_score" real NOT NULL,
	"final_score" real NOT NULL,
	"ai_rationale" jsonb NOT NULL,
	"supplier_status" "match_party_status" DEFAULT 'pending' NOT NULL,
	"buyer_status" "match_party_status" DEFAULT 'pending' NOT NULL,
	"supplier_rejection_reason" "match_rejection_reason",
	"buyer_rejection_reason" "match_rejection_reason",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matches" ADD CONSTRAINT "matches_supplier_profile_id_supplier_profiles_id_fk" FOREIGN KEY ("supplier_profile_id") REFERENCES "public"."supplier_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matches" ADD CONSTRAINT "matches_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matches" ADD CONSTRAINT "matches_sourcing_request_id_sourcing_requests_id_fk" FOREIGN KEY ("sourcing_request_id") REFERENCES "public"."sourcing_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
