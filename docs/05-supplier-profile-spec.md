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
| `availability_status` | enum | No | Available, LimitedAvailability, FullyBooked |
| `next_available_date` | date | No | Required when status is FullyBooked |

#### Availability Signal

Suppliers are prompted weekly to update their availability status. If not updated within 14 days, the status auto-resets to `LimitedAvailability`. The signal is:
- Shown on the public profile page
- Used as a soft boost in matching — buyers with a `deal_timeline` within 60 days see `Available` suppliers ranked higher
- Available as a filter on the browse/search page ("Available Now")

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
| `authenticity_status` | enum | Uploaded, DigitallyVerified, TrustTeamVerified |
| `verified_by` | enum | IssuerAPI, TrustTeam, Unverified |

**Certification Expiry Management:**
- Automated alerts sent at 90, 60, and 30 days before `expiry_date`
- Expired certifications are excluded from matching filters requiring them and marked "Expired" on the public profile
- Buyers who accepted introductions based on a certification that has since lapsed are notified
- Uploading a renewed certificate document reactivates the certification status

**Document Authenticity:**
Where the issuing body provides a public verification API (SGS, Bureau Veritas, TÜV, BSI, NSF, QIMA), the platform queries it and marks the certificate `DigitallyVerified`. For other issuers, a Gracera trust team member manually reviews the uploaded document before the `Certified` profile badge is awarded.

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
| `primary_contact_role` | enum | Yes | `owner_ceo`, `export_sales_director`, `sales_manager`, `quality_compliance`, `operations_manager`, `other` |
| `primary_contact_email` | email | Yes | Hidden from public until match accepted |
| `primary_contact_phone` | string | No | Hidden until match accepted |
| `preferred_contact_method` | enum | No | Email, Phone, WhatsApp, WeChat, Platform Message |
| `response_time_hours` | integer | No | Committed response time to inquiries |
| `linkedin_url` | URL | No | Used to pull verified job title via LinkedIn OAuth |
| `linkedin_verified_title` | string | System | Job title pulled from LinkedIn — displayed as "LinkedIn verified" on profile |

**Why `contact_role` matters:** Buyers can see whether they're reaching an owner with full authority, a sales manager, or a quality contact before they write their first message. The AI-Brain uses this to coach buyers on how to approach the conversation.

### 1.8 Additional Contacts

Companies can register up to 3 additional contacts beyond the primary, each assigned a routing type:

| Routing type | Who to register | When they receive messages |
|-------------|----------------|--------------------------|
| `commercial` | Sales Manager / Export Director | RFQs, quote requests, pricing discussions |
| `technical` | Quality / Compliance Manager | Certification questions, spec clarifications, audit requests |
| `finance` | Finance / Accounts contact | Payment terms, invoice queries |

When an inbound RFQ or message arrives, the platform routes it to the contact whose `routing_types` matches the message type. If no specialist contact is registered, all messages go to the primary contact.

Additional contacts are visible on the profile after a match is accepted — buyers can see who to address for commercial vs. technical questions.

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

## 4. White-Glove Onboarding Service

For suppliers with limited digital familiarity — particularly high-quality manufacturers in emerging markets — Gracera offers an assisted onboarding service where a trained specialist builds the profile on the supplier's behalf.

### 4.1 Requesting the Service

| Entry point | Trigger |
|------------|---------|
| At registration | Supplier selects "Help me set up my profile" instead of the self-serve wizard |
| Post-registration | Settings → "Request profile setup help" (available to paid subscribers) |
| Outbound invitation | When the Prospecting Agent identifies a high-value off-platform supplier, the invitation email includes a white-glove onboarding offer |

**Pricing:** $199 one-time setup fee; included at no extra charge in annual Pro subscriptions.

### 4.2 Session Flow

**Step 1 — Intake (async)**

Supplier receives a short intake form:
- Company name, country, primary category
- Preferred session language
- Documents to upload (catalog PDF, brochures, certification files, product photos)
- Preferred session time (calendar link, 3 time slots provided)

**Step 2 — Onboarding Session (30–60 minutes, video or phone)**

A Gracera specialist conducts a structured interview (recorded with supplier consent for internal QA):

| Topic | Key questions |
|-------|--------------|
| Products & services | What do you make? Key variants, materials, grades? |
| Capacity | Monthly production capacity? Custom / OEM / private label capability? |
| Pricing | Typical price range per unit? What drives variance? |
| MOQ & lead times | Minimum order? Time from order to shipment? |
| Target markets | Current export countries? Desired new markets? |
| Ideal customer | Distributor, retailer, OEM buyer — who is your best fit? |
| Certifications | Which do you hold? Documents reviewed live. |
| References | 1–2 contactable customer references available? |
| Contact preferences | Who handles buyer inquiries? Committed response time? |

**Step 3 — Profile Build (within 24 hours of session)**

- All profile fields populated from session notes
- Catalog and brochure documents processed via RAG auto-population (same pipeline as self-serve)
- Product photos uploaded and associated with product lines
- Certification documents uploaded and queued for verification
- **Completeness target: ≥ 85%** (vs. ~55% for typical self-serve day-one profiles)

**Step 4 — Supplier Review (48-hour window)**

Supplier receives a preview link to the draft profile and can:
- Approve as-is → profile publishes immediately
- Request specific edits via a structured comment form → specialist makes changes within 24 hours
- Request one follow-up call (included per engagement)

**Step 5 — Publish & First Match**

On publish, the AI match run triggers immediately. The specialist monitors the first match digest and emails the supplier about any high-score introductions to act on within 48 hours.

### 4.3 Specialist Standards

| Requirement | Detail |
|------------|--------|
| Category certification | Specialist must hold an internal Gracera certification for the supplier's primary vertical before conducting sessions independently |
| Language | Session conducted in supplier's preferred business language; translation assistance available for unsupported languages |
| Quality tracking | Specialist-completed profiles are tracked at 30, 60, and 90 days for match acceptance rate and deal conversion rate — used as a specialist performance metric |

### 4.4 Internal Tooling (Admin)

Specialists use a dedicated queue in the admin interface:
- Scheduled sessions with intake form submissions and uploaded documents
- Split-screen profile builder (session notes on left, profile fields on right)
- RAG trigger button (uploads catalog → auto-populates relevant fields)
- Supplier communication thread
- Completion checklist and sign-off step before the supplier review link is sent

---

## 5. Supplier Activation Flow (0 → 1)

The activation goal for a new supplier is their **first introduction accepted** — a real buyer who wants to talk to them. Every design decision in the onboarding flow is oriented toward reaching this moment as fast as possible. A supplier who doesn't see a match in their first session rarely returns.

### 5.1 Registration → First Match (Target: < 1 hour)

| Step | What happens | Design principle |
|------|-------------|-----------------|
| **1. Catalog upload prompt** | Immediately after registration, before showing the profile form, offer a catalog/brochure upload. RAG auto-population fills 70%+ of profile fields from the document. | Never show a blank form. Let AI do the heavy lifting first. |
| **2. Guided profile wizard** | Step-by-step wizard covers the highest-impact fields. Each step shows a live match counter: *"Adding your ideal customer description unlocks ~180 additional matches in your category."* | Progress feels rewarding; every field has a visible payoff. |
| **3. Completeness gate** | Profile below 60% completeness cannot be published. The wizard does not let users skip to publishing without reaching the threshold. | Protect match quality — a sparse profile generates poor matches and erodes trust in the platform. |
| **4. Benchmark nudge** | After profile save: *"You're in the bottom 40% for certification coverage in your category. Adding RoHS would unlock 210 additional buyers."* Drawn from real category benchmark data. | Specific numbers, not vague encouragement. |
| **5. First match surfaced** | Top 3–5 matches surfaced immediately after publish. Never zero — if the algorithm cannot find a strong match, surface the closest available with an explanation of the gap. | Silence kills activation. Seeing real potential buyers is the moment the supplier believes the platform works. |
| **6. Introduction coaching** | When first match appears, AI-Brain surfaces a Decision-Maker Coaching Card: who the buyer is, their authority level, what to lead with in the first message. | Remove the "what do I say?" friction that stops suppliers from acting on a match. |

### 5.2 No-Introduction Safety Net

If no introduction is accepted within 72 hours of first match:

> *"Your profile has been viewed 8 times this week. Here's what the top suppliers in your category have that you don't yet: [specific gap list]. Fixing these would move you into the top 20%."*

This is not a generic nudge — it is derived from actual benchmark comparison between this supplier's profile and the top performers in their category on the platform. The goal is to give the supplier a concrete action, not a reassurance.

### 5.3 Activation Failure Modes

| Failure mode | Cause | Fix |
|-------------|-------|-----|
| Zero matches after publish | Profile too sparse; hard filters exclude all candidates | Completeness gate at 60%; RAG upload prompt; wizard nudge |
| Match shown but no message sent | Supplier doesn't know how to approach | Decision-maker coaching card before first message |
| Message sent, no reply within 48h | Buyer unresponsive | "Nudge the other party" option; AI-Brain surfaces next-best match |
| Introduction accepted but deal stalls | No coaching at RFQ/quote stage | Negotiation Coach activates at quote submission |

---

[Back to README](../README.md)
