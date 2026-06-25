# Buyer Profile Specification

Buyers maintain a company profile (persistent) and can create multiple sourcing requests (per-need). Both feed the AI matching engine.

---

## 1. Buyer Company Profile

### 1.1 Company Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `company_name` | string | Yes | Legal name |
| `display_name` | string | Yes | Trade name |
| `country` | string (ISO 3166) | Yes | |
| `headquarters_city` | string | Yes | |
| `company_size` | enum | Yes | Micro, Small, Medium, Large |
| `business_registration_number` | string | Yes | Verification |
| `industry` | taxonomy | Yes | Gracera industry taxonomy |
| `website` | URL | No | |
| `logo_url` | URL | No | |
| `company_description` | text | Yes | 100–500 words |
| `annual_purchasing_volume_usd` | enum | No | <$100K, $100K–$500K, $500K–$2M, $2M–$10M, $10M+ |
| `buyer_type` | enum[] | Yes | Retailer, Distributor, Wholesaler, OEM, Reseller, E-commerce Seller, Restaurant/Foodservice, Government/Institutional, End User / SME |

---

### 1.2 Purchasing Preferences

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `preferred_supplier_countries` | country[] | No | Geographic preference for sourcing |
| `excluded_supplier_countries` | country[] | No | Countries to exclude (sanctions, policy) |
| `preferred_certifications` | enum[] | No | Certifications required in general |
| `preferred_payment_terms` | enum[] | No | Net 30, Net 60, LC, etc. |
| `preferred_incoterms` | enum[] | No | EXW, FOB, DDP, etc. |
| `languages_spoken` | language[] | Yes | Languages the buyer team speaks |

---

### 1.3 Contact

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `primary_contact_name` | string | Yes | |
| `primary_contact_role` | enum | Yes | `owner_founder`, `cpo`, `procurement_manager`, `category_manager`, `supply_chain_director`, `operations_manager`, `other` |
| `primary_contact_email` | email | Yes | Hidden until introduction accepted |
| `primary_contact_phone` | string | No | Hidden until introduction accepted |
| `preferred_contact_method` | enum | No | |
| `linkedin_url` | URL | No | Used to pull verified job title via LinkedIn OAuth |
| `linkedin_verified_title` | string | System | Job title pulled from LinkedIn — displayed as "LinkedIn verified" on match card |

**Why `primary_contact_role` matters:** Suppliers can see whether they're reaching the CPO with full authority or a coordinator before crafting their opening message. The AI-Brain uses this alongside `company_size` to coach suppliers on the right approach.

### 1.4 Additional Contacts

Buyer companies can register up to 2 additional contacts beyond the primary:

| Routing type | Who to register | When used |
|-------------|----------------|----------|
| `technical` | Technical lead / QA contact | Supplier has spec or certification questions |
| `finance` | Finance / AP contact | Supplier has invoice or payment term questions |

Additional contacts are revealed to a matched supplier after the introduction is accepted.

---

## 2. Sourcing Request

A Sourcing Request is a time-bounded, category-specific procurement need. Buyers can have multiple open sourcing requests simultaneously. Each one triggers independent AI matching.

### 2.1 Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Short summary: "Sourcing: Korean hot sauce, 500 cases/mo" |
| `category` | taxonomy | Yes | Gracera category tree, up to 3 levels deep |
| `description` | text | Yes | 100–1,000 words. The more detail, the better AI matches. |
| `status` | enum | System | Open, Paused, Closed, Fulfilled |
| `created_at` | datetime | System | |
| `expires_at` | date | Yes | When the need is no longer active |

---

### 2.2 Product / Service Requirements

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `product_name` | string | Yes | What they're looking for |
| `hs_code` | string | No | If buyer knows the code |
| `quantity_required` | integer | Yes | |
| `quantity_unit` | string | Yes | cases, kg, units, etc. |
| `order_frequency` | enum | Yes | One-time, Monthly, Quarterly, Annual, Ongoing |
| `estimated_annual_volume` | integer | No | In the same unit as `quantity_unit` |
| `quality_requirements` | text | No | Spec description, grade, standards |
| `required_certifications` | enum[] | No | Must-have certifications from supplier |
| `sample_required` | boolean | Yes | |
| `sample_quantity` | integer | No | |

---

### 2.3 Supplier Requirements

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `preferred_supplier_types` | enum[] | No | Manufacturer, Distributor, Trading Company |
| `preferred_supplier_countries` | country[] | No | |
| `excluded_supplier_countries` | country[] | No | |
| `max_lead_time_days` | integer | No | |
| `max_moq` | integer | No | Upper bound on MOQ they'll accept |
| `preferred_incoterms` | enum[] | No | |
| `audit_required` | boolean | No | Factory audit before order |
| `private_label_needed` | boolean | No | |
| `oem_needed` | boolean | No | |

---

### 2.4 Deal Parameters

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `target_unit_price_usd` | float | No | Budget per unit (used in matching, not shown publicly) |
| `budget_range` | enum | No | <$10K, $10K–$50K, $50K–$200K, $200K+ (per order) |
| `preferred_payment_terms` | enum[] | No | |
| `deal_timeline` | date | No | When they need first delivery |
| `contract_type_preferred` | enum[] | No | Spot, Annual, Distributor agreement |

---

### 2.5 Ideal Supplier Description

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `ideal_supplier_description` | text | Yes | 100–500 words. Describe the perfect supplier for this need in plain language. This is the primary AI matching input. |
| `dealbreakers` | text | No | What would disqualify a supplier? |

---

## 3. Sourcing Request Completeness Score

| Section | Weight |
|---------|--------|
| Product/service requirements | 35% |
| Supplier requirements | 20% |
| Deal parameters | 15% |
| Ideal supplier description | 30% |

Requests below 50% completeness are flagged with a prompt to add more detail before publishing.

---

## 4. Buyer Verification Levels

| Level | Requirements | Benefit |
|-------|-------------|---------|
| **Basic** | Email verified | Can browse; cannot message suppliers |
| **Verified Business** | Business registration checked | Full messaging access |
| **Active Buyer** | At least 1 completed deal on platform | Trusted Buyer badge; bumped in supplier match results |
| **Trusted Buyer** | 3+ completed deals, on-time payment rate > 90% | Full payment track record shown to suppliers; priority introduction queue |

---

## 5. Platform Payment Track Record

Once a buyer completes at least one deal on-platform, Gracera generates a **Payment Track Record** visible to suppliers at the introduction stage — after the supplier views the buyer's public profile and before they accept or decline.

| Signal | Description |
|--------|-------------|
| `on_time_payment_rate` | % of deals where final payment was confirmed within agreed payment terms |
| `avg_days_to_payment` | Average days from "Goods received" milestone to "Final payment sent" milestone |
| `completed_deals_count` | Total deals closed on-platform |
| `payment_disputes_count` | Number of payment-related disputes filed against this buyer |

Buyers with fewer than 3 completed deals display a **"New Buyer"** badge rather than metrics. The Payment Track Record creates a strong incentive for buyers to pay on time — and gives suppliers a meaningful signal when evaluating an introduction.

**Optional credit bureau integration:** Buyers can consent to a lookup via Dun & Bradstreet or Creditsafe, which adds a **"Business Credit: Verified"** badge. Opt-in only; requires buyer consent and is processed by the third party.

---

## 6. Privacy — Contact Information Visibility

Buyer contact details (email, phone) are **never shown** in public profiles or search results. They are only revealed to a matched supplier after both parties accept the introduction.

Buyer sourcing request budget and price targets are **never shown** to suppliers — they are used only by the AI matching engine.

---

[Back to README](../README.md)
