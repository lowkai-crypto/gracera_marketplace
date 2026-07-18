CREATE TABLE IF NOT EXISTS "platform_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"logo_key" varchar(50),
	"company_legal_name" varchar(255),
	"support_email" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(255),
	"region" varchar(255),
	"postal_code" varchar(20),
	"country" char(2),
	"privacy_policy_content" text,
	"terms_of_service_content" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_id" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
