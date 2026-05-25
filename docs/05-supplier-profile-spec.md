# Supplier Profile Specification

A complete, well-filled supplier profile is the foundation of good AI matching. This document defines every field, its purpose, and how it affects matching.

---

## 1. Profile Sections

### 1.1 Company Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `company_name` | string | Yes | Legal business name |
| `display_name` | string | Yes | Brand / trade name (may differ from legal) |
| `country` | string (ISO 3166) | Yes | Country of registration |
| `headquarters_city` | string | Yes | |
| `year_established` | integer | No | Used in credibility scoring |
| `company_size` | enum | Yes | Micro (<10), Small (10–49), Medium (50–249), Large (250+) |
| `business_registration_number` | string | Yes | Used for verification |
| `website` | URL | No | |
| `logo_url` | URL | No | S3-stored image |
| `cover_image_url` | URL | No | Banner image for profile page |
| `tagline` | string (120 chars) | Yes | One-line summary for search results |
| `company_description` | text | Yes | 200–1,000 words; AI-readable business overview |

---

### 1.2 Products & Services

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `supplier_type` | enum[] | Yes | Manufacturer, Distributor, Trading Company, Service Provider, Agent/Rep |
| `categories` | taxonomy[] | Yes | Up to 5 categories from Gracera category tree |
| `product_lines` | ProductLine[] | Yes | At least 1; see ProductLine sub-schema below |
| `services` | Service[] | No | If service-based; see Service sub-schema |
| `custom_manufacturing` | boolean | No | Accepts OEM/ODM orders |
| `private_label` | boolean | No | Accepts private label orders |

**ProductLine sub-schema:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `description` | text | Yes |
| `hs_code` | string | No | HS/HTS code for international trade |
| `unit` | string | Yes | e.g., "case", "kg", "unit", "sqft" |
| `moq` | integer | Yes | Minimum order quantity |
| `moq_unit` | string | Yes | Unit for MOQ |
| `price_range_usd` | {min, max} | No | Indicative per-unit price range |
| `lead_time_days` | integer | Yes | Production + shipping lead time |
| `images` | URL[] | No | Up to 10 product images |
| `spec_sheet_url` | URL | No | Technical data sheet |
| `sample_available` | boolean | Yes | |
| `sample_lead_time_days` | integer | No | |

---

### 1.3 Capabilities & Capacity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `annual_revenue_range` | enum | No | <$500K, $500K–$2M, $2M–$10M, $10M–$50M, $50M+ |
| `production_capacity_monthly` | text | No | Free text: "50,000 units/month" |
| `factory_size_sqm` | integer | No | |
| `quality_control_process` | text | No | Description of QC methods |
| `rd_capability` | boolean | No | In-house R&D |

---

### 1.4 Certifications & Compliance

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `certifications` | Certification[] | No | See Certification sub-schema |
| `export_licenses` | string[] | No | Country-specific export license numbers |
| `compliance_standards` | enum[] | No | ISO 9001, ISO 14001, FSSC 22000, CE, FDA, RoHS, Fair Trade, etc. |

**Certification sub-schema:**

| Field | Type |
|-------|------|
| `name` | string |
| `issuing_body` | string |
| `certificate_number` | string |
| `expiry_date` | date |
| `document_url` | URL (S3) |

---

### 1.5 Target Market & Ideal Customer

> This section is critical for AI matching. The more specific, the better.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `target_geographies` | country[] | Yes | Countries/regions supplier wants to sell into |
| `target_customer_types` | enum[] | Yes | Retailer, Distributor, Wholesaler, OEM, Government, E-commerce Seller, Restaurant/Foodservice, Direct Consumer Brand, Other |
| `ideal_customer_description` | text | Yes | 100–500 words: who is the perfect buyer? What size, industry, buying behavior? |
| `preferred_deal_types` | enum[] | Yes | Annual contract, Spot purchase, Trial order, Distributor agreement |
| `preferred_payment_terms` | enum[] | No | Net 30, Net 60, LC, TT in advance, etc. |
| `preferred_incoterms` | enum[] | No | EXW, FOB, CIF, DDP, etc. |
| `languages_spoken` | language[] | Yes | Languages the team can conduct business in |

---

### 1.6 Existing Customers & References

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `notable_customers` | string[] | No | Public names only; boosts credibility |
| `export_markets_active` | country[] | No | Markets currently selling into |
| `references_available` | boolean | No | Willing to provide references on request |

---

### 1.7 Contact Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `primary_contact_name` | string | Yes | |
| `primary_contact_title` | string | Yes | |
| `primary_contact_email` | email | Yes | Hidden from public until match accepted |
| `primary_contact_phone` | string | No | Hidden until match accepted |
| `preferred_contact_method` | enum | No | Email, Phone, WhatsApp, WeChat, Platform Message |
| `response_time_hours` | integer | No | Committed response time to inquiries |

---

## 2. Profile Completeness Score

Completeness drives match priority. Incomplete profiles surface lower in results.

| Section | Weight |
|---------|--------|
| Company Identity | 15% |
| Products & Services | 30% |
| Certifications | 10% |
| Target Market & Ideal Customer | 30% |
| Capabilities | 10% |
| References | 5% |

A profile below 60% completeness shows a nudge banner and is deprioritized in AI matching.

---

## 3. Verification Levels

| Level | Requirements | Badge |
|-------|-------------|-------|
| **Basic** | Email verified | Email badge |
| **Verified Business** | Business registration number checked | Verified badge |
| **Certified** | At least 1 uploaded and reviewed certification | Certified badge |
| **Premium** | Video call verification + 2 references confirmed | Premium badge |

---

[Back to README](../README.md)
