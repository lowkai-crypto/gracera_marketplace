CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'trust_team', 'customer_success', 'finance_ops', 'content_mod', 'data_analyst');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_role" "admin_role";
