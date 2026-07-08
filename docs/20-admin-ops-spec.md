# Admin & Operations Spec

How Gracera's internal team manages the platform day-to-day: trust & safety workflows, moderation queues, customer success tooling, and operator controls.

---

## 1. Admin Roles & Permissions

| Role | Access |
|------|--------|
| `super_admin` | All capabilities; can create/delete other admin accounts |
| `trust_team` | Verification queues, dispute review, profile review, account suspension |
| `customer_success` | Impersonation (read-only), subscription management, support tickets, manual match override |
| `finance_ops` | Wire transfer confirmation queue, invoice management, refunds |
| `content_mod` | Flag queue, community forums (Phase 4), broadcast campaign approval |
| `data_analyst` | Read-only access to platform analytics, intelligence report data pipeline |

Admin accounts require TOTP MFA (mandatory, not optional). All admin actions are logged to an append-only audit trail with actor, timestamp, entity ID, and before/after state.

---

## 2. Admin Dashboard — Overview Panels

The admin dashboard (`/admin`) is a separate Next.js route group, protected by role-based middleware. It exposes:

| Panel | Audience | Key metrics displayed |
|-------|----------|----------------------|
| Platform Health | `super_admin` | Active users (24h), match queue depth, AI service latency (p50/p99), error rate |
| Verification Queue | `trust_team` | Pending business verifications, pending cert uploads, KYB sessions awaiting scheduling |
| Dispute Queue | `trust_team` | Open disputes by status, SLA countdowns, overdue cases |
| Wire Transfer Queue | `finance_ops` | Pending wire confirmations, matched vs. unmatched incoming transfers |
| Flag Queue | `content_mod` | User-reported profiles, messages, and forum posts |
| Match Override | `customer_success`, `trust_team` | Manual match injection / suppression |
| Subscription Management | `customer_success`, `finance_ops` | Active subscriptions, upcoming renewals, failed payments |
| Impersonation | `customer_success` | Read-only view of any supplier or buyer account |
| Role & Feature Management | `super_admin` | Platform roles, per-role feature assignment (§13) |

---

## 3. Verification Queue

### 3.1 Business Registration Verification

Workflow for the `trust_team` when a supplier or buyer submits for "Verified Business" status:

```
[User submits business registration number + country]
        │
[Platform calls registry API (async)]
        │
        ├── API confirms → auto-approved → badge issued → user notified
        │
        ├── API returns no match → queued for manual review
        │
        └── API unavailable (country not covered) → queued for manual review
```

**Manual review checklist:**
- Business name matches registration document
- Registration number matches
- Country of incorporation matches
- Registration is active (not dissolved/struck off)
- SIC/NAICS code consistent with profile categories (soft check — flag only)

**SLA:** Manual review completed within **2 business days**. Queue sorted by submission time; overdue items highlighted in orange (> 1 business day) / red (> 2 business days).

### 3.2 Certification Upload Queue

Two-pass review (see also [docs/12-security-and-trust.md §4](12-security-and-trust.md)):

**Pass 1 — AI pre-screening** (automatic, < 5 minutes):
- Layout and font consistency check
- Issuer name/logo cross-reference against known issuing bodies
- Expiry date extraction and format validation
- AI flags suspected forgeries (confidence score surfaced to trust team)

**Pass 2 — Manual review** (trust team, for non-API-verified certs):
- Admin sees original document, AI pre-screening result, and confidence score
- Actions: Approve → badge issued | Reject with reason | Escalate (suspected forgery → account investigation)

**Issuer API path** (no queue entry created):
- For issuers with public verification APIs (SGS, Bureau Veritas, TÜV, BSI, NSF, QIMA), the system calls the API directly
- On confirmed: "Digitally Verified" badge issued immediately; no queue entry
- On API error: falls through to manual review queue

### 3.3 KYB Queue (Phase 4+)

KYB is scheduled via an internal calendar tool:

1. `trust_team` receives KYB request → assigns to a specialist
2. Specialist schedules video call via Calendly embed (or equivalent) in the admin panel
3. Video call completed → specialist fills structured checklist:
   - Business registration document ✓/✗
   - Proof of address ✓/✗
   - Owner photo ID ✓/✗
   - Reference 1 contacted ✓/✗
   - Reference 2 contacted ✓/✗
4. All items pass → KYB badge issued → user notified
5. Any item fails → specialist notes reason → user notified with what to resubmit

---

## 4. Dispute Queue

See also [docs/08-deal-workflow.md §7](08-deal-workflow.md) for the end-user dispute flow.

**Trust team workflow:**

| Status | Action available |
|--------|-----------------|
| `DISPUTE_FILED` | Assign to specialist; initiate 48h cooling-off timer |
| `DISPUTE_UNDER_REVIEW` | View evidence from both parties; access full deal thread and milestone log; issue recommendation |
| `DISPUTE_RESOLVED` | Archive; update profiles if warranted (e.g., supplier flag) |
| `DISPUTE_REFERRED` | Export deal record package; send referral to arbitration body |

**Evidence package export:**
The trust team can export a ZIP file containing:
- Full message thread (rendered as PDF)
- All uploaded documents from the Deal Room
- Milestone history with timestamps and confirmers
- Match cards, RFQ, and accepted quote

**SLA enforcement:**
- `DISPUTE_FILED` → assigned within **4 business hours**
- Recommendation issued within **5 business days** of assignment
- Admin panel shows countdown timers; escalates to `super_admin` if overdue

---

## 5. Wire Transfer Confirmation Queue

For international users who pay by wire transfer (see [docs/15-monetization.md §2.3](15-monetization.md)):

**Inbound matching flow:**

```
[User selects "Pay by wire" in subscription checkout]
        │
[Platform generates a unique payment reference code (e.g., GRC-2026-00412)]
        │
[Invoice PDF emailed to user with banking details + reference code]
        │
[finance_ops receives wire into Gracera bank account]
        │
[finance_ops enters: date received, amount, reference code found in memo field]
        │
        ├── Reference match + correct amount → subscription activated automatically
        │
        └── Reference not found or amount mismatch → flagged for manual reconciliation
```

**Admin queue fields:** Payment reference, amount received, expected amount, currency, received date, user email (looked up from reference), status (Matched / Mismatch / Unmatched).

**SLA:** Wire confirmations processed within **1 business day** of receipt.

**Edge cases:**
- User sends wrong amount → `finance_ops` manually adjusts subscription length to match amount received, notifies user
- Duplicate payment → logged as credit balance; applied to next renewal automatically
- Unidentified payment > 30 days → returned to originating account

---

## 6. Manual Match Override

`customer_success` and `trust_team` can intervene in the AI matching layer:

### 6.1 Manual Match Injection

Force a specific supplier–buyer introduction that the AI would not have surfaced:

- Admin selects Supplier Profile ID + Buyer Sourcing Request ID
- Optionally writes a custom match rationale (shown to both parties)
- Match is injected into both parties' introduction queues
- Audit log entry: `match_injected`, admin ID, reason (free text)

**Use cases:**
- Trade show follow-up: founding supplier introduced to founding buyer
- Customer success promise: "we'll find you matches within your first week"
- Post-complaint remediation

### 6.2 Match Suppression

Prevent a specific supplier from ever being matched to a specific buyer (or vice versa):

- Admin enters both profile IDs and a reason
- Suppression pair stored in `match_suppressions` table
- AI engine reads suppressions before surfacing introductions

**Use cases:**
- Active dispute between the two parties
- Competitor company (supplier doesn't want intros to direct competitors)
- Fraud investigation (one party under review)

### 6.3 Profile-Level Matching Hold

Temporarily remove a profile from all matching without suspending the account:

- Admin sets `match_hold = true` on a profile + optional expiry date
- Profile remains visible in search; not surfaced in AI matches
- Used during fraud review, KYB pending, or customer request

---

## 7. Account Management

### 7.1 Impersonation (Read-Only)

`customer_success` can view any user's account as if they were logged in — without being able to take any actions on their behalf:

- Accessible from `/admin/users/{userId}/impersonate`
- Shows the account as the user sees it (their dashboard, match queue, deal list, subscription)
- A persistent banner is shown: "You are viewing this account as [user name]. All actions are disabled."
- No form submissions or API mutations are permitted in impersonation mode
- Audit log entry created on impersonation start and end

### 7.2 Account Suspension

`trust_team` can suspend an account:

| Suspension type | Effect |
|----------------|--------|
| `soft_suspend` | Profile hidden from search + matching; user can still log in and see a notice |
| `hard_suspend` | Account locked; user cannot log in; all matches paused |
| `profile_under_review` | Profile hidden from matching only; messaging continues; visible badge on profile |

All suspension actions require a reason (free text) that is logged but not shown to the user. The user-facing message is a generic "your account is under review" notice with a support email.

### 7.3 Subscription Overrides

`customer_success` and `finance_ops` can:
- Manually upgrade or downgrade a subscription tier (with reason logged)
- Extend a subscription expiry date (e.g., for service credits)
- Issue a billing credit (applied to next invoice)
- Cancel a subscription (immediately or at period end)
- Reactivate a lapsed subscription without requiring payment re-entry

---

## 8. Content Moderation

### 8.1 Flag Queue

Users can flag: profiles, messages, forum posts (Phase 4), and broadcast campaigns. All flags enter the flag queue.

**Flag queue fields:** Entity type, entity ID, reporting user, category (spam / inappropriate content / impersonation / false information / other), description, submission timestamp, SLA countdown.

**Severity triage:**
| Flag category | Auto-action | SLA for human review |
|--------------|------------|---------------------|
| Spam (profile) | Auto-suppress profile from new matches if ≥ 3 flags from different users | 24 hours |
| Inappropriate content (message) | None | 24 hours |
| Impersonation | None | 4 hours |
| False information | None | 48 hours |

**`content_mod` actions available:** Dismiss flag | Warn user | Edit/remove content | Escalate to `trust_team` for account action.

### 8.2 Broadcast Campaign Approval (Phase 3+)

Pro and Enterprise suppliers can send Broadcast Campaigns to relevant buyer segments. Before delivery:
- Campaign enters a review queue (automated + manual for first 3 campaigns from any account)
- Automated checks: spam word list, link safety scan, category relevance
- Manual check for first-time senders: content matches stated category; not misleading
- Approval or rejection within **4 hours**; rejected campaigns get a reason

### 8.3 Sourcing Request Moderation

Buyer sourcing requests are auto-moderated on publish:
- Keyword scan for prohibited goods (weapons, counterfeit goods list, OFAC-flagged categories)
- Any match → held for `trust_team` review before going live (SLA: 2 hours)
- Clean requests → published immediately

---

## 9. Platform Metrics Dashboard

Available to `super_admin` and `data_analyst`. Key panels:

### Supply & Demand Health
- Active supplier profiles (published, ≥60% complete) — daily trend
- Active sourcing requests — daily trend
- Supply/demand ratio per vertical (target: ≥ 3 suppliers per active sourcing request)
- No-match rate (< 5% target — see [docs/01-product-requirements.md §4](01-product-requirements.md))

### Matching Engine Performance
- Matches surfaced per day / per hour
- Match acceptance rate (target > 70%)
- Time-to-first-match (target < 1 hour) — p50, p90
- AI inference cost per match (target < $0.005)
- Match queue depth (Redis Streams) — alerts if > 500 items

### Deal Funnel
- Introductions accepted → Message threads opened → RFQs issued → Quotes submitted → Deal Room entries → Closed deals
- Funnel drop-off at each stage (target each transition > 40%)
- Average deal cycle time (target < 30 days from intro to close)

### Revenue Metrics
- MRR by tier (Free / Pro / Enterprise, supplier vs. buyer)
- New subscriptions this week / month
- Churned subscriptions this week / month
- Wire transfer queue backlog
- Sample order volume + revenue
- Trade Finance referral attach rate (target > 15% of Deal Room entries)

### Trust & Safety KPIs
- Open disputes older than 5 business days (target: 0)
- Verification queue age (target: 0 items > 2 business days)
- Account suspension rate (flag if > 0.5% of active accounts/month)
- Fraud signals triggered this week

---

## 10. Certification Expiry Monitoring (Automated)

A scheduled job runs daily and:

1. Queries all certifications where `expiry_date` is in 90 / 60 / 30 days
2. Sends the appropriate expiry alert email to the supplier (see [docs/21-notifications-email-spec.md](21-notifications-email-spec.md))
3. For certs past `expiry_date`:
   - Sets `cert_status = 'expired'` in the database
   - Removes the cert from the supplier's active matching filters
   - Adds an "Expired certification" flag to the public profile
   - Notifies buyers who accepted introductions from this supplier based on that certification (within 24 hours of expiry)

Admin can view the full cert expiry calendar in the Verification Queue panel, filtered by days-to-expiry.

---

## 11. Availability Signal Auto-Reset

Supplier availability signals (`Available / Limited / Fully Booked`) are set by the supplier. To prevent stale signals, a weekly cron job:

1. Identifies suppliers who set `Fully Booked` or `Limited` more than 14 days ago without updating
2. Sends a push/email nudge: "Your availability is still set to [Fully Booked] — has this changed?"
3. If no response within 7 days: resets to `Available` automatically and notifies the supplier

Admin can see a list of stale availability signals in the platform metrics panel and manually reset them.

---

## 12. Audit Log

All admin actions, automated platform decisions (match injection, cert expiry, account suspension), and significant user actions (profile publish, deal close, dispute filed) are written to an append-only `audit_log` table:

| Field | Type |
|-------|------|
| `id` | uuid |
| `actor_type` | enum: `admin`, `system`, `user` |
| `actor_id` | uuid |
| `action` | string (namespaced: `admin.match.inject`, `system.cert.expire`, etc.) |
| `entity_type` | string |
| `entity_id` | uuid |
| `before` | jsonb (nullable) |
| `after` | jsonb (nullable) |
| `reason` | text (nullable) |
| `created_at` | timestamptz |

Audit logs are retained for 7 years (legal requirement). They are never deleted or updated — only appended.

---

## 13. Platform Role & Feature Management

Manages the `roles` / `features` / `role_features` / `user_roles` tables
in [09](09-data-model.md) §2 — the platform-facing roles a *user* can
hold (`supplier`, `buyer`, `admin`, and any added later), as distinct
from the internal admin-roles enum in §1 above (which governs what an
*internal staff account* can do inside this dashboard). Holding the
platform `admin` role does not by itself grant any §1 capability — the
two checks are independent, specifically so this panel can't be used to
self-grant broader admin dashboard access than an internal role already
allows.

**Access:** `super_admin` only.

**UI:** `/admin/roles`

| Action | Effect |
|--------|--------|
| Create role | New `roles` row (`slug`, `name`, `description`); `is_system = false` |
| Edit role | Update `name`/`description`. `slug` is immutable once created (referenced by code paths that check role membership) |
| Delete role | Blocked if `is_system = true`, or if any `user_roles` rows still reference it — members must be reassigned or removed first |
| Assign feature to role | Adds a `role_features` row (`feature_id`, `sort_order`); the feature must already exist in the `features` registry — this panel does not create new features, since a feature implies a real route + backend already shipped |
| Remove feature from role | Deletes the `role_features` row; that sidebar item disappears for every member of the role on their next session refresh |
| Reorder features | Updates `sort_order` within a category |

The panel shows each role with its currently assigned features listed
against the full `features` registry, so an admin can see at a glance
what a role has and doesn't have — e.g. temporarily hiding "Broadcasts"
from `supplier` platform-wide without touching code, or standing up a
new role (say, a future `sales_rep` role) with a hand-picked feature set
copied from `buyer`'s defaults.

Every create/edit/delete/assign action here is written to the audit log
(§12) with before/after state — this panel changes what capabilities
real users have access to, so it's treated with the same audit rigor as
account suspension or manual match override.

---

[Back to README](../README.md)
