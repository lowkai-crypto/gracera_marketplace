CREATE TYPE "public"."buyer_contact_role" AS ENUM('owner_founder', 'cpo', 'procurement_manager', 'category_manager', 'supply_chain_director', 'operations_manager', 'other');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('micro', 'small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."order_frequency" AS ENUM('one_time', 'monthly', 'quarterly', 'annual', 'ongoing');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('draft', 'active', 'paused', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."sourcing_request_status" AS ENUM('open', 'paused', 'closed', 'fulfilled');--> statement-breakpoint
CREATE TYPE "public"."supplier_contact_role" AS ENUM('owner_ceo', 'export_sales_director', 'sales_manager', 'quality_compliance', 'operations_manager', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('supplier', 'buyer', 'both', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."verification_level" AS ENUM('basic', 'verified', 'certified', 'premium');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buyer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255),
	"display_name" varchar(255),
	"country" char(2),
	"headquarters_city" varchar(255),
	"company_size" "company_size",
	"business_reg_number" varchar(255),
	"industry" varchar(255),
	"buyer_type" text[],
	"annual_purchasing_volume" varchar(50),
	"preferred_supplier_countries" char(2)[],
	"languages_spoken" char(2)[],
	"primary_contact_name" varchar(255),
	"primary_contact_role" "buyer_contact_role",
	"primary_contact_email" varchar(255),
	"primary_contact_phone" varchar(50),
	"verification_level" "verification_level" DEFAULT 'basic' NOT NULL,
	"completeness_score" real DEFAULT 0 NOT NULL,
	"profile_status" "profile_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_profile_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"hs_code" varchar(20),
	"unit" varchar(50) NOT NULL,
	"moq" integer NOT NULL,
	"moq_unit" varchar(50) NOT NULL,
	"price_min_usd" real,
	"price_max_usd" real,
	"lead_time_days" integer NOT NULL,
	"sample_available" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sourcing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_profile_id" uuid NOT NULL,
	"title" varchar(255),
	"description" text,
	"category" varchar(255),
	"product_name" varchar(255),
	"hs_code" varchar(20),
	"quantity_required" integer,
	"quantity_unit" varchar(50),
	"order_frequency" "order_frequency",
	"estimated_annual_volume" integer,
	"quality_requirements" text,
	"required_certifications" text[],
	"sample_required" boolean,
	"sample_quantity" integer,
	"preferred_supplier_types" text[],
	"preferred_supplier_countries" char(2)[],
	"excluded_supplier_countries" char(2)[],
	"max_lead_time_days" integer,
	"max_moq" integer,
	"audit_required" boolean,
	"private_label_needed" boolean,
	"oem_needed" boolean,
	"target_unit_price_usd" real,
	"budget_range" varchar(50),
	"deal_timeline" timestamp with time zone,
	"ideal_supplier_description" text,
	"dealbreakers" text,
	"expires_at" timestamp with time zone,
	"status" "sourcing_request_status" DEFAULT 'open' NOT NULL,
	"completeness_score" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255),
	"display_name" varchar(255),
	"country" char(2),
	"headquarters_city" varchar(255),
	"year_established" integer,
	"company_size" "company_size",
	"business_reg_number" varchar(255),
	"tagline" varchar(120),
	"description" text,
	"supplier_type" text[],
	"categories" text[],
	"target_geographies" char(2)[],
	"target_customer_types" text[],
	"ideal_customer_description" text,
	"preferred_deal_types" text[],
	"languages_spoken" char(2)[],
	"annual_revenue_range" varchar(50),
	"production_capacity_monthly" text,
	"quality_control_process" text,
	"certifications" text[],
	"notable_customers" text[],
	"references_available" boolean,
	"primary_contact_name" varchar(255),
	"primary_contact_role" "supplier_contact_role",
	"primary_contact_email" varchar(255),
	"primary_contact_phone" varchar(50),
	"verification_level" "verification_level" DEFAULT 'basic' NOT NULL,
	"completeness_score" real DEFAULT 0 NOT NULL,
	"profile_status" "profile_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_supplier_profile_id_supplier_profiles_id_fk" FOREIGN KEY ("supplier_profile_id") REFERENCES "public"."supplier_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sourcing_requests" ADD CONSTRAINT "sourcing_requests_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
