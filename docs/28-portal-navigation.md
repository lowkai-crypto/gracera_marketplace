# Portal Navigation (Sidebar Spec)

Defines the dashboard sidebar contents for each account context. Per
[Data Model](09-data-model.md) §3.1, this is **one shell with a top-nav
context switcher** (`[Supplier ▼]` / `[Buyer ▼]`) for dual-role accounts —
not two separate portal codebases. The tables below are "sidebar items
when Supplier context is active" and "sidebar items when Buyer context is
active."

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

---

## Not a sidebar item: RAG

RAG isn't its own nav destination — it's the engine behind **My Profile**'s
fill-in paths ("Upload a catalog," "Paste your website") and the public,
no-login Sourcing Query Tool ([03](03-system-architecture.md) §3.3), which
lives outside the portal entirely. Giving it its own slot would send users
looking for a place to "do RAG" that doesn't need to exist.

## Cross-cutting, not in either sidebar

- **Dispute Center** ([08](08-deal-workflow.md) §7) — an action inside a
  specific Deal, not a standalone list, until volume justifies one.
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
- **Data model:** add `matches` table per [09](09-data-model.md)
  (`supplier_profile_id`, `buyer_profile_id`, `sourcing_request_id`,
  `ai_score`, `final_score`, `ai_rationale` jsonb, `supplier_status`,
  `buyer_status`, `created_at`, `expires_at`).
- **Backend:** batch job running the [07](07-matching-algorithm.md)
  pipeline across active supplier profiles × open sourcing requests,
  writing `matches` rows; `GET /matches?profile_type=&profile_id=`,
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
  [08](08-deal-workflow.md).
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
  `/reviews` list on the public profile.
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
  `sent_at`, `recipient_count`).
- **Backend:** `POST /api/broadcasts` — composes + targets a buyer
  segment (reuses the same category/geography dimensions as matching),
  triggers email and a temporary recency-score boost per
  [07](07-matching-algorithm.md).
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

---

[Back to README](../README.md)
