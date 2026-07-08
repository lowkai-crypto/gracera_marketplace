import { z } from "zod";

const countryCode = z.string().length(2);

// ── Supplier profile ────────────────────────────────────────────────────

export const ProductLineSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  hsCode: z.string().optional(),
  unit: z.string().min(1),
  moq: z.number().int().positive(),
  moqUnit: z.string().min(1),
  priceMinUsd: z.number().nonnegative().optional(),
  priceMaxUsd: z.number().nonnegative().optional(),
  leadTimeDays: z.number().int().positive(),
  sampleAvailable: z.boolean(),
});

const SupplierProfileFields = {
  companyName: z.string().min(1),
  displayName: z.string().min(1),
  country: countryCode,
  headquartersCity: z.string().min(1),
  yearEstablished: z.number().int().optional(),
  companySize: z.enum(["micro", "small", "medium", "large"]),
  businessRegNumber: z.string().min(1),
  tagline: z.string().max(120),
  description: z.string().min(1),
  supplierType: z.array(z.string()).min(1),
  categories: z.array(z.string()).min(1).max(5),
  targetGeographies: z.array(countryCode).min(1),
  targetCustomerTypes: z.array(z.string()).min(1),
  idealCustomerDescription: z.string().min(1),
  preferredDealTypes: z.array(z.string()).min(1),
  languagesSpoken: z.array(z.string()).min(1),
  annualRevenueRange: z.string().optional(),
  productionCapacityMonthly: z.string().optional(),
  qualityControlProcess: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  notableCustomers: z.array(z.string()).optional(),
  referencesAvailable: z.boolean().optional(),
  primaryContactName: z.string().min(1),
  primaryContactRole: z.enum([
    "owner_ceo",
    "export_sales_director",
    "sales_manager",
    "quality_compliance",
    "operations_manager",
    "other",
  ]),
  primaryContactEmail: z.string().email(),
  primaryContactPhone: z.string().optional(),
};

export const CreateSupplierProfileSchema = z
  .object({
    companyName: SupplierProfileFields.companyName,
    country: SupplierProfileFields.country,
  })
  .extend(z.object(SupplierProfileFields).partial().shape)
  .extend({ productLines: z.array(ProductLineSchema).optional() });

export const UpdateSupplierProfileSchema = z
  .object(SupplierProfileFields)
  .partial()
  .extend({
    profileStatus: z.enum(["draft", "active", "paused", "deleted"]).optional(),
    productLines: z.array(ProductLineSchema).optional(),
  });

// ── Buyer profile ───────────────────────────────────────────────────────

const BuyerProfileFields = {
  companyName: z.string().min(1),
  displayName: z.string().min(1),
  country: countryCode,
  headquartersCity: z.string().min(1),
  companySize: z.enum(["micro", "small", "medium", "large"]),
  businessRegNumber: z.string().min(1),
  industry: z.string().min(1),
  buyerType: z.array(z.string()).min(1),
  annualPurchasingVolume: z.string().optional(),
  preferredSupplierCountries: z.array(countryCode).optional(),
  languagesSpoken: z.array(z.string()).min(1),
  primaryContactName: z.string().min(1),
  primaryContactRole: z.enum([
    "owner_founder",
    "cpo",
    "procurement_manager",
    "category_manager",
    "supply_chain_director",
    "operations_manager",
    "other",
  ]),
  primaryContactEmail: z.string().email(),
  primaryContactPhone: z.string().optional(),
};

export const CreateBuyerProfileSchema = z
  .object({
    companyName: BuyerProfileFields.companyName,
    country: BuyerProfileFields.country,
  })
  .extend(z.object(BuyerProfileFields).partial().shape);

export const UpdateBuyerProfileSchema = z.object(BuyerProfileFields).partial().extend({
  profileStatus: z.enum(["draft", "active", "paused", "deleted"]).optional(),
});

// ── Sourcing request ────────────────────────────────────────────────────

const SourcingRequestFields = {
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  productName: z.string().min(1),
  hsCode: z.string().optional(),
  quantityRequired: z.number().int().positive(),
  quantityUnit: z.string().min(1),
  orderFrequency: z.enum(["one_time", "monthly", "quarterly", "annual", "ongoing"]),
  estimatedAnnualVolume: z.number().int().optional(),
  qualityRequirements: z.string().optional(),
  requiredCertifications: z.array(z.string()).optional(),
  sampleRequired: z.boolean(),
  sampleQuantity: z.number().int().optional(),
  preferredSupplierTypes: z.array(z.string()).optional(),
  preferredSupplierCountries: z.array(countryCode).optional(),
  excludedSupplierCountries: z.array(countryCode).optional(),
  maxLeadTimeDays: z.number().int().optional(),
  maxMoq: z.number().int().optional(),
  auditRequired: z.boolean().optional(),
  privateLabelNeeded: z.boolean().optional(),
  oemNeeded: z.boolean().optional(),
  targetUnitPriceUsd: z.number().nonnegative().optional(),
  budgetRange: z.string().optional(),
  dealTimeline: z.coerce.date().optional(),
  idealSupplierDescription: z.string().min(1),
  dealbreakers: z.string().optional(),
  expiresAt: z.coerce.date(),
};

export const CreateSourcingRequestSchema = z
  .object({
    buyerProfileId: z.string().uuid(),
    title: SourcingRequestFields.title,
    category: SourcingRequestFields.category,
    expiresAt: SourcingRequestFields.expiresAt,
  })
  .extend(z.object(SourcingRequestFields).partial().shape);

export const UpdateSourcingRequestSchema = z.object(SourcingRequestFields).partial().extend({
  status: z.enum(["open", "paused", "closed", "fulfilled"]).optional(),
});
