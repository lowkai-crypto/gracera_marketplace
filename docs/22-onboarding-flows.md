# Onboarding Flows

Step-by-step activation flows for suppliers and buyers, with completion gates, success criteria, and the white-glove concierge path for non-self-serve users.

---

## 1. Principles

- **Time-to-value in under 10 minutes.** RAG auto-population reduces the profile-building burden from a 30-minute form to a guided review of AI-extracted fields.
- **Progressive activation.** Users earn their first match before they complete everything — the match acts as proof that the investment pays off.
- **Both sides, simultaneously.** Every activation feature ships in pairs: supplier and buyer.
- **Completeness gates are soft floors.** A 60% complete supplier profile can publish; a 40% complete profile gets coached but blocked — the gate prevents thin profiles from degrading match quality.

---

## 2. Supplier Activation Flow

### Step Overview

```
Registration
      │
Email Verification
      │
      ▼
Step 1 — Catalog Upload (RAG auto-populate)
      │
      ▼
Step 2 — Review & Edit AI-Extracted Fields
      │
      ▼
Step 3 — Guided Wizard (with live match counter)
      │
      ▼
Completeness Check (≥ 60% gate)
      │
      ├── < 60% → coaching nudge, blocked from publishing
      │
      ▼
Profile Published
      │
      ▼
First Match Surfaced (within 1 hour)
      │
      ▼
Decision-Maker Coaching Card shown
      │
      ▼
[72-hour safety net if 0 introductions accepted]
```

---

### Step 1 — Catalog Upload

**Screen:** "Upload your product catalog or brochure to get started fast."

- Accepted formats: PDF, DOCX, XLSX (max 25 MB)
- "Skip and fill manually" option (no penalty; continues to Step 2 with empty fields)
- On upload: AI service starts RAG pipeline in background (typically 30–90 seconds)
- Progress indicator: animated "AI is reading your catalog…" with estimated time
- On complete: user is taken to Step 2 with pre-filled fields

**RAG extraction targets from catalog/brochure:**
- Company name
- Product categories (mapped to Gracera taxonomy)
- Product descriptions (up to 5 products)
- Certifications mentioned
- Minimum order quantities
- Countries of operation / export markets
- Languages spoken
- Production capacity signals

### Step 2 — Review AI-Extracted Fields

**Screen:** Split view — extracted content (left), profile field (right)

- Each AI-extracted field shows the source snippet (highlighted in the original document) alongside the extracted value
- User can: Accept as-is | Edit | Delete
- Fields with low extraction confidence are flagged: "We weren't sure about this — please verify"
- User can add fields the AI missed
- Progress bar shows completeness score updating in real time as fields are filled

**Completeness score weights** (same as matching algorithm):

| Field group | Weight |
|------------|--------|
| Product categories | 20% |
| Company description | 10% |
| Geographic reach | 15% |
| Certifications | 15% |
| MOQ + pricing range | 10% |
| Languages spoken | 10% |
| Production capacity | 10% |
| Contact information | 10% |

### Step 3 — Guided Wizard

**Screen:** Stepped form (6 sections), each with a "live match counter" in the sidebar

The live match counter shows the estimated number of active buyer sourcing requests that currently match the supplier's profile. It updates as the supplier completes each section. This is a product activation mechanic — watching the counter grow is the core incentive to complete the profile.

**Wizard sections:**

1. **Identity** — company name, founding year, company size, country, website
2. **Products & Categories** — category selections (multi-level from taxonomy), product list
3. **Capabilities** — MOQ, lead time range, production capacity, available for custom work (Y/N)
4. **Certifications** — multi-select from standard list + custom entry; upload documents (optional at this stage)
5. **Markets & Trade** — export countries, preferred incoterms, currencies accepted, languages spoken
6. **Contact** — primary contact name, role, additional contacts (commercial / technical / finance)

**Completeness gate check** runs after the wizard:
- ≥ 60%: "Ready to publish" CTA shown
- 40–59%: "Your profile needs a bit more to get good matches. Here's what's missing: [specific list]" — CTA still available but with warning
- < 40%: Publishing blocked. "Complete these sections first: [list]" — no publish CTA

### Profile Published

On publish:
- Elasticsearch index updated immediately
- Matching engine triggered via Redis Streams event (`profile.published`)
- First match surface target: within 1 hour

**First-match confirmation screen** (shown when first match arrives):
> "You've been matched with a buyer in [category]. They're sourcing [product]. Accept the introduction to start a conversation."

### Decision-Maker Coaching Card

Shown when the supplier's first introduction is surfaced. A private AI-generated card (not visible to the buyer) containing:
- Who the buyer likely is: company type, size, likely role of the person they'll speak to
- What to lead with: what this buyer typically cares about (certifications? pricing? lead times?)
- Whether to ask an escalation question: "Ask early if they have budget authority or if they need procurement sign-off"
- Red flags to watch for (if any, based on buyer profile signals)

### 72-Hour Safety Net

If 72 hours pass after first publish with zero accepted introductions:
- Email sent: specific benchmark gap list ("Your MOQ is 3x the category average — 80% of buyers in your category need MOQs below 500 units")
- In-app nudge with same content
- Admin notified in platform metrics if > 5% of new suppliers hit the 72-hour safety net (signals a systemic onboarding problem)

---

## 3. Buyer Activation Flow

### Step Overview

```
Registration
      │
Email Verification
      │
      ▼
Step 1 — Category Selection (template pre-fill)
      │
      ▼
Step 2 — Sourcing Request Builder (live match count preview)
      │
      ▼
Step 3 — Certification & Compliance Auto-suggest
      │
      ▼
Sourcing Request Completeness Coaching
      │
      ▼
Sourcing Request Published
      │
      ▼
First 5 Matches Surfaced (within 1 hour)
      │
      ▼
Decision-Maker Coaching Card shown
      │
      ▼
[24-hour safety net if 0 matches surfaced]
```

---

### Step 1 — Category Selection

**Screen:** "What are you sourcing?"

- Visual category grid (top-level verticals with icons): Food & Beverage, Electronics, Apparel, Industrial Equipment, Health & Beauty, Chemicals, + others
- User selects one or more categories
- On selection: category template pre-fills the sourcing request form (Step 2) with typical fields and defaults for that category

### Step 2 — Sourcing Request Builder

**Screen:** Pre-filled form with live match counter in sidebar

Live match counter shows how many active supplier profiles currently match the buyer's criteria as they fill in the form. Watching the counter helps buyers understand when their criteria are too narrow.

**Form fields (category-templated):**
- Product / service description (required)
- Required quantity + unit
- Target delivery date
- Delivery location (country, port or city)
- Budget range (private — AI eyes only, never shown to suppliers)
- Preferred incoterms (pre-filled by category template)
- Required certifications (multi-select, auto-suggested in Step 3)
- Sample required (Y/N)
- Preferred payment terms
- Additional notes

**Match count guidance:**
- ≥ 20 matching suppliers: "Great — you have a healthy shortlist"
- 5–19: "You have some matches — consider broadening certification requirements to find more"
- < 5: Warning banner: "Your criteria are very specific — you may want to broaden [specific field]"

### Step 3 — Certification & Compliance Auto-suggest

Based on the buyer's delivery destination country, the platform auto-suggests relevant certification requirements:

| Destination | Auto-suggested certs (Food example) |
|-------------|-------------------------------------|
| US | FDA Food Facility Registration, FSMA compliance |
| EU | EU Food Safety / Regulation (EC) No 178/2002, CE (if applicable) |
| Japan | JAS certification, Ministry of Health approval |
| UAE | ESMA, Halal (if applicable) |
| Australia | FSANZ, Australian quarantine compliance |

User can accept, dismiss, or add custom requirements.

### Sourcing Request Published

On publish:
- Anti-spam scan runs automatically (< 1 minute)
- Matching engine triggered immediately
- First 5 matches target: within 1 hour

### 24-Hour Safety Net

If 24 hours pass with zero matches surfaced:
- Prospecting Agent fires automatically — searches off-platform (trade show lists, public directories) for suppliers matching the criteria
- Email sent to buyer: "No matches yet — the Prospecting Agent is reaching out to suppliers on your behalf" with criteria used
- Invitation emails sent to identified off-platform suppliers (see [docs/21 §3.2](21-notifications-email-spec.md))

---

## 4. Dual-Role Account Onboarding

Users who register with `role = both` (one login that holds a supplier profile AND a buyer profile):

**Registration:**
- On signup, user selects: "I'm a Supplier", "I'm a Buyer", or "I'm both (I buy and sell)"
- "Both" selection shows a brief explanation: "You'll have a Supplier Dashboard and a Buyer Dashboard under one login. You'll switch between them using the toggle at the top."

**Onboarding sequence for dual-role:**
1. Complete Supplier activation flow (Steps 1–3) first
2. After first supplier match is surfaced: prompt "Now set up your Buyer profile to source from other suppliers on Gracera"
3. Complete Buyer activation flow independently

**Dashboard context switcher:**
- Top navigation shows: `[Supplier] ▼` or `[Buyer] ▼` — user taps to switch context
- Notification inbox is unified; each notification is tagged [S] or [B] in the list
- Subscriptions are independent: user can be Pro as a supplier and Free as a buyer

**Self-match suppression:** The matching engine never surfaces a user's own supplier profile to their buyer profile, and vice versa.

---

## 5. White-Glove Concierge Onboarding (Phase 2+)

For suppliers who struggle with self-serve — particularly high-quality manufacturers with limited digital familiarity.

**Trigger points for white-glove offer:**
- User starts the wizard, reaches < 40% completeness after 20 minutes with no upload
- User abandons the wizard before publishing (email follow-up after 24 hours)
- Admin manually assigns from the verification queue (for high-value targets identified via outreach)

### 5.1 The Concierge Flow

```
Intake Form (5 fields: company, category, country, preferred language, contact)
      │
      ▼
Booking Confirmation (specialist assigned, calendar link sent)
      │
      ▼
Specialist Interview (30–60 min video or phone call)
      │
      ▼
Profile Build (specialist builds profile in admin split-screen tool, ≥ 85% target)
      │
      ▼
Supplier Review & Approval (supplier reviews draft via a shareable preview link)
      │
      ▼
Publish + First Match Monitor (specialist watches for first match, notifies supplier)
```

### 5.2 Specialist Requirements

All white-glove specialists are certified per vertical:
- Food & Beverage
- Electronics & Components
- Apparel & Textiles
- Industrial Equipment

A specialist cannot conduct an interview in a vertical they are not certified for. Vertical certification requires: completing the vertical knowledge test, shadowing 3 sessions with a senior specialist, and passing a profile quality audit.

### 5.3 Admin Tooling

Specialists use a split-screen admin tool:
- Left: interview notes / upload window (catalog, certifications)
- Right: live profile builder (same fields as the self-serve wizard)
- RAG pipeline can be triggered manually from this screen
- Completeness score displayed live

### 5.4 Quality Gate

Before the specialist submits the profile for supplier review:
- Completeness score must be ≥ 85%
- At least 2 product categories must be tagged
- Primary contact must be filled
- At least 1 certification must be entered (even if document not yet uploaded)

### 5.5 Pricing

$199 one-time setup fee, or included in annual Pro subscription. Requires minimum 3-month Pro commitment post-onboarding.

---

## 6. Success Criteria

### Activation SLAs (from [docs/01-product-requirements.md §4](01-product-requirements.md))

| SLA | Target |
|-----|--------|
| Time to first match after supplier profile publish | < 1 hour |
| Time to first match after buyer sourcing request publish | < 1 hour |
| Supplier profiles with ≥ 1 introduction accepted within 7 days | > 60% |
| Buyer sourcing requests with ≥ 1 supplier response within 48 hours | > 70% |
| No-match rate (supplier publishes, receives zero matches) | < 5% |

### Activation Funnel Checkpoints

**Supplier funnel:**
- Registration complete → 100%
- Catalog uploaded or wizard started → target 80%
- Profile published (≥ 60% complete) → target 70%
- First match surfaced → target 95% of published profiles
- First introduction accepted → target 60% within 7 days

**Buyer funnel:**
- Registration complete → 100%
- Sourcing request started → target 85%
- Sourcing request published → target 75%
- First 5 matches surfaced → target 95% of published requests
- First introduction accepted → target 65% within 48 hours

These funnel rates are tracked in the admin platform metrics dashboard (see [docs/20-admin-ops-spec.md §9](20-admin-ops-spec.md)).

---

[Back to README](../README.md)
