import {
  boolean,
  char,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── Enums ─────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["supplier", "buyer", "both", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "deleted"]);
export const companySizeEnum = pgEnum("company_size", ["micro", "small", "medium", "large"]);
export const profileStatusEnum = pgEnum("profile_status", ["draft", "active", "paused", "deleted"]);
export const verificationLevelEnum = pgEnum("verification_level", [
  "basic",
  "verified",
  "certified",
  "premium",
]);
export const supplierContactRoleEnum = pgEnum("supplier_contact_role", [
  "owner_ceo",
  "export_sales_director",
  "sales_manager",
  "quality_compliance",
  "operations_manager",
  "other",
]);
export const buyerContactRoleEnum = pgEnum("buyer_contact_role", [
  "owner_founder",
  "cpo",
  "procurement_manager",
  "category_manager",
  "supply_chain_director",
  "operations_manager",
  "other",
]);
export const sourcingRequestStatusEnum = pgEnum("sourcing_request_status", [
  "open",
  "paused",
  "closed",
  "fulfilled",
  "pending_moderation",
]);
export const orderFrequencyEnum = pgEnum("order_frequency", [
  "one_time",
  "monthly",
  "quarterly",
  "annual",
  "ongoing",
]);
export const matchPartyStatusEnum = pgEnum("match_party_status", ["pending", "accepted", "rejected"]);
export const matchRejectionReasonEnum = pgEnum("match_rejection_reason", [
  "wrong_category",
  "wrong_volume",
  "already_connected",
  "other",
]);
export const dealStageEnum = pgEnum("deal_stage", [
  "messaging",
  "rfq_issued",
  "quote_submitted",
  "deal_room",
  "closed",
  "abandoned",
]);

// ── users ─────────────────────────────────────────────────────────────────
// docs/09-data-model.md — trimmed: no auth_provider/OAuth column yet (v0 is
// email+password only; see plan for what's deferred).

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

// ── supplier_profiles ────────────────────────────────────────────────────
// docs/05-supplier-profile-spec.md + docs/09. `categories` is text[] for v0
// (free-form) rather than an FK into a categories table — importing the
// docs/16 taxonomy is a separate task.

export const supplierProfiles = pgTable("supplier_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  // Company Identity — docs/05 §1.1
  companyName: varchar("company_name", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  country: char("country", { length: 2 }),
  headquartersCity: varchar("headquarters_city", { length: 255 }),
  yearEstablished: integer("year_established"),
  companySize: companySizeEnum("company_size"),
  businessRegNumber: varchar("business_reg_number", { length: 255 }),
  tagline: varchar("tagline", { length: 120 }),
  description: text("description"),

  // Products & Services — docs/05 §1.2 (product lines live in their own table)
  supplierType: text("supplier_type").array(),
  categories: text("categories").array(),

  // Target Market & Ideal Customer — docs/05 §1.5
  targetGeographies: char("target_geographies", { length: 2 }).array(),
  targetCustomerTypes: text("target_customer_types").array(),
  idealCustomerDescription: text("ideal_customer_description"),
  preferredDealTypes: text("preferred_deal_types").array(),
  languagesSpoken: char("languages_spoken", { length: 2 }).array(),

  // Capabilities — docs/05 §1.3 (all optional)
  annualRevenueRange: varchar("annual_revenue_range", { length: 50 }),
  productionCapacityMonthly: text("production_capacity_monthly"),
  qualityControlProcess: text("quality_control_process"),

  // Certifications — docs/05 §1.4 (uploads/verification deferred; names only for now)
  certifications: text("certifications").array(),

  // References — docs/05 §1.6 (all optional)
  notableCustomers: text("notable_customers").array(),
  referencesAvailable: boolean("references_available"),

  // Contact — docs/05 §1.7
  primaryContactName: varchar("primary_contact_name", { length: 255 }),
  primaryContactRole: supplierContactRoleEnum("primary_contact_role"),
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
  primaryContactPhone: varchar("primary_contact_phone", { length: 50 }),

  verificationLevel: verificationLevelEnum("verification_level").notNull().default("basic"),
  completenessScore: real("completeness_score").notNull().default(0),
  profileStatus: profileStatusEnum("profile_status").notNull().default("draft"),

  // AEO/public-page content -- generated on demand (not required to
  // publish), nullable, only ever populated for an "active" profile. See
  // the AI verification/public-page feature plan.
  publicPageContent: jsonb("public_page_content"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── product_lines ────────────────────────────────────────────────────────
// docs/09 — images/spec sheets deferred (needs Object Storage).

export const productLines = pgTable("product_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierProfileId: uuid("supplier_profile_id")
    .notNull()
    .references(() => supplierProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  hsCode: varchar("hs_code", { length: 20 }),
  unit: varchar("unit", { length: 50 }).notNull(),
  moq: integer("moq").notNull(),
  moqUnit: varchar("moq_unit", { length: 50 }).notNull(),
  priceMinUsd: real("price_min_usd"),
  priceMaxUsd: real("price_max_usd"),
  leadTimeDays: integer("lead_time_days").notNull(),
  sampleAvailable: boolean("sample_available").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── buyer_profiles ───────────────────────────────────────────────────────
// docs/06-buyer-profile-spec.md §1 + docs/09. Payment track record fields
// (on_time_payment_rate etc.) deferred — computed from deal history, which
// doesn't exist yet.

export const buyerProfiles = pgTable("buyer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  companyName: varchar("company_name", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  country: char("country", { length: 2 }),
  headquartersCity: varchar("headquarters_city", { length: 255 }),
  companySize: companySizeEnum("company_size"),
  businessRegNumber: varchar("business_reg_number", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  buyerType: text("buyer_type").array(),
  annualPurchasingVolume: varchar("annual_purchasing_volume", { length: 50 }),

  preferredSupplierCountries: char("preferred_supplier_countries", { length: 2 }).array(),
  languagesSpoken: char("languages_spoken", { length: 2 }).array(),

  primaryContactName: varchar("primary_contact_name", { length: 255 }),
  primaryContactRole: buyerContactRoleEnum("primary_contact_role"),
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
  primaryContactPhone: varchar("primary_contact_phone", { length: 50 }),

  verificationLevel: verificationLevelEnum("verification_level").notNull().default("basic"),
  completenessScore: real("completeness_score").notNull().default(0),
  profileStatus: profileStatusEnum("profile_status").notNull().default("draft"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── sourcing_requests ────────────────────────────────────────────────────
// docs/06 §2 + docs/09. `category` is free text for v0 (see supplier_profiles
// note on categories).

export const sourcingRequests = pgTable("sourcing_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerProfileId: uuid("buyer_profile_id")
    .notNull()
    .references(() => buyerProfiles.id),

  title: varchar("title", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 255 }),

  productName: varchar("product_name", { length: 255 }),
  hsCode: varchar("hs_code", { length: 20 }),
  quantityRequired: integer("quantity_required"),
  quantityUnit: varchar("quantity_unit", { length: 50 }),
  orderFrequency: orderFrequencyEnum("order_frequency"),
  estimatedAnnualVolume: integer("estimated_annual_volume"),
  qualityRequirements: text("quality_requirements"),
  requiredCertifications: text("required_certifications").array(),
  sampleRequired: boolean("sample_required"),
  sampleQuantity: integer("sample_quantity"),

  preferredSupplierTypes: text("preferred_supplier_types").array(),
  preferredSupplierCountries: char("preferred_supplier_countries", { length: 2 }).array(),
  excludedSupplierCountries: char("excluded_supplier_countries", { length: 2 }).array(),
  maxLeadTimeDays: integer("max_lead_time_days"),
  maxMoq: integer("max_moq"),
  auditRequired: boolean("audit_required"),
  privateLabelNeeded: boolean("private_label_needed"),
  oemNeeded: boolean("oem_needed"),

  targetUnitPriceUsd: real("target_unit_price_usd"),
  budgetRange: varchar("budget_range", { length: 50 }),
  dealTimeline: timestamp("deal_timeline", { withTimezone: true, mode: "date" }),

  idealSupplierDescription: text("ideal_supplier_description"),
  dealbreakers: text("dealbreakers"),

  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
  status: sourcingRequestStatusEnum("status").notNull().default("open"),
  completenessScore: real("completeness_score").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── matches ──────────────────────────────────────────────────────────────
// docs/07-matching-algorithm.md + docs/09. `source`/`injectedByUserId`/
// `adminRationale` deferred — meaningless until Match Override exists.

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierProfileId: uuid("supplier_profile_id")
    .notNull()
    .references(() => supplierProfiles.id),
  buyerProfileId: uuid("buyer_profile_id")
    .notNull()
    .references(() => buyerProfiles.id),
  sourcingRequestId: uuid("sourcing_request_id").references(() => sourcingRequests.id),

  aiScore: real("ai_score").notNull(),
  finalScore: real("final_score").notNull(),
  aiRationale: jsonb("ai_rationale").notNull(),

  supplierStatus: matchPartyStatusEnum("supplier_status").notNull().default("pending"),
  buyerStatus: matchPartyStatusEnum("buyer_status").notNull().default("pending"),
  supplierRejectionReason: matchRejectionReasonEnum("supplier_rejection_reason"),
  buyerRejectionReason: matchRejectionReasonEnum("buyer_rejection_reason"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ── deals ────────────────────────────────────────────────────────────────
// docs/08-deal-workflow.md + docs/09. `matchId` is unique — a match can
// only ever produce one deal. RFQ/Quote/Deal Room stages are defined in
// the enum but nothing in v0 writes them; see the Deals v0 plan.

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id")
    .notNull()
    .unique()
    .references(() => matches.id),
  supplierProfileId: uuid("supplier_profile_id")
    .notNull()
    .references(() => supplierProfiles.id),
  buyerProfileId: uuid("buyer_profile_id")
    .notNull()
    .references(() => buyerProfiles.id),
  stage: dealStageEnum("stage").notNull().default("messaging"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

// ── messages ─────────────────────────────────────────────────────────────
// docs/09. `attachments` is nullable — no upload flow exists yet to
// populate it (see the Deals v0 plan).

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => deals.id),
  senderUserId: uuid("sender_user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

// ── notifications ────────────────────────────────────────────────────────
// docs/21-notifications-email-spec.md §1 is the authoritative schema
// source (not duplicated into docs/09), same precedent as audit_log
// living only in docs/20 §12. `entityId` is intentionally not an FK —
// it's polymorphic (`entityType` says which table it points at).

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 60 }).notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  body: varchar("body", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 40 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SupplierProfile = typeof supplierProfiles.$inferSelect;
export type NewSupplierProfile = typeof supplierProfiles.$inferInsert;
export type ProductLine = typeof productLines.$inferSelect;
export type NewProductLine = typeof productLines.$inferInsert;
export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type NewBuyerProfile = typeof buyerProfiles.$inferInsert;
export type SourcingRequest = typeof sourcingRequests.$inferSelect;
export type NewSourcingRequest = typeof sourcingRequests.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ── verification_requests ───────────────────────────────────────────────
// docs/20-admin-ops-spec.md §3 describes a full three-tier verification
// system (registry-API lookup -> document-upload AI pre-screen -> KYB
// video call), none of which is built -- there is no admin auth/queue
// anywhere in this app yet. This table is just an AI pre-screen log: two
// nullable FKs (not one polymorphic profileId) so referential integrity
// is real, matching how `matches` already splits supplier/buyer. No
// `status` column on purpose -- adding "pending"/"flagged"/"cleared"
// would imply a review lifecycle nothing currently updates.

export const verificationRequests = pgTable("verification_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileType: text("profile_type").notNull(), // "supplier" | "buyer"
  supplierProfileId: uuid("supplier_profile_id").references(() => supplierProfiles.id),
  buyerProfileId: uuid("buyer_profile_id").references(() => buyerProfiles.id),
  triageFlags: jsonb("triage_flags").notNull(),
  triageSummary: text("triage_summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type NewVerificationRequest = typeof verificationRequests.$inferInsert;
