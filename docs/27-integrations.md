# Integrations

Third-party service integrations: API contracts, data flows, authentication patterns, and failure handling for each external service Gracera connects to.

---

## 1. Integration Overview

| Integration | Phase | Purpose | Auth pattern |
|-------------|-------|---------|-------------|
| Stripe | Phase 5 (online payments) | Subscription billing, sample order fees | API key + webhooks |
| SendGrid | Phase 1 | Transactional email delivery | API key |
| Claude API (Anthropic) | Phase 1 | AI matching, RAG, AI-Brain, coaching cards | API key |
| DocuSign / HelloSign | Phase 3 | E-signature for deal contracts | OAuth2 + webhooks |
| QIMA API | Phase 3 | Pre-shipment inspection booking | API key |
| DocuSign alternative: Dropbox Sign (HelloSign) | Phase 3 | As above — vendor choice TBD | OAuth2 |
| DeepL | Phase 4 | Machine translation (profile content, match rationale) | API key |
| Coupa / Odoo / SAP Ariba | Phase 4 | ERP procurement integration (Enterprise tier) | OAuth2 / API key |
| Google OAuth2 | Phase 1 | Social login | OAuth2 |
| LinkedIn OAuth2 | Phase 1 | Social login + role verification | OAuth2 |
| Trade finance partners | Phase 3 | "Get Paid Now" referral (Drip Capital, C2FO, etc.) | Referral URL / API |
| Freight forwarder partners | Phase 3–4 | In-platform freight quotes (Flexport, Freightos, etc.) | API key / webhook |
| Sanctions screening (Comply Advantage) | Phase 4 | KYB + country-pair screening | API key |
| Business registry APIs | Phase 1 | Verified Business badge | API key (per country) |
| ClamAV | Phase 1 | File upload virus scanning | Local service (Docker) |
| pgvector | Phase 1 | Vector similarity search (embedded in PostgreSQL) | Internal |
| Redis Streams | Phase 1 | Async job queue (match engine, background jobs) | Internal |
| Oracle Cloud Object Storage | Phase 1 | File storage (S3-compatible API) | Access key / secret |

---

## 2. Claude API (Anthropic)

**Used for:** AI matching, RAG profile auto-population, AI-Brain, Negotiation Coach, coaching cards, match rationale generation, Growth Strategy Engine.

**Model:** `claude-sonnet-4-6` (default); model ID is configured via `ANTHROPIC_MODEL` env var to allow future upgrades without code changes.

**API surface consumed:**

| Feature | Claude API call | Notes |
|---------|----------------|-------|
| Match scoring | Messages API — scoring prompt + supplier/buyer profiles | Batch up to 20 candidates per call |
| RAG auto-population | Messages API — extraction prompt + catalog text chunks | Catalog chunked by LangChain; 2K token chunks |
| AI-Brain | Messages API — extended context (prompt-cached) | System prompt cached; deal history as context |
| Match rationale | Messages API — rationale generation from scores | Runs after scoring; result stored with match record |
| Negotiation Coach | Messages API — deal context + coaching system prompt | Private per user; never shared |
| Growth Strategy Engine | Messages API — profile + category benchmark data | Cached system prompt per vertical |

**Authentication:** `ANTHROPIC_API_KEY` environment variable. All calls go through the Python AI service (`apps/ai-service/`) — the Next.js app never calls the Claude API directly.

**Prompt caching:** Enabled in Phase 2 for matching and AI-Brain. The system prompt + static context block is cached; only the per-user variable portion counts toward input tokens on repeat calls. Estimated 40% token cost reduction.

**Rate limits:** Anthropic default rate limits apply. At Phase 3 volume (150K matches/day), rate limit headroom should be monitored. Contact Anthropic for higher rate limits if needed.

**Error handling:**
- API timeout (> 30s): log error, return `match_score = null`; retry once after 5s
- Rate limit (429): exponential backoff with jitter; max 3 retries
- Model overload (529): same as rate limit handling
- Any error during match scoring for Free tier users: skip gracefully; Free tier match runs in batch (failure doesn't block the user)

**Cost controls:**
- `max_tokens` set per call type: scoring = 500, rationale = 300, AI-Brain = 2000
- Token usage logged per call to a `ai_usage_log` table (user_id, call_type, input_tokens, output_tokens, cost_estimate)
- Alert if daily token spend exceeds budget threshold (configurable in env: `AI_DAILY_BUDGET_USD`)

---

## 3. Stripe

**Phase:** Phase 5 (online payments). Prior phases use wire transfer only.

**Used for:** Online subscription billing (Pro and Enterprise tiers), sample order transaction fees.

**Integration points:**

| Action | Stripe API | Notes |
|--------|-----------|-------|
| Create subscription | `POST /v1/subscriptions` | Created at tier upgrade |
| Update subscription | `POST /v1/subscriptions/{id}` | Tier change (proration applied) |
| Cancel subscription | `DELETE /v1/subscriptions/{id}` | At period end or immediately |
| Sample order payment | `POST /v1/payment_intents` | 10% platform fee via `application_fee_amount` |
| Customer portal | Stripe Customer Portal | Self-serve billing management |

**Webhooks consumed:**

| Event | Action |
|-------|--------|
| `invoice.payment_succeeded` | Mark subscription as active; log in billing history |
| `invoice.payment_failed` | Set subscription to `past_due`; trigger payment failure email; start 3-day grace period |
| `customer.subscription.deleted` | Downgrade account to Free tier |
| `customer.subscription.updated` | Update tier in database |
| `payment_intent.succeeded` | Confirm sample order; notify parties |

**Webhook security:** All webhook payloads verified with `stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)`.

**Test mode:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` use test keys in `development` and `ci` environments. Never use live keys in non-production environments.

---

## 4. SendGrid

**Used for:** All transactional email (see [docs/21-notifications-email-spec.md](21-notifications-email-spec.md)).

**Integration pattern:** REST API via `@sendgrid/mail` npm package. Called from the notification service in the Next.js app.

**Template management:** SendGrid Dynamic Templates store HTML templates. The Next.js app sends template IDs + dynamic data objects (no HTML in code). Template IDs are environment variables (`SENDGRID_TEMPLATE_*`).

**Key configuration:**

```bash
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@gracera.com
EMAIL_REPLY_TO=support@gracera.com
SENDGRID_TEMPLATE_WELCOME_SUPPLIER=d-xxx
SENDGRID_TEMPLATE_MATCH_DIGEST=d-xxx
# ... one env var per template
```

**Inbound email parsing:** Not used. Reply-to is `support@gracera.com`, handled by the support ticket system.

**Bounce / spam handling:**
- Hard bounces → SendGrid marks the address as suppressed automatically; Gracera in-app notifies user to update email
- Spam complaints → user moved to `email_preference = in_app_only`; support team notified

**Sandbox mode:** When `GRACERA_ENV=development` or `ci` and `SENDGRID_API_KEY` is blank, the notification service prints email content to the console instead of calling SendGrid.

---

## 5. DocuSign / Dropbox Sign (HelloSign)

**Used for:** E-signature on deal contracts (PO, NDA, Distribution Agreement, Sample Agreement). Phase 3.

**Vendor selection:** TBD between DocuSign and Dropbox Sign (HelloSign). Dropbox Sign has a more developer-friendly API and lower per-envelope cost at SME volumes; DocuSign has stronger enterprise brand trust. Evaluate at Phase 3 start.

**Integration flow:**

```
Gracera populates contract template with deal data
        │
        ▼
Gracera creates a SignatureRequest via DocuSign/Dropbox Sign API
        │
        ▼
Both parties receive email with "Sign Now" link
        │
        ▼
Parties sign (in DocuSign/Dropbox Sign hosted UI)
        │
        ▼
Webhook event: signature_request_all_signed
        │
        ▼
Gracera downloads signed PDF → stores in OCI Object Storage (deal-docs/)
        │
Gracera notifies both parties: "All parties have signed"
```

**Webhooks consumed:**

| Event | Action |
|-------|--------|
| `signature_request_sent` | Log; no user action |
| `signature_request_signed` (one party) | Notify other party |
| `signature_request_all_signed` | Download PDF; store; notify both |
| `signature_request_declined` | Notify initiating party; log in deal |
| `signature_request_expired` | Notify both parties; offer to resend |

**Security:** Signed PDFs are stored encrypted at rest in OCI Object Storage. Only parties to the deal can download them (access controlled by deal membership check in API).

---

## 6. QIMA Inspection API

**Used for:** Pre-shipment inspection booking from within the Deal Room. Phase 3.

**Flow:**

```
Buyer clicks "Book Inspection" in Deal Room (after "Production completed" milestone)
        │
Gracera calls QIMA API to check availability for:
  - product category
  - supplier country
  - requested inspection date range
        │
Buyer selects inspector type + date
        │
Gracera creates booking via QIMA API
        │
QIMA confirmation returned → stored in deal record
        │
[Inspection day] Inspector uploads report to QIMA portal
        │
QIMA webhook → Gracera downloads report → attaches to Deal Room
        │
Gracera notifies buyer: "Inspection report is ready"
```

**Key API endpoints (QIMA):**

| Action | QIMA endpoint |
|--------|-------------|
| Get available products/services | `GET /v2/products` |
| Check availability | `POST /v2/bookings/availability` |
| Create booking | `POST /v2/bookings` |
| Get booking status | `GET /v2/bookings/{id}` |
| Download report | `GET /v2/bookings/{id}/report` |

**Revenue:** Gracera earns $30–$80 per completed inspection booking as a referral commission (configured in QIMA partner agreement; stored as `inspection_commission_rate` in platform config).

**Fallback:** If QIMA API is unavailable, the booking UI shows: "Online booking is temporarily unavailable — contact QIMA directly at [email]." The deal is not blocked.

---

## 7. DeepL (Translation)

**Used for:** Machine translation of supplier profile content and AI match rationale in the buyer's preferred language. Phase 4.

**Integration:**

```bash
DEEPL_API_KEY=xxx
```

**Usage pattern:**
- Profile content translation: cached per (source_text, target_lang) pair in Redis (TTL: 7 days). Profiles rarely change; caching dramatically reduces API costs.
- Match rationale translation: generated fresh per match per user language preference (not cached — rationale is personalized)
- UI strings: NOT translated via DeepL — these use static i18n files (i18n-next or equivalent)

**Supported language pairs at Phase 4 launch:** EN → ZH (Simplified), EN → ES, EN → AR. Additional languages added as user base grows.

**Character cost monitoring:** DeepL charges per character. `deepl_usage_log` table tracks characters translated per month. Alert if monthly character usage exceeds budget threshold.

**Fallback:** If DeepL is unavailable, profile content and match rationale are shown in their original language with a "Translation unavailable" notice. The deal workflow is not blocked.

---

## 8. ERP / Procurement Integrations (Phase 4)

Enterprise tier includes API access for embedding Gracera supplier matching inside procurement tools.

### 8.1 Gracera API (outbound — for ERP consumers)

Enterprise users get an API key to query Gracera from their ERP system:

```
GET https://api.gracera.com/v1/match/suppliers
Authorization: Bearer {api_key}

Body:
{
  "category": "electronics/components/pcb",
  "quantity": 10000,
  "destination_country": "DE",
  "certifications_required": ["RoHS", "CE"],
  "max_results": 10
}
```

Returns: ranked list of matched supplier profiles with match score and rationale.

**Rate limits:** 100 requests/minute per API key. Higher limits available on request.

### 8.2 Coupa Integration

Coupa (enterprise procurement) integration allows buyers to search Gracera suppliers from within Coupa:

- Gracera registers as a Coupa Punch-out catalog supplier
- When a Coupa buyer initiates a supplier search, Coupa opens a Gracera session (SSO via Coupa auth token)
- The buyer sees the Gracera supplier search UI embedded in Coupa
- Selected suppliers are returned to Coupa as line items in the purchase requisition

**Authentication:** Coupa OCI (Open Catalog Interface) protocol — PunchOut via cXML.

### 8.3 Odoo Integration

Gracera provides an Odoo add-on module (Phase 4) that adds a "Find on Gracera" button to the Odoo Purchase module:

- Button opens a Gracera supplier search overlay
- On selection, the chosen supplier's Gracera profile data is imported as a new vendor record in Odoo

**Authentication:** OAuth2; user authorizes Gracera to write to their Odoo instance.

---

## 9. OAuth2 Social Login

### 9.1 Google OAuth2

**Purpose:** Social login ("Sign in with Google") + email pre-fill at registration.

**Scopes requested:** `openid email profile`

**Callback URL:** `https://gracera.com/api/auth/callback/google` (production); `http://localhost:3000/api/auth/callback/google` (dev).

**Implementation:** NextAuth.js Google provider.

**What Gracera stores:** Google `sub` (user ID) for future logins; display name; email. Does not store Google access tokens.

### 9.2 LinkedIn OAuth2

**Purpose:** Social login + LinkedIn role verification.

**Scopes requested:** `r_liteprofile r_emailaddress` (basic profile + email). Phase 2 adds `r_basicprofile` to extract job title and company for "LinkedIn Verified" role badge.

**Callback URL:** `https://gracera.com/api/auth/callback/linkedin`

**Implementation:** NextAuth.js LinkedIn provider. Job title and company name pulled from LinkedIn profile at login; stored as `linkedin_verified_title` and `linkedin_verified_company` on the user profile (shown as "LinkedIn Verified" badge on match cards).

---

## 10. Business Registry APIs

**Used for:** Verified Business badge (email-verified + business registration number check).

**Country coverage at Phase 1 launch:**

| Country | API | Notes |
|---------|-----|-------|
| United Kingdom | Companies House API | Free; company name + status lookup |
| United States | SEC EDGAR (for public cos) + IRS EIN lookup | Limited; supplement with manual review |
| Australia | ASIC (ABN Lookup) | Free API |
| Singapore | ACRA BizFile+ | API subscription required |
| India | MCA21 (Ministry of Corporate Affairs) | API available |
| Other | Manual review by trust team (2 business day SLA) | |

**Integration pattern:** On registration number + country submission, a background job calls the relevant registry API. Result (`confirmed` / `not_found` / `api_unavailable`) is stored and triggers badge issuance or queues for manual review.

**Fallback:** If the registry API is unavailable, the request is queued for manual review (same flow as unsupported countries).

---

## 11. Freight Forwarder APIs (Phase 3–4)

**Used for:** In-platform freight quotes and landed cost estimates at Deal Room entry. Gracera earns a referral commission per booking.

**Target partners:** Flexport, Freightos, Freightify (evaluate at Phase 3 start based on API quality and coverage).

**Integration flow:**

```
Deal Room opened: origin country, destination country, incoterms, HS code known
        │
Gracera calls freight partner API for quote
        │
        ├── Quote returned → shown to buyer alongside deal terms
        │
        └── Quote request failed → show "Get a freight quote from [Partner]" link (fallback)
```

**Quote parameters passed to freight API:**
- Origin country + port (from supplier profile)
- Destination country + port (from RFQ delivery location)
- Estimated weight and dimensions (from product line items if available; otherwise user-entered)
- Incoterms (from agreed quote)
- HS code (from supplier profile if tagged)

**Revenue:** Referral commission of $50–$200 per completed booking (flat fee negotiated per partner). Confirmed bookings trigger a partner webhook → Gracera logs the referral for commission tracking.

---

## 12. ClamAV (File Upload Scanning)

**Used for:** Virus/malware scanning of all user-uploaded files (catalog PDFs, certification documents, Deal Room attachments).

**Implementation:** ClamAV runs as a Docker container alongside the main services. The AI service and the Next.js app both call ClamAV before storing any uploaded file in OCI Object Storage.

**Flow:**

```
User uploads file
        │
File held in memory buffer (not stored yet)
        │
ClamAV scan (via TCP socket to ClamAV daemon)
        │
        ├── CLEAN → store in OCI Object Storage → return URL to caller
        │
        └── INFECTED → reject upload → log alert → notify trust team
```

**Configuration:**
```bash
CLAMAV_HOST=gracera-clamav    # Docker service name
CLAMAV_PORT=3310
```

ClamAV virus definitions updated daily via `freshclam` cron inside the container.

**Failure handling:** If ClamAV is unreachable (container restart, timeout), the file is rejected with an error message: "File scanning temporarily unavailable — please try again in a few minutes." Files are never stored without a completed scan.

---

## 13. Trade Finance Referral Partners

**Phase 3.** Partners are integrated as referral links, not direct API integrations at launch. Full API integration considered in Phase 4 if referral volumes justify it.

**Launch model:**
- When a supplier enters the Deal Room, the platform shows a "Get Paid Now" panel
- "Learn more" → opens partner landing page in a new tab with a Gracera referral tracking parameter (`?ref=gracera&deal_id={uuid}`)
- Partner pays Gracera a referral commission on funded invoices (0.3–0.5% of invoice value)
- Commission tracked via monthly partner reporting reconciliation (not automated API at launch)

**Target partners:** Drip Capital, Crestmont Capital, C2FO (see [docs/15-monetization.md §4](15-monetization.md)).

**Phase 4 API integration** (if volumes justify): replace referral link with embedded application form; partner API returns a preliminary funding offer in real time; Gracera receives webhook on funded invoice for automated commission recognition.

---

[Back to README](../README.md)
