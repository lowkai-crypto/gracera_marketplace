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
| `document_url` | string | S3 URL |
| `verified` | boolean | manually verified by admin |

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

[Back to README](../README.md)
