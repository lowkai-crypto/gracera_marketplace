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
| `role` | enum | **legacy** — supplier, buyer, both, admin. Superseded by `user_roles` (below), which supports holding any number of roles instead of a fixed 4-value set. Retained during migration; see §3 Migration Note. Other docs (05, 06, 10, 22, etc.) still reference this fixed enum and have not yet been swept to `user_roles` — treat `user_roles` as the source of truth going forward. |
| `preferred_language` | char(2) | ISO 639-1; drives email + UI language per [11](11-internationalization.md) |
| `created_at` | timestamp | |
| `last_login_at` | timestamp | |
| `status` | enum | active, suspended, deleted |
| `suspension_type` | enum | nullable; soft_suspend, hard_suspend, profile_under_review — set only when `status = suspended`; drives the specific enforcement behavior in [20](20-admin-ops-spec.md) §7.2 |
| `suspension_reason` | text | nullable; free text, logged but never shown to the user (generic notice shown instead per [20](20-admin-ops-spec.md) §7.2) |
| `mfa_enabled` | boolean | default false. **Mandatory, not optional, for any user holding an `admin_role_assignments` row** ([20](20-admin-ops-spec.md) §1, [12](12-security-and-trust.md)); optional for everyone else. The admin dashboard must refuse to serve a session where this is false for a staff account. |
| `mfa_secret_encrypted` | string | nullable; TOTP secret, encrypted at rest — never returned by any API response |

---

### roles

The platform's role registry. Seeded with three system roles at launch —
`supplier`, `buyer`, `admin` — but not limited to them: an admin with the
Role & Feature Management capability ([20](20-admin-ops-spec.md) §13) can
create additional roles later without an engineering change.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `slug` | varchar(40) UNIQUE | e.g. `supplier`, `buyer`, `admin` |
| `name` | varchar(80) | display name |
| `description` | text | |
| `is_system` | boolean | true for `supplier`/`buyer`/`admin` — seeded at launch, cannot be deleted (core to the matching engine, dashboard context switcher, and auth bootstrapping); false for roles created later |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### features

Each row is one addressable capability/destination — in practice, one
sidebar item from [28](28-portal-navigation.md). Features are code-defined
(a new feature ships with the route + backend that implements it and a
migration inserting its row); admins assign existing features to roles,
they don't invent net-new ones from the UI.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `key` | varchar(60) UNIQUE | e.g. `matches`, `deals`, `ai_brain`, `certifications` |
| `name` | varchar(80) | display name shown in the sidebar |
| `description` | text | |
| `category` | varchar(60) | sidebar grouping |
| `route` | varchar(120) | frontend path this feature resolves to, e.g. `/matches` |
| `created_at` | timestamp | |

---

### role_features

Join table — which features render in a role's sidebar. The
[28](28-portal-navigation.md) Supplier-context and Buyer-context tables
are the **default** seed data for the `supplier` and `buyer` rows here;
an admin can add or remove rows to customize any role's portal, including
the seeded system roles, via [20](20-admin-ops-spec.md) §13.

| Column | Type | Notes |
|--------|------|-------|
| `role_id` | UUID FK → roles | |
| `feature_id` | UUID FK → features | |
| `sort_order` | integer | sidebar position within its category |
| `created_at` | timestamp | |

`PRIMARY KEY (role_id, feature_id)`

---

### user_roles

Join table — replaces the fixed `users.role` enum. A user can hold any
number of roles simultaneously (at launch, realistically 0–3: supplier,
buyer, admin), and switches between them via the dashboard context
switcher (§3.1).

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID FK → users | |
| `role_id` | UUID FK → roles | |
| `created_at` | timestamp | when this role was granted |

`PRIMARY KEY (user_id, role_id)`

**Migration note:** backfill from the legacy `users.role` enum as:
`supplier` → one `user_roles` row (`supplier`); `buyer` → one row
(`buyer`); `both` → two rows (`supplier` + `buyer`); `admin` → one row
(`admin`). The legacy column can be dropped once every reader of it
(auth token issuance, onboarding routing, the docs listed above) has
moved to `user_roles`.

---

### admin_role_assignments

Which internal admin capabilities ([20](20-admin-ops-spec.md) §1) a
staff member holds — deliberately **not** modeled on `roles`/
`user_roles` above. Those two are self-service via
[20](20-admin-ops-spec.md) §13 (Role & Feature Management); granting
internal admin capability stays a separate, more locked-down action so
that self-service system can never be used to escalate into the admin
dashboard. Holding the platform `admin` role (via `user_roles`) and
holding an `admin_role_assignments` row are independent checks — see §3.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID FK → users | |
| `admin_role` | enum | super_admin, trust_team, customer_success, finance_ops, content_mod, data_analyst |
| `created_at` | timestamp | |

`PRIMARY KEY (user_id, admin_role)` — one staff member can hold more
than one internal role.

**Bootstrap note:** the first `super_admin` row is created via a
one-time migration/seed, not through the admin UI this table backs —
otherwise no one could ever grant the first one.

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
| `primary_contact_role` | enum | owner_ceo, export_sales_director, sales_manager, quality_compliance, operations_manager, other |
| `linkedin_verified_title` | string | nullable; job title pulled from LinkedIn OAuth |
| `availability_status` | enum | available, limited, fully_booked |
| `next_available_date` | date | nullable; set when fully_booked |
| `availability_updated_at` | timestamp | resets to limited if not updated within 14 days |
| `match_hold` | boolean | default false; when true, excluded from all AI matching without suspending the account ([20](20-admin-ops-spec.md) §6.3) |
| `match_hold_expires_at` | timestamp | nullable; set when `match_hold = true` for a temporary hold |
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
| `primary_contact_role` | enum | owner_founder, cpo, procurement_manager, category_manager, supply_chain_director, operations_manager, other |
| `linkedin_verified_title` | string | nullable; job title pulled from LinkedIn OAuth |
| `on_time_payment_rate` | float | nullable; computed from deal history |
| `avg_days_to_payment` | float | nullable; computed from deal history |
| `completed_deals_count` | integer | default 0 |
| `payment_disputes_count` | integer | default 0 |
| `match_hold` | boolean | default false; when true, excluded from all AI matching without suspending the account ([20](20-admin-ops-spec.md) §6.3) |
| `match_hold_expires_at` | timestamp | nullable; set when `match_hold = true` for a temporary hold |
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
| `supplier_rejection_reason` | enum | nullable; wrong_category, wrong_volume, already_connected, other — set only when `supplier_status = rejected`; feeds [07](07-matching-algorithm.md) §8 feedback signals |
| `buyer_rejection_reason` | enum | nullable; same values, set only when `buyer_status = rejected` |
| `source` | enum | ai, admin_injected — see [20](20-admin-ops-spec.md) §6.1 |
| `injected_by_user_id` | UUID FK → users | nullable; set only when `source = admin_injected` |
| `admin_rationale` | text | nullable; the admin's custom rationale ([20](20-admin-ops-spec.md) §6.1 requires this be shown to both parties — rendered on the match card in place of `ai_rationale` when `source = admin_injected`) |
| `created_at` | timestamp | when match was generated |
| `expires_at` | timestamp | match card expires if not acted on |

The batch matching job ([07](07-matching-algorithm.md)) must exclude any
pair present in `match_suppressions`, and any profile with
`match_hold = true` (on `supplier_profiles` or `buyer_profiles`), before
writing candidate rows here — otherwise Match Override (§6) has no
actual effect on what the AI surfaces.

---

### match_suppressions

Prevents a specific supplier–buyer pair from ever being matched, per
[20](20-admin-ops-spec.md) §6.2. The matching engine checks this table
before surfacing any introduction between the two IDs, in either
direction.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_profile_id` | UUID FK | |
| `buyer_profile_id` | UUID FK | |
| `reason` | text | |
| `created_by_user_id` | UUID FK → users | admin who created the suppression |
| `created_at` | timestamp | |

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
| `document_url` | string | Oracle Cloud Object Storage URL (S3-compatible) |
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

### flags

Backs the Content Moderation flag queue ([20](20-admin-ops-spec.md)
§8.1). Users flag profiles, messages, forum posts (Phase 4), and
broadcast campaigns; all land here regardless of entity type.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `entity_type` | enum | supplier_profile, buyer_profile, message, forum_post, broadcast, review |
| `entity_id` | UUID | polymorphic — FK target depends on `entity_type` |
| `reporting_user_id` | UUID FK → users | |
| `category` | enum | spam, inappropriate_content, impersonation, false_information, other |
| `description` | text | |
| `status` | enum | open, dismissed, warned, content_removed, escalated |
| `sla_due_at` | timestamp | set on creation per the category's SLA in [20](20-admin-ops-spec.md) §8.1 |
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
| `document_url` | string | Oracle Cloud Object Storage URL (S3-compatible) of signed PDF |
| `created_at` | timestamp | |
| `signed_at` | timestamp | nullable |

---

### company_contacts

Secondary contacts registered under a supplier or buyer profile. Used for routing RFQs, technical questions, and finance queries to the right person.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `profile_id` | UUID | FK to `supplier_profiles.id` or `buyer_profiles.id` |
| `profile_type` | enum | supplier, buyer |
| `name` | string | |
| `contact_role` | enum | owner_ceo, export_sales_director, sales_manager, quality_compliance, procurement_manager, category_manager, supply_chain_director, finance, other |
| `email` | email | Hidden until introduction accepted |
| `phone` | string | nullable |
| `linkedin_url` | string | nullable |
| `linkedin_verified_title` | string | nullable |
| `routing_types` | text[] | commercial, technical, finance — determines which inbound messages are routed here |
| `is_primary` | boolean | true for the main registered contact |
| `created_at` | timestamp | |

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

### categories

Hierarchical category tree used for matching, SEO page generation, and HS code alignment. See [Category Taxonomy](16-category-taxonomy.md) for the full taxonomy.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `name` | varchar(120) | Display name (English) |
| `slug` | varchar(120) UNIQUE | URL-safe identifier, e.g. `sauces-condiments` |
| `parent_id` | integer FK | NULL for Level 1 verticals |
| `level` | smallint | 1 = Vertical, 2 = Category, 3 = Subcategory |
| `vertical_code` | char(3) | V01–V15; populated only on Level 1 rows |
| `hs_chapters` | text[] | HS tariff chapters this node maps to |
| `is_priority_vertical` | boolean | TRUE for the 6 launch priority verticals |
| `active` | boolean | FALSE = deprecated; new registrations cannot select |
| `created_at` | timestamp | |

```sql
CREATE INDEX ON categories (parent_id);
CREATE INDEX ON categories (slug);
```

**FK references from other tables:**
- `supplier_profiles.categories` — `integer[]` of Level 2 or Level 3 IDs (up to 5 per supplier)
- `buyer_profiles.industry` — single Level 1 or Level 2 ID
- `sourcing_requests.category_id` — single Level 2 or Level 3 ID

---

### subscriptions

Backs tier/billing state for both roles independently — see §3.6.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `role_id` | UUID FK → roles | one record per held role, never one shared record |
| `tier` | enum | free, pro, enterprise |
| `status` | enum | active, past_due, canceled |
| `payment_method` | enum | card, wire |
| `current_period_end` | timestamp | |
| `wire_confirmation_status` | enum | nullable; pending, confirmed, rejected — set only when `payment_method = wire`; reconciled via the [20](20-admin-ops-spec.md) wire transfer queue |
| `dual_role_bundle` | boolean | true if this tier was purchased under the 15% dual-role bundle discount (§3.6) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### wire_transfers

The wire queue's own ledger ([20](20-admin-ops-spec.md) §5) — distinct
from `subscriptions.wire_confirmation_status`, which just reflects the
outcome. This table is the reconciliation record `finance_ops` works
from: one row per reported inbound transfer, matched or not.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `subscription_id` | UUID FK → subscriptions | nullable until matched |
| `payment_reference` | string | e.g. `GRC-2026-00412` |
| `amount_received` | decimal | |
| `expected_amount` | decimal | |
| `currency` | char(3) | ISO 4217 |
| `received_date` | date | |
| `status` | enum | matched, mismatch, unmatched |
| `entered_by_user_id` | UUID FK → users | `finance_ops` staff member who logged it |
| `created_at` | timestamp | |

---

### ai_brain_conversations

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `role_id` | UUID FK → roles | coaching is context-specific per §3.4 |
| `mode` | enum | chat, growth_advisor |
| `title` | string | auto-generated from first message |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### ai_brain_messages

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `conversation_id` | UUID FK → ai_brain_conversations | |
| `role` | enum | user, assistant |
| `body` | text | |
| `context_snapshot` | jsonb | nullable; the prompt-cached profile/match/deal context block used for this turn, per [04](04-ai-agent-design.md) §7 |
| `created_at` | timestamp | |

---

### referrals

Logs the click/handoff for every partner referral surfaced at Deal Room
entry ([08](08-deal-workflow.md)), for UX tracking and commission
reconciliation ([15](15-monetization.md) §4).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `deal_id` | UUID FK | |
| `initiated_by_user_id` | UUID FK | |
| `referral_type` | enum | trade_finance, logistics, buyer_protection, esignature, inspection, translator |
| `partner` | string | e.g. `docusign`, `qima`, the factoring provider name |
| `status` | enum | clicked, in_progress, completed, declined |
| `external_reference` | string | nullable; partner-side ID used for webhook reconciliation |
| `commission_amount_usd` | decimal | nullable; populated when the partner reports a funded/completed transaction |
| `created_at` | timestamp | |
| `completed_at` | timestamp | nullable |

---

### notification_preferences

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | UNIQUE |
| `email_digest_frequency` | enum | realtime, daily, weekly, off |
| `channel_prefs` | jsonb | per-notification-type opt-in/out, e.g. `{"new_match": true, "new_message": true, "broadcast": false}` — types defined in [21](21-notifications-email-spec.md) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

## 3. Multi-Role Accounts

Roles are not a fixed 4-value enum on `users` — they're rows in
`user_roles` (§2), each pointing at a `roles` entry. At launch there are
three system roles — `supplier`, `buyer`, `admin` — but the model doesn't
assume exactly two or three: a user can hold any number of roles, and
[20](20-admin-ops-spec.md) §13 lets an admin add roles beyond these three
later without a schema change. A user holding the `supplier` and `buyer`
roles has two independent profiles under one login — a `supplier_profile`
and a `buyer_profile` — each created, managed, verified, and matched
independently. `admin` is different in kind: it doesn't have a profile or
a matching identity, it grants access to the internal admin dashboard
([20](20-admin-ops-spec.md)), gated additionally by the internal
admin-roles enum in that doc's §1 (`super_admin`, `trust_team`, etc.) —
holding the platform `admin` role and holding a specific internal
capability are two separate checks, so granting `admin` doesn't
automatically hand out every admin capability.

### 3.1 Context Switcher

The platform maintains an `active_role_id` per session, stored
server-side and toggled via a persistent control in the top navigation.
The switcher renders one entry per row the user holds in `user_roles` —
not a hardcoded two-item dropdown — so it grows automatically as roles
are added. The sidebar for the active role is whatever `role_features`
(§2) currently assigns to it; [28](28-portal-navigation.md)'s Supplier
and Buyer tables are the default seed data for those two roles, not a
hardcoded frontend list.

Switching context does not interrupt active deals — each role's deals
continue independently. A user in a Deal Room under the `supplier` role
sees that deal there; their `buyer`-role deals are accessible by
switching.

### 3.2 Registration Flow

A user can hold more than one role in two ways:

1. **At signup:** Select every role that applies (e.g. "I'm both a
   supplier and a buyer") → the onboarding wizard runs each selected
   role's profile builder in turn. Each builder can be skipped and
   completed later. (`admin` is never self-selected at signup — it's
   granted internally.)
2. **Role upgrade:** A user can add another role later via Settings →
   "Add [role] profile," listing whichever roles they don't already hold.
   Adding a role does not touch the profiles tied to roles they already
   have.

### 3.3 Matching Engine Behavior

The matching engine treats each profile in complete isolation:
- A match run for the **supplier profile** uses only `supplier_profile` data; the user's `buyer_profile` is not considered.
- A match run for a **sourcing request** uses only `buyer_profile` and `sourcing_request` data; the user's `supplier_profile` is not considered.

**Self-match suppression:** If the engine would surface a user's own `supplier_profile` as a match for their own `buyer_profile` sourcing request (valid edge case for distributors who buy and sell in the same category), that pair is automatically suppressed and logged.

### 3.4 Deals

A user holding both `supplier` and `buyer` may simultaneously hold active
deals under each:
- Deals as a **supplier**: responding to buyer RFQs, managing Deal Room as the selling party
- Deals as a **buyer**: issuing RFQs to other suppliers, managing Deal Room as the buying party

Each deal is associated with exactly one role at creation — that role cannot be changed mid-deal. Negotiation Coach coaching is role-specific (supplier coaching for supplier deals, buyer coaching for buyer deals).

### 3.5 Notifications

All notifications arrive in a unified inbox, each tagged with the role
they belong to:

```
[Supplier] New match: TechCorp is sourcing aluminum enclosures
[Buyer] Quote received from ShinwaChem on your sourcing request
```

The inbox can be filtered by role (All, plus one filter per role the user
holds).

### 3.6 Subscriptions

Subscriptions are managed per role independently via the `subscriptions`
table (§2): a user holds one row per role they've subscribed
(`role_id = supplier`'s row, `role_id = buyer`'s row, etc.), each with its
own `tier` and billing state. A **Dual-Role Bundle** discount of 15%
applies (`dual_role_bundle = true`) specifically when subscribing to Pro
on both the `supplier` and `buyer` roles simultaneously — it's a named
pricing SKU for that one combination, not a general N-role discount.
Enterprise dual-role pricing is negotiated.

---

[Back to README](../README.md)
