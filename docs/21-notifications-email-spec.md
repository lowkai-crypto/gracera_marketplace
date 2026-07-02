# Notifications & Email Spec

All platform-generated communications: transactional email templates, in-app notification design, delivery rules, digest cadence, and user preference controls.

Email delivery: **SendGrid** (`noreply@gracera.com`). In-app notifications: stored in `notifications` table; polled via WebSocket or SSE on dashboard load.

---

## 1. Notification Architecture

```
Platform Event
      │
      ▼
Notification Service (Next.js API route / background worker)
      │
      ├── writes to notifications table (in-app)
      │
      └── calls SendGrid API (email)
            │
            ├── transactional (immediate — deal events, security)
            └── digest (batched — match digest, weekly summaries)
```

**In-app notification store:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `user_id` | uuid | |
| `type` | string | Namespaced: `match.new`, `deal.rfq_issued`, etc. |
| `title` | string | Short display title (< 60 chars) |
| `body` | string | Full description (< 200 chars) |
| `entity_type` | string | `match`, `deal`, `message`, `cert`, etc. |
| `entity_id` | uuid | Deep-link target |
| `read` | boolean | |
| `created_at` | timestamptz | |

Notifications older than 90 days are archived (no longer shown in the notification panel; retained in DB for audit).

---

## 2. Notification Delivery Rules

| Category | In-app | Email (immediate) | Email (digest) |
|----------|--------|-------------------|----------------|
| New match surfaced | ✓ | — | ✓ (daily digest) |
| Introduction accepted by other party | ✓ | ✓ | — |
| New message received | ✓ | ✓ (if not active in platform) | — |
| Sample request received (supplier) | ✓ | ✓ | — |
| Sample dispatched (buyer) | ✓ | ✓ | — |
| RFQ issued | ✓ | ✓ | — |
| Quote submitted | ✓ | ✓ | — |
| Counter-offer received | ✓ | ✓ | — |
| Deal milestone confirmed | ✓ | ✓ | — |
| Deal closed | ✓ | ✓ | — |
| Post-deal review invitation | ✓ | ✓ | — |
| Inspection booking confirmed | ✓ | ✓ | — |
| Inspection report uploaded | ✓ | ✓ | — |
| E-signature requested | ✓ | ✓ | — |
| E-signature completed | ✓ | ✓ | — |
| Dispute filed (other party) | ✓ | ✓ | — |
| Dispute recommendation issued | ✓ | ✓ | — |
| Group buy invitation | ✓ | ✓ | — |
| Group buy allocation confirmed | ✓ | ✓ | — |
| Reorder reminder | ✓ | ✓ | — |
| Cert expiry — 90 days | ✓ | ✓ | — |
| Cert expiry — 60 days | ✓ | ✓ | — |
| Cert expiry — 30 days | ✓ | ✓ | — |
| Cert expired | ✓ | ✓ | — |
| Cert expired — buyer notification | ✓ | ✓ | — |
| Subscription renewal upcoming (7 days) | ✓ | ✓ | — |
| Subscription payment failed | ✓ | ✓ | — |
| Wire transfer confirmed | ✓ | ✓ | — |
| Profile completeness nudge | ✓ | — | ✓ (weekly) |
| Availability signal stale (supplier) | ✓ | ✓ | — |
| No-match safety net (72h — supplier) | ✓ | ✓ | — |
| No-match safety net (24h — buyer) | ✓ | ✓ | — |
| Security: new login from new device | — | ✓ | — |
| Security: password changed | — | ✓ | — |
| Security: email changed | — | ✓ | — |

**"Email if not active in platform" rule:** For message notifications, if the user has been active (page load, any API call) in the last 5 minutes, suppress the email. Otherwise send. This prevents email noise for users who are actively chatting.

---

## 3. Email Templates

All templates use a shared base layout:
- Gracera logo (top left)
- Single-column, max 600px wide
- Primary CTA button (brand colour)
- Footer: unsubscribe link, Privacy Policy, Gracera address

Templates are maintained as HTML files in `apps/web/src/emails/`. Rendered and sent via the SendGrid dynamic templates API. All body copy is internationalised via i18n keys (Phase 4).

---

### 3.1 Auth & Account

**`email/auth/welcome-supplier.html`**
Subject: `Welcome to Gracera — let's find your first buyer match`
- Triggered: supplier email verified
- Content: brief platform value prop (2 sentences), "Complete your profile" CTA, progress bar showing 0% complete, "Questions? Reply to this email" footer note

**`email/auth/welcome-buyer.html`**
Subject: `Welcome to Gracera — post your first sourcing request`
- Triggered: buyer email verified
- Content: brief value prop, "Post a sourcing request" CTA, expected outcome ("get your first 5 matches within 1 hour")

**`email/auth/verify-email.html`**
Subject: `Confirm your Gracera email address`
- Content: 6-digit OTP or verification link (expires 24 hours), plain instructions

**`email/auth/password-reset.html`**
Subject: `Reset your Gracera password`
- Content: "We received a request to reset your password", reset link (expires 1 hour), "If you didn't request this, ignore this email" note

**`email/auth/new-device-login.html`**
Subject: `New sign-in to your Gracera account`
- Content: device type, IP country (geo-resolved), timestamp, "Not you? Secure your account" CTA

**`email/auth/email-changed.html`**
Subject: `Your Gracera email address was changed`
- Content: new email address, "If you didn't make this change, contact security@gracera.com immediately"

---

### 3.2 Matching

**`email/match/daily-digest.html`**
Subject: `You have [N] new supplier matches` / `You have [N] new buyers looking for what you supply`
- Triggered: daily at 8am in user's timezone (default 8am UTC if no timezone set)
- Content: up to 5 match cards, each showing: company name, country flag, category, match score (visual bar), one-sentence AI rationale, "View Match" CTA
- Footer: "View all [N] matches" link if more than 5 pending

**`email/match/introduction-accepted.html`**
Subject: `[Company name] accepted your introduction`
- Content: who accepted, their role (supplier/buyer), "Open conversation" CTA

**`email/match/no-match-safety-net-supplier.html`** (72-hour safety net)
Subject: `Your profile hasn't received any matches yet — here's why`
- Triggered: 72 hours after supplier profile published with 0 accepted introductions
- Content: top 3 specific profile gaps vs. category benchmark, CTA to fix each gap, "Edit Profile" button

**`email/match/no-match-safety-net-buyer.html`** (24-hour safety net)
Subject: `No matches yet — the Prospecting Agent is reaching out to suppliers on your behalf`
- Triggered: 24 hours after sourcing request published with 0 matches surfaced
- Content: confirm the Prospecting Agent is actively searching off-platform, show what criteria it's using, "Edit your request" CTA if criteria are very narrow

**`email/match/supplier-invitation.html`** (off-platform supplier invite)
Subject: `A buyer on Gracera is looking for what you supply`
- Triggered: Prospecting Agent identifies off-platform supplier as a match
- Content: anonymized buyer description ("A US-based food distributor sourcing Korean fermented foods"), match reason (why this supplier fits), "Claim your free profile" CTA

---

### 3.3 Deal Events

**`email/deal/rfq-received.html`**
Subject: `New RFQ from [Buyer company name]`
- Content: product/service description, quantity, delivery date, "View RFQ" CTA, note if routed to commercial vs. technical contact

**`email/deal/quote-received.html`**
Subject: `[Supplier name] submitted a quote for your RFQ`
- Content: total quoted value (line item count), currency, lead time, "Review Quote" CTA

**`email/deal/counter-offer.html`**
Subject: `Counter-offer received on [deal name]`
- Content: which party counter-offered, updated key terms (price change %, lead time change), "Review Counter-offer" CTA

**`email/deal/deal-room-entered.html`**
Subject: `Your deal with [company name] is now in the Deal Room`
- Content: deal name, agreed terms summary (3 key fields), "Open Deal Room" CTA, teaser for Trade Finance / Logistics referrals

**`email/deal/milestone-confirmed.html`**
Subject: `[Milestone name] confirmed by [party]`
- Content: milestone name, confirming party, next milestone, "View Deal" CTA

**`email/deal/deal-closed.html`**
Subject: `Deal closed — leave a review for [company name]`
- Content: congratulations note, deal summary (product, value, parties), "Leave a Review" CTA (primary), "Reorder" CTA (secondary)

**`email/deal/reorder-reminder.html`**
Subject: `Time to reorder from [Supplier name]?`
- Content: last order summary, "Your last order was [N] days ago", pre-populated RFQ CTA

**`email/deal/esign-requested.html`**
Subject: `[Party name] has sent you a document to sign`
- Content: document type (PO / NDA / Distribution Agreement / Sample Agreement), from whom, deal name, "Sign Document" CTA (opens DocuSign/HelloSign)

**`email/deal/esign-completed.html`**
Subject: `Document signed — [document type] for [deal name]`
- Content: all parties have signed, link to download PDF copy

---

### 3.4 Sample Orders

**`email/sample/request-received.html`** (to supplier)
Subject: `Sample request from [Buyer company name]`
- Content: product/variant, quantity, delivery address (city/country), "Accept or Decline" CTA (48-hour deadline noted)

**`email/sample/request-accepted.html`** (to buyer)
Subject: `Your sample request was accepted by [Supplier name]`
- Content: expected dispatch date, what to expect next

**`email/sample/dispatched.html`** (to buyer)
Subject: `Your sample from [Supplier name] has shipped`
- Content: tracking number/link (if provided), expected arrival window, "Convert to RFQ when ready" note

---

### 3.5 Disputes

**`email/dispute/filed-counterparty.html`**
Subject: `A dispute has been filed on your deal with [company name]`
- Content: dispute category, 48-hour cooling-off explanation, "Respond in the Deal Room" CTA

**`email/dispute/recommendation.html`**
Subject: `Gracera Trust Team recommendation on your dispute`
- Content: non-binding recommendation summary, next steps, escalation options

---

### 3.6 Certifications

**`email/cert/expiry-90d.html`**
Subject: `[Cert name] expires in 90 days — renew early to keep your matches`
- Content: cert name, expiry date, renewal instructions, "Update Certificate" CTA

**`email/cert/expiry-60d.html`**
Subject: `[Cert name] expires in 60 days — action required`
- Content: same structure, more urgent tone

**`email/cert/expiry-30d.html`**
Subject: `[Cert name] expires in 30 days — urgent`
- Content: same structure, urgent tone, note that cert will be excluded from matching on expiry

**`email/cert/expired.html`** (to supplier)
Subject: `[Cert name] has expired — update to restore your matches`
- Content: cert has expired, it is now excluded from matching, "Upload Renewed Certificate" CTA

**`email/cert/expired-buyer-notice.html`** (to buyer)
Subject: `A certification held by [Supplier name] has expired`
- Content: which cert, supplier name, what it means for the buyer's introduction, "Review Supplier" CTA

---

### 3.7 Billing & Subscriptions

**`email/billing/invoice.html`**
Subject: `Your Gracera invoice — [Month Year]`
- Content: invoice number, line items, total, payment method used, "View Invoice" CTA (link to PDF)

**`email/billing/wire-instructions.html`**
Subject: `Wire transfer instructions for your Gracera subscription`
- Content: banking details, unique payment reference code (`GRC-YYYY-XXXXX`), amount due, "What happens next" explanation (1–2 business days to confirm)

**`email/billing/wire-confirmed.html`**
Subject: `Payment confirmed — your [Tier] subscription is active`
- Content: subscription tier, billing period, receipt

**`email/billing/renewal-reminder.html`**
Subject: `Your Gracera [Tier] subscription renews in 7 days`
- Content: renewal date, amount, payment method, "Manage Subscription" CTA

**`email/billing/payment-failed.html`**
Subject: `Action required — your Gracera subscription payment failed`
- Content: reason (if available from Stripe), retry instructions, "Update Payment Method" CTA, grace period (3 days before downgrade)

**`email/billing/downgraded.html`**
Subject: `Your Gracera account has been downgraded to Free`
- Content: what features are no longer available, "Upgrade" CTA

---

### 3.8 Weekly Digest

**`email/digest/weekly-supplier.html`**
Subject: `Your week on Gracera — [date range]`
- Triggered: Monday 8am in user timezone, only for Pro/Enterprise users
- Sections:
  1. Match summary (new matches this week, acceptance rate)
  2. Profile health (completeness score, top recommended improvement)
  3. Category benchmark snapshot (your MOQ vs. category average)
  4. Pending actions (open RFQs, unread messages)
  5. "Your profile was viewed by [N] buyers this week" (Enterprise only)

**`email/digest/weekly-buyer.html`**
Subject: `Your sourcing week on Gracera`
- Triggered: Monday 8am in user timezone, Pro/Enterprise users
- Sections:
  1. Active sourcing requests (match counts, new this week)
  2. Pending quotes awaiting review
  3. Deals in progress (milestone status)
  4. Suggested suppliers (2–3 new matches)

---

## 4. In-App Notification Panel

The notification bell icon in the top navigation shows an unread count badge. Clicking opens a slide-out panel.

**Panel layout:**
- "Mark all read" button
- Notifications grouped by day (Today / Yesterday / This week / Earlier)
- Each notification: icon (type), title, body (truncated at 120 chars), relative timestamp, unread dot
- Clicking a notification: marks as read + navigates to the entity (deal, match, profile)

**Notification icons by type:**
| Type prefix | Icon |
|-------------|------|
| `match.*` | Two-person handshake |
| `deal.*` | Document/briefcase |
| `message.*` | Chat bubble |
| `cert.*` | Certificate/badge |
| `billing.*` | Credit card |
| `security.*` | Shield |
| `system.*` | Info circle |

---

## 5. Notification Preferences

Users can manage preferences at `/settings/notifications`:

| Preference | Default | Options |
|-----------|---------|---------|
| Match digest | Daily email | Daily / Weekly / In-app only / Off |
| Deal events | Immediate email + in-app | Immediate / Daily digest / In-app only |
| Messages | Immediate email if not active | Immediate / In-app only |
| Cert expiry | Immediate email | On / Off |
| Billing | Immediate email | On / Off (cannot be turned off for payment failures) |
| Security | Immediate email | On (cannot be turned off) |
| Weekly digest | On (Pro/Enterprise) | On / Off |

Preferences are stored per user in the `notification_preferences` table. Security and payment failure emails always send regardless of preferences.

---

## 6. Unsubscribe & Compliance

- Every marketing/digest email includes a one-click unsubscribe link (compliant with CAN-SPAM, GDPR)
- Unsubscribing from digest emails does not disable transactional emails (deal events, security, billing)
- Users who mark an email as spam are automatically moved to "in-app only" for that category
- Hard bounces are logged in SendGrid and the user is notified in-app to update their email address
- GDPR "right to be forgotten" deletes the user's email from SendGrid contact lists within 30 days

---

[Back to README](../README.md)
