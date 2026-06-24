# Data Model

Core entity relationships for the Gracera Marketplace platform.

---

## 1. Entity Relationship Diagram (simplified)

```
┌──────────┐         ┌──────────────┐        ┌───────────────────┐
│   User   │──1:N───▶│  SupplierProfile│      │  BuyerProfile     │
│          │──1:N───▶│               │        │                   │
└──────────┘         └──────────────┘         └──────┬────────────┘
                             │                        │
                             │                        │ 1:N
                             │                 ┌──────▼─────────────┐
                             │                 │  SourcingRequest   │
                             │                 └──────┬─────────────┘
                             │                        │
                      ┌──────▼────────────────────────▼─────┐
                      │              Match                   │
                      │  (supplier_profile_id, buyer_id,     │
                      │   sourcing_request_id, score, status)│
                      └──────────────────┬──────────────────┘
                                         │
                                  ┌──────▼──────┐
                                  │    Deal     │
                                  └──────┬──────┘
                                         │ 1:N
                                  ┌──────▼──────┐
                                  │  Message    │
                                  └─────────────┘
                                         │ 1:N
                                  ┌──────▼──────┐
                                  │  RFQ/Quote  │
                                  └─────────────┘
```

---

## 2. Core Tables

### users

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `email` | string UNIQUE | |
| `email_verified` | boolean | |
| `password_hash` | string | nullable if SSO |
| `auth_provider` | enum | local, google, linkedin |
| `role` | enum | supplier, buyer, both, admin |
| `created_at` | timestamp | |
| `last_login_at` | timestamp | |
| `status` | enum | active, suspended, deleted |

---

### supplier_profiles

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `company_name` | string | |
| `display_name` | string | |
| `country` | char(2) | ISO 3166-1 alpha-2 |
| `headquarters_city` | string | |
| `year_established` | integer | nullable |
| `company_size` | enum | micro, small, medium, large |
| `business_reg_number` | string | |
| `tagline` | string | |
| `description` | text | |
| `supplier_type` | text[] | |
| `categories` | integer[] | FK → categories.id |
| `target_geographies` | char(2)[] | |
| `target_customer_types` | text[] | |
| `ideal_customer_description` | text | |
| `languages_spoken` | char(2)[] | ISO 639-1 |
| `verification_level` | enum | basic, verified, certified, premium |
| `completeness_score` | float | 0.0–1.0 |
| `profile_status` | enum | draft, active, paused, deleted |
| `availability_status` | enum | available, limited, fully_booked |
| `next_available_date` | date | nullable; set when fully_booked |
| `availability_updated_at` | timestamp | resets to limited if not updated within 14 days |
| `embedding` | vector(1536) | pgvector — cosine similarity index (HNSW); computed from `ideal_customer_description` + product line descriptions; recomputed on material profile change |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### product_lines

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_profile_id` | UUID FK | |
| `name` | string | |
| `description` | text | |
| `hs_code` | string | nullable |
| `unit` | string | |
| `moq` | integer | |
| `moq_unit` | string | |
| `price_min_usd` | decimal | nullable |
| `price_max_usd` | decimal | nullable |
| `lead_time_days` | integer | |
| `sample_available` | boolean | |
| `created_at` | timestamp | |

---

### buyer_profiles

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `company_name` | string | |
| `display_name` | string | |
| `country` | char(2) | |
| `headquarters_city` | string | |
| `company_size` | enum | |
| `business_reg_number` | string | |
| `industry` | integer | FK → categories.id |
| `buyer_type` | text[] | |
| `annual_purchasing_volume` | enum | nullable |
| `preferred_supplier_countries` | char(2)[] | |
| `languages_spoken` | char(2)[] | |
| `verification_level` | enum | |
| `completeness_score` | float | |
| `profile_status` | enum | |
| `on_time_payment_rate` | float | nullable; computed from deal history |
| `avg_days_to_payment` | float | nullable; computed from deal history |
| `completed_deals_count` | integer | default 0 |
| `payment_disputes_count` | integer | default 0 |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### sourcing_requests

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `buyer_profile_id` | UUID FK | |
| `title` | string | |
| `description` | text | |
| `category_id` | integer FK | |
| `product_name` | string | |
| `hs_code` | string | nullable |
| `quantity_required` | integer | |
| `quantity_unit` | string | |
| `order_frequency` | enum | |
| `required_certifications` | text[] | |
| `preferred_supplier_countries` | char(2)[] | |
| `max_lead_time_days` | integer | nullable |
| `max_moq` | integer | nullable |
| `ideal_supplier_description` | text | |
| `dealbreakers` | text | nullable |
| `expires_at` | date | |
| `status` | enum | open, paused, closed, fulfilled |
| `completeness_score` | float | |
| `embedding` | vector(1536) | pgvector — computed from `ideal_supplier_description`; used in Stage 1b vector search |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### matches

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_profile_id` | UUID FK | |
| `buyer_profile_id` | UUID FK | |
| `sourcing_request_id` | UUID FK | nullable |
| `ai_score` | float | 0.0–100.0 |
| `final_score` | float | weighted composite |
| `ai_rationale` | jsonb | dimension scores + summary |
| `supplier_status` | enum | pending, accepted, rejected |
| `buyer_status` | enum | pending, accepted, rejected |
| `created_at` | timestamp | when match was generated |
| `expires_at` | timestamp | match card expires if not acted on |

---

### deals

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `match_id` | UUID FK | |
| `supplier_profile_id` | UUID FK | |
| `buyer_profile_id` | UUID FK | |
| `stage` | enum | messaging, rfq_issued, quote_submitted, deal_room, closed, abandoned |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |
| `closed_at` | timestamp | nullable |

---

### messages

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `deal_id` | UUID FK | |
| `sender_user_id` | UUID FK | |
| `body` | text | |
| `attachments` | jsonb | [{filename, url, size}] |
| `created_at` | timestamp | |
| `read_at` | timestamp | nullable |

---

### rfqs

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `deal_id` | UUID FK | |
| `issued_by_user_id` | UUID FK | |
| `description` | text | |
| `quantity` | integer | |
| `unit` | string | |
| `delivery_location` | text | |
| `required_delivery_date` | date | |
| `incoterms` | enum | nullable |
| `payment_terms` | enum | nullable |
| `valid_until` | date | |
| `status` | enum | open, responded, declined, expired |
| `created_at` | timestamp | |

---

### quotes

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `rfq_id` | UUID FK | |
| `submitted_by_user_id` | UUID FK | |
| `currency` | char(3) | ISO 4217 |
| `incoterms` | enum | |
| `payment_terms` | enum | |
| `lead_time_days` | integer | |
| `validity_date` | date | |
| `notes` | text | nullable |
| `status` | enum | submitted, accepted, countered, declined |
| `created_at` | timestamp | |

---

### quote_line_items

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `quote_id` | UUID FK | |
| `description` | string | |
| `quantity` | integer | |
| `unit` | string | |
| `unit_price` | decimal | |
| `total_price` | decimal | computed |

---

### certifications

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_profile_id` | UUID FK | |
| `name` | string | |
| `issuing_body` | string | |
| `certificate_number` | string | |
| `expiry_date` | date | |
| `document_url` | string | MinIO URL (S3-compatible) |
| `verified` | boolean | manually verified by admin |
| `authenticity_status` | enum | uploaded, digitally_verified, trust_team_verified |
| `verified_by` | enum | issuer_api, trust_team, unverified |
| `expiry_notified_at` | jsonb | {d90: timestamp, d60: timestamp, d30: timestamp} |

---

### disputes

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `deal_id` | UUID FK | |
| `filed_by_user_id` | UUID FK | |
| `category` | enum | non_delivery, wrong_specification, quality_issue, payment_refused, certification_mismatch, other |
| `description` | text | |
| `evidence_urls` | jsonb | [{filename, url}] |
| `status` | enum | filed, under_review, resolved, referred |
| `trust_team_recommendation` | text | nullable |
| `resolution_notes` | text | nullable |
| `created_at` | timestamp | |
| `resolved_at` | timestamp | nullable |

---

### group_rfqs

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `lead_buyer_profile_id` | UUID FK | |
| `supplier_profile_id` | UUID FK | |
| `status` | enum | forming, rfq_issued, quote_accepted, deal_room, closed, cancelled |
| `combined_quantity` | integer | sum of all co-buyer allocations |
| `created_at` | timestamp | |

### group_rfq_members

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `group_rfq_id` | UUID FK | |
| `buyer_profile_id` | UUID FK | |
| `allocation_quantity` | integer | |
| `is_lead` | boolean | |
| `confirmed_at` | timestamp | nullable |
| `withdrawn_at` | timestamp | nullable |

---

### deal_contracts

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `deal_id` | UUID FK | |
| `template_type` | enum | purchase_order, distribution_agreement, nda, sample_agreement |
| `status` | enum | draft, sent, signed, voided |
| `esignature_provider` | enum | docusign, hellosign |
| `provider_envelope_id` | string | external reference |
| `document_url` | string | MinIO URL (S3-compatible) of signed PDF |
| `created_at` | timestamp | |
| `signed_at` | timestamp | nullable |

---

### reviews

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `deal_id` | UUID FK | |
| `reviewer_user_id` | UUID FK | |
| `reviewee_profile_id` | UUID FK | supplier or buyer profile |
| `rating` | integer | 1–5 |
| `body` | text | |
| `created_at` | timestamp | |
| `visible` | boolean | hidden until both parties submit |

---

## 3. Dual-Role Accounts

When `users.role = 'both'`, the user holds two independent profiles under one login: a `supplier_profile` and a `buyer_profile`. Each is created, managed, verified, and matched independently.

### 3.1 Context Switcher

The platform maintains an `active_context` per session, stored server-side and toggled via a persistent control in the top navigation:

| `active_context` | Dashboard shown | Actions available |
|-----------------|-----------------|-------------------|
| `supplier` | Supplier matches, introductions, deals as supplier, profile analytics | Respond to introductions, manage product lines, issue broadcasts, use Growth Strategy Engine |
| `buyer` | Buyer matches, sourcing requests, deals as buyer, price compass | Post sourcing requests, accept introductions as buyer, issue RFQs, use Negotiation Coach as buyer |

Switching context does not interrupt active deals — each context's deals continue independently. A user in a Deal Room as a supplier sees that deal under the supplier context; their buyer-context deals are accessible by switching.

### 3.2 Registration Flow

A user can become dual-role in two ways:

1. **At signup:** Select "I'm both a supplier and a buyer" → the onboarding wizard runs the supplier profile builder first, then the buyer profile builder. Each builder can be skipped and completed later.
2. **Role upgrade:** A user registered as supplier or buyer can add the second role via Settings → "Add [buyer/supplier] profile." The existing profile is unchanged; a new profile is created.

### 3.3 Matching Engine Behavior

The matching engine treats each profile in complete isolation:
- A match run for the **supplier profile** uses only `supplier_profile` data; the user's `buyer_profile` is not considered.
- A match run for a **sourcing request** uses only `buyer_profile` and `sourcing_request` data; the user's `supplier_profile` is not considered.

**Self-match suppression:** If the engine would surface a user's own `supplier_profile` as a match for their own `buyer_profile` sourcing request (valid edge case for distributors who buy and sell in the same category), that pair is automatically suppressed and logged.

### 3.4 Deals

A dual-role user may simultaneously hold active deals in both contexts:
- Deals as a **supplier**: responding to buyer RFQs, managing Deal Room as the selling party
- Deals as a **buyer**: issuing RFQs to other suppliers, managing Deal Room as the buying party

Each deal is associated with exactly one role at creation — that role cannot be changed mid-deal. The Negotiation Coach coaching is context-specific (supplier coaching for supplier deals, buyer coaching for buyer deals).

### 3.5 Notifications

All notifications arrive in a unified inbox, each tagged with the context they belong to:

```
[Supplier] New match: TechCorp is sourcing aluminum enclosures
[Buyer] Quote received from ShinwaChem on your sourcing request
```

The inbox can be filtered by context (All / Supplier / Buyer).

### 3.6 Subscriptions

Subscriptions are managed per role independently. A dual-role user holds two subscription records — one governing supplier features, one governing buyer features. A **Dual-Role Bundle** discount of 15% applies when subscribing to Pro on both sides simultaneously. Enterprise dual-role pricing is negotiated.

---

[Back to README](../README.md)
