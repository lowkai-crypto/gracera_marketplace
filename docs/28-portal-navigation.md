# Portal Navigation (Sidebar Spec)

Defines the dashboard sidebar contents per role. Per
[Data Model](09-data-model.md) §3.1, this is **one shell with a top-nav
role switcher**, not one codebase per role — the switcher renders one
entry per role a user holds (`user_roles`) and shows that role's
`role_features` in the sidebar. The tables below are the **default seed
data** for the `supplier` and `buyer` system roles' `role_features` rows
— not a hardcoded frontend list. An admin can customize either role's
assigned features away from these defaults, or stand up an entirely new
role with its own set, via [Admin Ops](20-admin-ops-spec.md) §13.

The platform's third launch role, `admin`, gets a sidebar table below
too, for the same reason the other two do — but its items work
differently under the hood: `admin`'s portal is the internal admin
dashboard, fully speced in [Admin Ops](20-admin-ops-spec.md) §§1–13, and
each item there is gated by the internal admin-roles enum in that doc's
§1 (`super_admin`, `trust_team`, `finance_ops`, `content_mod`,
`data_analyst`) rather than by `role_features` rows — visibility varies
per internal admin account, not uniformly by holding the `admin` role.
The **Audience** column below names which internal admin role(s) see
each item.

Each item cites the doc section that defines the underlying feature. Build
status is tracked separately in [Roadmap](13-roadmap.md); this doc is IA
only, not a completion record.

---

## Supplier context

| Item | Shows | Spec |
|---|---|---|
| Dashboard | Completeness score, active matches, deals in progress, recent activity | — |
| My Profile | Company, products, certifications, target market — edit + republish | [05](05-supplier-profile-spec.md) |
| Matches | Ranked buyer introductions, score + rationale, accept/reject | [04](04-ai-agent-design.md) §2.3, §2.7 |
| Deals | RFQ → Quote → Deal Room → Closed, per deal; sample requests live here too | [08](08-deal-workflow.md) §1–2, §4 |
| Messages | In-platform inbox, pre-RFQ negotiation | [03](03-system-architecture.md) §3.6 |
| AI-Brain | Conversational advisor + "AI Growth Advisor" roadmap mode | [04](04-ai-agent-design.md) §7, §7.7 |
| Insights | Business Intelligence Brief — profile gaps, category benchmarks, growth strategy | [04](04-ai-agent-design.md) §4.2 |
| Certifications | Upload, track expiry (90/60/30-day alerts), verification status | [05](05-supplier-profile-spec.md) §1.4 |
| Visibility (AEO) | Generated Q&A pairs, factual summary, which AI engines have cited you | [04](04-ai-agent-design.md) §6 |
| Broadcasts | Announce new products/certs — boosts recency score | [04](04-ai-agent-design.md) §2.5 |
| Finance | "Get Paid Now" factoring referral, wire-transfer payment history | [08](08-deal-workflow.md) (Deal Room), [15](15-monetization.md) §4 |
| Reviews | Post-deal reviews, Verified Deal Network | [08](08-deal-workflow.md) §4 Stage 5 |
| Contacts | Additional commercial/technical/finance routing contacts | [05](05-supplier-profile-spec.md) §1.8 |
| Billing | Subscription tier | [15](15-monetization.md) |
| Settings | Account, language, notification prefs | — |

## Buyer context

| Item | Shows | Spec |
|---|---|---|
| Dashboard | Snapshot across all sourcing requests | — |
| My Profile | Buyer company profile | [06](06-buyer-profile-spec.md) §1 |
| Sourcing Requests | Create/manage — the buyer's primary artifact | [06](06-buyer-profile-spec.md) §2 |
| Matches | Ranked suppliers per sourcing request | [04](04-ai-agent-design.md) §2.3 |
| Deals | RFQ/Quote tracking, including side-by-side multi-supplier quote comparison | [08](08-deal-workflow.md) §4 Stage 2 |
| Messages | In-platform inbox | [03](03-system-architecture.md) §3.6 |
| Group Buys | Pooled-MOQ deals — lead vs. co-buyer allocation | [08](08-deal-workflow.md) §3 |
| AI-Brain | "Should I accept this counter-offer?" style advisor | [04](04-ai-agent-design.md) §7.3 |
| Price Compass | Market-rate benchmarks before negotiating | [01](01-product-requirements.md), [15](15-monetization.md) §5 |
| Insights | Sourcing request health, market intel, supplier diversification strategy | [04](04-ai-agent-design.md) §4.3 |
| Logistics | Verified Logistics landed-cost estimates | [08](08-deal-workflow.md) (Deal Room) |
| Payment & Trust | Buyer Protection escrow referral, own payment track record | [06](06-buyer-profile-spec.md) §5, [08](08-deal-workflow.md) (Deal Room) |
| Reviews | Given/received | [08](08-deal-workflow.md) §4 Stage 5 |
| Contacts | Technical/finance routing contacts | [06](06-buyer-profile-spec.md) §1.4 |
| Billing | Subscription tier | [15](15-monetization.md) |
| Settings | Account, language, notification prefs | — |

## Admin context

| Item | Shows | Audience | Spec |
|---|---|---|---|
| Dashboard | Active users, match queue depth, AI service latency (p50/p99), error rate | `super_admin` | [20](20-admin-ops-spec.md) §2 |
| Verification Queue | Pending business verifications, cert uploads, KYB sessions awaiting scheduling | `trust_team` | [20](20-admin-ops-spec.md) §3 |
| Dispute Queue | Open disputes by status, SLA countdowns, overdue cases | `trust_team` | [20](20-admin-ops-spec.md) §4 |
| Wire Transfer Queue | Pending wire confirmations, matched vs. unmatched incoming transfers | `finance_ops` | [20](20-admin-ops-spec.md) §5 |
| Match Override | Manual match injection/suppression, profile-level matching hold | `customer_success`, `trust_team` | [20](20-admin-ops-spec.md) §6 |
| Accounts | Impersonation (read-only), account suspension, subscription overrides | `customer_success` | [20](20-admin-ops-spec.md) §7 |
| Content Moderation | Flag queue, broadcast campaign approval (Phase 3+), sourcing request moderation | `content_mod` | [20](20-admin-ops-spec.md) §8 |
| Platform Metrics | Supply/demand health, matching engine performance, deal funnel, revenue, trust & safety KPIs | `data_analyst`, `super_admin` | [20](20-admin-ops-spec.md) §9 |
| Role & Feature Management | Platform roles, per-role feature assignment — the table this doc's Supplier/Buyer sections seed | `super_admin` | [20](20-admin-ops-spec.md) §13 |
| Staff Accounts | Create/edit/delete internal admin accounts and their permission level | `super_admin` | [20](20-admin-ops-spec.md) §1 |
| Audit Log | Append-only record of every admin action and automated platform decision | `super_admin` | [20](20-admin-ops-spec.md) §12 |
| Settings | Own account: password, mandatory TOTP MFA enrollment, per-queue SLA-alert notification prefs | any staff member (own account only) | [20](20-admin-ops-spec.md) §1, [12](12-security-and-trust.md) |

Certification expiry monitoring (§10) and availability signal auto-reset
(§11) are automated background jobs, not sidebar destinations — same
reasoning as leaving RAG out of the Supplier/Buyer tables above.

---

## Not a sidebar item: RAG

RAG isn't its own nav destination — it's the engine behind **My Profile**'s
fill-in paths ("Upload a catalog," "Paste your website") and the public,
no-login Sourcing Query Tool ([03](03-system-architecture.md) §3.3), which
lives outside the portal entirely. Giving it its own slot would send users
looking for a place to "do RAG" that doesn't need to exist.

## Cross-cutting, not in the Supplier/Buyer sidebars

- **Dispute Center** ([08](08-deal-workflow.md) §7) — an action inside a
  specific Deal, not a standalone list, until volume justifies one for
  suppliers/buyers. (Admins do get a standalone Dispute Queue — see
  Admin context above.)
- **Human Translator booking** ([08](08-deal-workflow.md) §10) —
  contextual inside Deal Room/Messages, not a nav item.

---

## Implementation Plans

Per-item build plans, grounded against the tables that already exist in
[`packages/db/src/schema.ts`](../packages/db/src/schema.ts) (`users`,
`supplier_profiles`, `product_lines`, `buyer_profiles`,
`sourcing_requests` — only these five are live today) versus the fuller
set speced in [09](09-data-model.md) (`matches`, `deals`, `messages`,
`rfqs`, `quotes`, `quote_line_items`, `certifications`, `disputes`,
`group_rfqs`, `group_rfq_members`, `deal_contracts`, `company_contacts`,
`reviews`, `categories` — all speced, none built yet). Phase references
are to [13](13-roadmap.md).

**Schema gaps formalized into [09](09-data-model.md)** — these four
weren't speced anywhere before this pass; they've since been added to the
data model doc and are referenced by name below:

- `subscriptions` — backs tier/billing state per role; no table existed
  despite [13](13-roadmap.md) M1.1 shipping "subscription tiers with
  offline payment support" in Phase 1. Blocks Billing and all
  Pro/Enterprise feature gates (AI-Brain, Negotiation Coach).
- `ai_brain_conversations` / `ai_brain_messages` — AI-Brain's chat
  history persistence model.
- `referrals` — logs the click/handoff for Trade Finance, Logistics, and
  Buyer Protection ("referral at Deal Room entry" per
  [08](08-deal-workflow.md)) for commission reconciliation
  ([15](15-monetization.md) §4).
- `notification_preferences` + `users.preferred_language` — storage for
  the preference controls [21](21-notifications-email-spec.md) describes.

### Shared across both contexts

#### Dashboard
- **Status:** partially built — `apps/web/src/app/onboarding/page.tsx`
  serves this role today (profile summary cards), but it's a first-run
  hub, not an ongoing-use dashboard.
- **Data model:** none new — aggregates over `matches`/`deals`/
  `sourcing_requests` once those exist.
- **Backend:** `GET /api/dashboard/summary` — counts and recent activity
  per active context; can stay client-side aggregation of existing list
  endpoints until volume makes a dedicated endpoint worth it.
- **Frontend:** split today's `/onboarding` into a first-run flow (create
  profile) and a `/dashboard` ongoing hub once Matches/Deals exist to
  summarize.
- **Depends on:** Matches, Deals.
- **Phase:** 1 (M1.1, current form) → real version rides in with Phase 2.

#### Matches
- **Status:** not built. `apps/ai-service` is a stateless single-pair
  scorer only — no `matches` table, no batch job populating it.
- **Data model:** add `matches` table per [09](09-data-model.md),
  including its `source`/`injected_by_user_id`/`admin_rationale`
  columns (needed by Match Override, Admin-only below, not just AI
  matches).
- **Backend:** batch job running the [07](07-matching-algorithm.md)
  pipeline across active supplier profiles × open sourcing requests,
  **excluding any pair in `match_suppressions` and any profile with
  `match_hold = true`** before writing candidate rows — otherwise Match
  Override (Admin-only, below) has no actual effect on what gets
  surfaced; writing `matches` rows; `GET /matches?profile_type=&profile_id=`,
  `POST /matches/{id}/accept`, `POST /matches/{id}/reject` — all already
  contracted in [10](10-api-reference.md). Match accept-by-both-parties
  auto-creates a `deals` row per that same doc.
- **Frontend:** `/matches` list, match card with score + expandable
  rationale, accept/reject actions.
- **Depends on:** at least one active supplier profile and one open
  sourcing request to score against.
- **Phase:** 1 (M1.2, daily digest) → 2 (M2.1, real-time + vector
  supplement).

#### Deals
- **Status:** not built — no `deals`/`messages`/`rfqs`/`quotes` tables
  exist yet.
- **Data model:** add `deals`, `messages`, `rfqs`, `quotes`,
  `quote_line_items` per [09](09-data-model.md); Deal Room stage also
  needs `deal_contracts`.
- **Backend:** deal auto-creation on mutual match accept; message,
  RFQ, and quote endpoints exactly as contracted in
  [10](10-api-reference.md) (`POST /deals/{id}/messages`,
  `POST /deals/{deal_id}/rfqs`, `POST /rfqs/{id}/quotes`,
  `POST /quotes/{id}/accept|counter|decline`); Deal Room referral
  triggers (trade finance, logistics, e-signature, inspection, buyer
  protection, translator) fire "at Deal Room entry" per
  [08](08-deal-workflow.md). Either party can file a dispute against the
  deal via `POST /deals/{deal_id}/disputes` ([10](10-api-reference.md),
  [08](08-deal-workflow.md) §7) — the trust-team side is Dispute Queue,
  Admin-only, below.
- **Frontend:** `/deals` list filterable by stage, `/deals/{id}` detail
  (thread, RFQ form, side-by-side quote comparison, Deal Room checklist).
- **Depends on:** Matches (a deal originates from an accepted match).
- **Phase:** messaging = 1 (M1.2); RFQ/Quote = 3 (M3.1); Deal Room = 3
  (M3.2).

#### Messages
- **Status:** not built — inbox is a view over `deals.messages`, not a
  standalone feature.
- **Data model:** `messages` table (see Deals above).
- **Backend:** `GET /api/messages` aggregating unread counts across all
  of a user's deal threads; reuses `POST /deals/{id}/messages`.
- **Frontend:** `/messages` inbox sorted by recent activity with unread
  badges, opening into the parent deal thread.
- **Depends on:** Deals.
- **Phase:** 1 (M1.2).

#### AI-Brain
- **Status:** not built — no persistent context assembly, no chat UI, no
  tier gate.
- **Data model:** `ai_brain_conversations` / `ai_brain_messages`
  ([09](09-data-model.md) §2); gated by the `subscriptions` table
  ([09](09-data-model.md) §2, §3.6).
- **Backend:** context assembly (profile + match history + deal history +
  category benchmarks, prompt-cached per [04](04-ai-agent-design.md) §7)
  in `apps/ai-service`; `apps/web` proxy route `/api/ai-brain/chat`. The
  "AI Growth Advisor" structured mode (10-question intake → roadmap) is a
  separate guided flow, not the free-form chat.
- **Frontend:** `/ai-brain` chat UI; `/ai-brain/growth-advisor` intake +
  roadmap view.
- **Depends on:** Matches + Deals (nothing to advise on without them),
  Billing (Pro/Enterprise gate).
- **Phase:** 3 (M3.2).

#### Insights
- **Status:** not built.
- **Data model:** none new for v0 — category benchmarks computed
  on-the-fly from `product_lines` + `supplier_profiles` (or
  `quotes`/`quote_line_items` on the buyer side), not a persisted table.
- **Backend:** `GET /api/insights/{profileId}` — completeness gaps +
  category percentile comparison; "Growth Strategy Engine" export
  (PDF/markdown) as a follow-on per [13](13-roadmap.md) M2.2.
- **Frontend:** `/insights` — profile health checklist, benchmark
  comparison, export button.
- **Depends on:** enough profiles in a category to benchmark against —
  cold-start dependent (Phase 0 placeholder seeding).
- **Phase:** 2 (M2.2).

#### Reviews
- **Status:** not built. `reviews` table is speced in
  [09](09-data-model.md) but not yet in `schema.ts`.
- **Data model:** add `reviews` exactly as speced (`visible` flips true
  once both parties have submitted).
- **Backend:** `POST /api/deals/{id}/reviews`, `GET /api/reviews?profile_id=`
  for public display; feeds "Verified Deal Network" per
  [13](13-roadmap.md) M2.3.
- **Frontend:** post-deal review prompt on `deal.stage = closed`,
  `/reviews` list on the public profile, with a flag action on each
  review feeding the Content Moderation flag queue (Admin-only, below —
  `flags.entity_type = review`).
- **Depends on:** Deals reaching `closed`.
- **Phase:** 1 (M1.3, basic) → 2 (M2.3, Verified Deal Network).

#### Contacts
- **Status:** not built. `company_contacts` table is speced in
  [09](09-data-model.md) but not yet in `schema.ts`.
- **Data model:** add `company_contacts` exactly as speced (polymorphic
  `profile_id` + `profile_type`, `routing_types`, `is_primary`).
- **Backend:** CRUD under `/api/supplier-profiles/{id}/contacts` and
  `/api/buyer-profiles/{id}/contacts` (max 3 additional per
  [13](13-roadmap.md) M1.1); email hidden until introduction accepted,
  matching the primary contact's existing visibility rule.
- **Frontend:** `/contacts` — primary + up to 3 additional, each with
  commercial/technical/finance routing checkboxes.
- **Depends on:** My Profile (already built for both roles).
- **Phase:** 1 (M1.1).

#### Billing
- **Status:** not built — the `subscriptions` table exists in the spec
  ([09](09-data-model.md) §2) but not yet in `schema.ts` (largest gap
  surfaced by this pass).
- **Data model:** `subscriptions` — independent record per role per
  [09](09-data-model.md) §3.6.
- **Backend:** Stripe integration ([27](27-integrations.md)) for card;
  wire-transfer confirmation queue ([20](20-admin-ops-spec.md)) for
  offline payment; 15% dual-role bundle discount logic.
- **Frontend:** `/billing` — current tier, upgrade/downgrade, payment
  method, wire instructions + status.
- **Depends on:** nothing functionally, but every Pro/Enterprise gate
  (AI-Brain, Negotiation Coach) depends on this existing first.
- **Phase:** 1 (M1.1).

#### Settings
- **Status:** partially built — sign-out exists in
  `onboarding/page.tsx`; no dedicated settings page.
- **Data model:** `users.preferred_language` and
  `notification_preferences` ([09](09-data-model.md) §2).
- **Backend:** `PATCH /api/users/me` (language, notification prefs,
  password change); "Add buyer/supplier profile" role-upgrade action per
  [09](09-data-model.md) §3.2.
- **Frontend:** `/settings` — account info, language selector,
  notification toggles, dual-role upgrade CTA.
- **Depends on:** nothing.
- **Phase:** 1 (M1.1, baseline) → 4 (M4.1, once language prefs tie into
  full i18n).

### Supplier-only

#### My Profile (supplier)
- **Status:** built — `apps/web/src/app/onboarding/supplier/page.tsx` +
  `/api/supplier-profiles` CRUD, including website-URL and edit-mode
  pre-fill. No further v0 work.

#### Certifications
- **Status:** not built. `certifications` table is speced in
  [09](09-data-model.md) but not yet in `schema.ts`.
- **Data model:** add `certifications` exactly as speced, including
  `authenticity_status` and `expiry_notified_at` jsonb.
- **Backend:** `POST /api/certifications` (file upload via the existing
  `/uploads/presign` flow), `GET/PATCH/DELETE`; scheduled job for
  90/60/30-day expiry alerts writing `expiry_notified_at` and firing the
  [21](21-notifications-email-spec.md) template.
- **Frontend:** `/certifications` list + upload form.
- **Depends on:** My Profile (built).
- **Phase:** 1 (M1.3, upload/verification) → 2 (M2.1, expiry automation).

#### Visibility (AEO)
- **Status:** not built — no AEO Agent, no generated Q&A storage.
- **Data model:** `aeo_qa_pairs` jsonb column on `supplier_profiles`
  (gap, not yet in [09](09-data-model.md)); citation tracking would need
  a referral-log table (separate gap from the AI-assistant-referral
  tracking used for the exit criteria in [13](13-roadmap.md) Phase 4).
- **Backend:** batch job running the AEO Agent
  ([04](04-ai-agent-design.md) §6) against verified supplier profiles,
  generating `FAQPage` JSON-LD injected server-side into the existing
  public `/supplier-profiles/{id}` route.
- **Frontend:** `/visibility` — generated Q&A preview, citation tracking,
  publish status.
- **Depends on:** My Profile + `verification_level ≥ verified`.
- **Phase:** 2 (M2.1).

#### Broadcasts
- **Status:** not built.
- **Data model:** new `broadcasts` table (gap, propose: `id`,
  `supplier_profile_id`, `headline`, `body`, `target_segment`,
  `review_status` [pending, approved, rejected — see Content
  Moderation, Admin-only, below], `sent_at`, `recipient_count`).
- **Backend:** `POST /api/broadcasts` — composes + targets a buyer
  segment (reuses the same category/geography dimensions as matching);
  does **not** send immediately — enters `review_status = pending` per
  [20](20-admin-ops-spec.md) §8.2 (automated + manual review for a
  sender's first 3 campaigns), and only triggers the email +
  recency-score boost ([07](07-matching-algorithm.md)) once
  `content_mod` approves.
- **Frontend:** `/broadcasts` — compose form + send history with
  open/click stats.
- **Depends on:** Matches (shares its targeting dimensions).
- **Phase:** 3 (M3.3).

#### Finance
- **Status:** not built.
- **Data model:** `referrals` table ([09](09-data-model.md) §2, shared
  with Logistics and Payment & Trust below).
- **Backend:** `POST /api/deals/{id}/referrals/trade-finance` (logs
  referral, redirects to partner) at Deal Room entry per
  [08](08-deal-workflow.md); webhook receiver for partner-reported funded
  amount.
- **Frontend:** Finance tab — trade finance referral CTA + read-only
  wire-transfer payment history (surfaces the [20](20-admin-ops-spec.md)
  wire queue data to the supplier side).
- **Depends on:** Deals reaching Deal Room stage.
- **Phase:** 3 (M3.2).

### Buyer-only

#### My Profile (buyer)
- **Status:** built — `apps/web/src/app/onboarding/buyer/page.tsx` +
  `/api/buyer-profiles` CRUD, including edit-mode pre-fill. No further
  v0 work.

#### Sourcing Requests
- **Status:** built — create/list/edit backend all exist
  (`/api/sourcing-requests`); dashboard UI is still read-only-plus-"post
  another" (edit/close UI wiring is the one remaining gap, already
  deferred from the earlier "my profile dashboard" work).

#### Group Buys
- **Status:** not built. `group_rfqs` + `group_rfq_members` tables are
  speced in [09](09-data-model.md) but not yet in `schema.ts`.
- **Data model:** add both tables exactly as speced.
- **Backend:** `POST /api/group-rfqs` (lead buyer creates, sets
  `combined_quantity` target), `POST /api/group-rfqs/{id}/join`
  (co-buyer allocates), `POST /api/group-rfqs/{id}/withdraw`; transitions
  to `rfq_issued` once MOQ is met, then reuses the standard RFQ/Quote
  endpoints against the supplier.
- **Frontend:** `/group-buys` — browse forming pools in the buyer's
  categories, join/allocate flow, lead-buyer management view.
- **Depends on:** Sourcing Requests (built), Deals/RFQ infrastructure.
- **Phase:** 4 (M4.2b).

#### Price Compass
- **Status:** not built.
- **Data model:** none new for v0 — computed on-the-fly from
  `quotes`/`quote_line_items` aggregated by category + HS code.
- **Backend:** `GET /api/price-compass?category_id=&hs_code=` returning
  a percentile price range from historical quotes.
- **Frontend:** inline widget during RFQ/Quote review, plus a standalone
  `/price-compass` lookup.
- **Depends on:** Deals/Quotes generating enough historical volume —
  not meaningfully usable until real deal flow exists.
- **Phase:** 2 (M2.3).

#### Logistics
- **Status:** not built.
- **Data model:** `referrals` table (shared with Finance above,
  `type = logistics`).
- **Backend:** `POST /api/deals/{id}/referrals/logistics` — freight
  forwarder partner quote request ([27](27-integrations.md)) at Deal
  Room entry.
- **Frontend:** Logistics tab in Deal Room — landed cost estimate form +
  partner quote results.
- **Depends on:** Deals reaching Deal Room stage.
- **Phase:** 3 (M3.2).

#### Payment & Trust
- **Status:** not built. The four tracking columns
  (`on_time_payment_rate`, `avg_days_to_payment`,
  `completed_deals_count`, `payment_disputes_count`) are already speced
  on `buyer_profiles` in [09](09-data-model.md) but not yet in
  `schema.ts`, and nothing computes them yet.
- **Data model:** add the four columns to `buyer_profiles`.
- **Backend:** scheduled job recomputing them from closed deals +
  dispute history; `POST /api/deals/{id}/referrals/buyer-protection` for
  the escrow referral (shared `referrals` table).
- **Frontend:** Payment & Trust tab — own track record (mirrors what
  suppliers see at introduction stage per [13](13-roadmap.md) M3.1) +
  escrow referral CTA in Deal Room.
- **Depends on:** `buyer_profiles` schema addition, Deals/disputes for
  real computation.
- **Phase:** 3 (M3.1, payment track record) → 3 (M3.2, buyer protection
  referral).

### Admin-only

None of this exists today — no `/admin` route, no admin tables, and
critically **no table backs the internal admin-role enum itself**
(`super_admin`, `trust_team`, `customer_success`, `finance_ops`,
`content_mod`, `data_analyst` from [20](20-admin-ops-spec.md) §1). Every
Audience restriction in the Admin context table above assumes that
enum is checkable per user; right now it isn't stored anywhere. That
makes **Staff Accounts** the actual prerequisite for the rest of this
section, regardless of build order elsewhere — nothing else here can
enforce who's allowed to see it without it.

**Schema gaps formalized into [09](09-data-model.md)** — these five
weren't speced anywhere before this pass; also included `match_hold` /
`match_hold_expires_at` on `supplier_profiles` and `buyer_profiles`,
surfaced by the same Match Override plan:

- `admin_role_assignments` — see Staff Accounts below.
- `match_suppressions` — named by [20](20-admin-ops-spec.md) §6.2, now
  with columns.
- `wire_transfers` — the wire queue's own ledger, distinct from
  `subscriptions.wire_confirmation_status`.
- `flags` — backs the Content Moderation flag queue ([20](20-admin-ops-spec.md) §8.1).
- `users.suspension_type` / `suspension_reason` — backs Account Suspension ([20](20-admin-ops-spec.md) §7.2).

#### Staff Accounts
- **Status:** not built.
- **Data model:** new `admin_role_assignments` table (`user_id` FK,
  `admin_role` enum, `created_at`; `PRIMARY KEY (user_id, admin_role)` —
  one staff member can hold more than one internal role). Deliberately
  **not** modeled on `roles`/`user_roles` ([09](09-data-model.md) §2):
  those are self-service via Role & Feature Management below, and
  granting internal admin capability needs to stay a separate, more
  locked-down action so that system can't be used to escalate into the
  admin dashboard. The first `super_admin` is bootstrapped via a
  one-time migration/seed, not through the UI (avoids a chicken-and-egg
  lockout). Granting the first `admin_role_assignments` row to a user
  also requires `users.mfa_enabled = true` first
  ([09](09-data-model.md) §2) — TOTP MFA is mandatory for admin
  accounts per [20](20-admin-ops-spec.md) §1, not an opt-in setting.
- **Backend:** `POST/DELETE /api/admin/staff/{userId}/roles` —
  `super_admin` only, and rejected if the target user hasn't completed
  MFA enrollment; `POST /api/users/me/mfa/enroll` (self-service TOTP
  setup, needed before anyone can be granted a role here).
- **Frontend:** `/admin/staff`; MFA enrollment itself happens on the
  Admin Settings page below, not here (an admin enrolls their own MFA;
  `super_admin` only grants the role).
- **Depends on:** nothing — but every other item in this section
  depends on this existing first.
- **Phase:** not milestoned in [13](13-roadmap.md); this whole section
  postdates that doc. Build first regardless.

#### Dashboard (Platform Health)
- **Status:** not built.
- **Data model:** none new for the numbers themselves — aggregates over
  `users` and `matches` (once it exists); AI service latency and error
  rate need an APM/logging pipeline, not a Postgres table (infra gap,
  out of scope for a schema change).
- **Backend:** `GET /api/admin/dashboard/health`.
- **Frontend:** `/admin` overview page.
- **Depends on:** Staff Accounts (authorization).
- **Phase:** 1 (rides with M1.1's "Admin impersonation").

#### Verification Queue
- **Status:** not built.
- **Data model:** none new — reads `supplier_profiles`/`buyer_profiles`
  where `verification_level = basic` and `certifications` where
  `verified = false`. KYB queue ([20](20-admin-ops-spec.md) §3.3) is
  Phase 4+, deferred with it.
- **Backend:** `GET /api/admin/verification-queue`,
  `POST /api/admin/verification-queue/{id}/approve|reject`.
- **Frontend:** `/admin/verification`.
- **Depends on:** Staff Accounts, Certifications (Supplier-only, above).
- **Phase:** 1 (M1.1, business registration verification) → 2 (M2.1,
  cert expiry ties in).

#### Dispute Queue
- **Status:** not built. `disputes` table is speced in
  [09](09-data-model.md) but not yet in `schema.ts`.
- **Data model:** add `disputes` exactly as speced.
- **Backend:** `GET /api/admin/disputes?status=`,
  `POST /api/admin/disputes/{id}/assign|recommend|resolve`, evidence
  ZIP export ([20](20-admin-ops-spec.md) §4).
- **Frontend:** `/admin/disputes` — list + detail with SLA countdown.
- **Depends on:** Staff Accounts, Deals (a dispute is filed against one).
- **Phase:** 3 (M3.1).

#### Wire Transfer Queue
- **Status:** not built.
- **Data model:** `wire_transfers` ([09](09-data-model.md) §2) —
  reconciles against `subscriptions.wire_confirmation_status`.
- **Backend:** `POST /api/admin/wire-transfers` (`finance_ops` manual
  entry), auto-match by reference + amount,
  `POST /api/admin/wire-transfers/{id}/reconcile`.
- **Frontend:** `/admin/wire-transfers`.
- **Depends on:** Staff Accounts, Billing (Shared, above).
- **Phase:** 1 (M1.1, "subscription tiers with offline payment support").

#### Match Override
- **Status:** not built.
- **Data model:** `match_suppressions`, `matches.source`/
  `injected_by_user_id`/`admin_rationale`, and `match_hold` /
  `match_hold_expires_at` on both `supplier_profiles` and
  `buyer_profiles` ([09](09-data-model.md) §2, §6.3).
- **Backend:** `POST /api/admin/matches/inject` (writes a `matches` row
  with `source = admin_injected` and the admin's rationale — this is
  the same table the Matches plan above populates, not a separate
  mechanism),
  `POST /api/admin/match-suppressions`,
  `PATCH /api/admin/profiles/{id}/match-hold`.
- **Frontend:** `/admin/match-override`.
- **Depends on:** Staff Accounts, Matches (Shared, above).
- **Phase:** not explicitly milestoned in [13](13-roadmap.md) — bundle
  with the Matches build-out.

#### Accounts
- **Status:** not built.
- **Data model:** `users.suspension_type` / `suspension_reason`
  ([09](09-data-model.md) §2); subscription overrides reuse the
  existing `subscriptions` table. Impersonation needs a distinct
  read-only session/token type that structurally can't submit a
  mutating request, not just a frontend banner.
- **Backend:** `/admin/users/{userId}/impersonate` (issues the
  read-only token), `POST /api/admin/users/{id}/suspend`,
  `PATCH /api/admin/subscriptions/{id}` (override).
- **Frontend:** `/admin/users/{id}` detail + persistent impersonation
  banner.
- **Depends on:** Staff Accounts, Billing (for §7.3 overrides).
- **Phase:** 1 (M1.1 explicitly names "Admin impersonation").

#### Content Moderation
- **Status:** not built.
- **Data model:** `flags` ([09](09-data-model.md) §2), including
  `entity_type = review` — reviews (Shared, above) are user-generated
  text and need to be flaggable like any other content; broadcast
  campaign approval ([20](20-admin-ops-spec.md) §8.2) uses the
  `review_status` column on the (also not-yet-built) `broadcasts` table
  from the Supplier-only plan above.
- **Backend:** `GET /api/admin/flags`,
  `POST /api/admin/flags/{id}/dismiss|warn|remove|escalate`;
  auto-suppress logic (≥3 spam flags → `match_hold = true`, reusing
  Match Override's column).
- **Frontend:** `/admin/flags`.
- **Depends on:** Staff Accounts; auto-suppression depends on Match
  Override existing.
- **Phase:** 1 (M1.3, "basic spam/fraud controls") → 3 (M3.3, broadcast
  approval, once Broadcasts exists).

#### Platform Metrics
- **Status:** not built.
- **Data model:** none new — aggregate queries over `users`, `matches`,
  `deals`, `subscriptions`, `disputes` as each is built; AI inference
  cost and match queue depth come from the ai-service's own metrics,
  not Postgres.
- **Backend:** `GET /api/admin/metrics/{panel}` — one per
  [20](20-admin-ops-spec.md) §9 panel (supply-demand, matching,
  deal-funnel, revenue, trust-safety).
- **Frontend:** `/admin/metrics`.
- **Depends on:** Staff Accounts, and effectively everything else in
  this doc — this panel is a lagging indicator, not a data source.
- **Phase:** spans every phase's exit criteria in
  [13](13-roadmap.md); build each metric incrementally as its
  underlying feature ships, not as one batch.

#### Role & Feature Management
- **Status:** designed, not built — `roles`/`features`/`role_features`/
  `user_roles` are speced ([09](09-data-model.md) §2) but not yet in
  `schema.ts`. This doc's own Supplier/Buyer/Admin tables above are
  exactly the seed data these tables would hold.
- **Data model:** the four tables from [09](09-data-model.md) §2.
- **Backend:** CRUD exactly as speced in
  [20](20-admin-ops-spec.md) §13.
- **Frontend:** `/admin/roles`.
- **Depends on:** Staff Accounts (`super_admin` only) — nothing else;
  this can exist before the roles it manages have real portals behind
  them, since it's the mechanism that generates those portals' sidebars.
- **Phase:** not yet milestoned in [13](13-roadmap.md) — this whole
  RBAC generalization postdates that doc.

#### Audit Log
- **Status:** not built. Schema is fully speced inline in
  [20](20-admin-ops-spec.md) §12 (treated as its authoritative source,
  not duplicated into [09](09-data-model.md)) but not yet in `schema.ts`.
- **Data model:** `audit_log` exactly as speced in
  [20](20-admin-ops-spec.md) §12.
- **Backend:** every admin mutation above writes here as it's built —
  wire the logging hook into each item at build time, don't bolt it on
  after; `GET /api/admin/audit-log?entity_type=&actor_id=` for browsing.
- **Frontend:** `/admin/audit-log`.
- **Depends on:** Staff Accounts. Works from day one with nothing to
  show; its value scales with how many other admin actions exist to log.
- **Phase:** 1 — ship its write path alongside Accounts (§7), the
  first admin mutation to exist.

#### Settings
- **Status:** not built. Every other item in this section is a queue
  or a management panel gated by `admin_role_assignments` — this is
  the one self-service item, parallel to Supplier/Buyer's Settings.
- **Data model:** `users.mfa_enabled` / `mfa_secret_encrypted`
  ([09](09-data-model.md) §2); `notification_preferences` (Shared,
  above) extended with per-queue alert types (e.g. "dispute SLA about
  to breach," "wire transfer queue backlog") for staff accounts.
- **Backend:** `POST /api/users/me/mfa/enroll` /
  `POST /api/users/me/mfa/verify` (TOTP setup, shared with any future
  non-admin MFA use); `PATCH /api/users/me` for password and
  notification prefs (same endpoint Supplier/Buyer Settings uses).
- **Frontend:** `/admin/settings` — MFA enrollment (blocking: an
  `admin_role_assignments` row cannot be granted until this is
  complete, per Staff Accounts above), password change, SLA-alert
  toggles.
- **Depends on:** nothing to view the page, but every other Admin item
  is gated on this existing first, transitively through Staff Accounts.
- **Phase:** 1 — MFA enrollment must exist before Staff Accounts can
  grant the first real role.

---

[Back to README](../README.md)
