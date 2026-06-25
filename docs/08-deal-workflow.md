# Deal Workflow

Gracera provides two paths from match to deal: the **Standard Deal Flow** (introduction → message → RFQ → quote → deal room → closed) and the **Sample Order Fast Track** (1-click sample request, no negotiation required). Both feed into the same deal history and verification system.

---

## 1. Standard Deal Lifecycle

```
[Match Introduction]
        │
        ▼
[Introductions Accepted by Both]
        │
        ▼
[Message Thread Opens]
        │
        ├─── Informal negotiation in messages
        │
        ▼
[RFQ Issued by Buyer]          ← Category templates available
        │
        ▼
[Quote Submitted by Supplier]  ← Negotiation Coach active (private)
        │
        ├─── Counter-offer (optional, loops)
        │
        ▼
[Quote Accepted]
        │
        ▼
[Deal Room: Terms & Documents]
        │
        ▼
[Deal Closed — Both Parties Confirm]
        │
        ▼
[Post-Deal Review]
```

---

## 2. Sample Order Fast Track

A lightweight parallel path for buyers who want to evaluate a supplier via sample before committing to an RFQ. No negotiation, no deal room — just a simple request and a fixed price.

```
[Supplier sets sample price + lead time on their profile]
        │
[Buyer views supplier profile]
        │
        ▼
[Buyer clicks "Request Sample"]
        │
        ├─── Fills a 4-field form:
        │       • Product / variant
        │       • Quantity (within supplier's sample limits)
        │       • Delivery address
        │       • Notes (optional)
        │
        ▼
[Supplier notified → Confirms or declines within 48h]
        │
        ▼
[Sample dispatched → Tracking shared in thread]
        │
        ▼
[Buyer confirms receipt → Optional short review]
        │
        ▼
[Sample deal marked complete]
  → If buyer proceeds: "Convert to RFQ" button opens Standard Deal Flow
  → Positive sample outcome boosts supplier's match score for this buyer
```

**Rules:**
- Supplier sets sample price (can be $0 if offered free)
- Maximum sample quantity set by supplier per profile
- Sample Fast Track does not require both parties to have accepted a formal introduction — it is an opt-in discovery mechanism
- Platform earns a small transaction fee on paid sample orders

---

## 3. Group Buying — MOQ Pooling

A **Group Buy** allows multiple buyers with compatible sourcing needs to pool their demand and collectively meet a supplier's MOQ. This unlocks suppliers who are otherwise unreachable for buyers whose individual volume falls short of the minimum.

```
[Buyer A posts sourcing request — volume below supplier MOQ]
        │
[AI detects compatible buyers in same category with similar needs and timelines]
        │
        ▼
[Platform proposes: "Join a Group Buy for [Product]? 2 other buyers are sourcing the same."]
        │
        ├── Buyer A accepts → designated Lead Buyer
        │
[Platform invites compatible buyers B and C with context: "Group buy forming — your allocation: N units"]
        │
        ▼
[All co-buyers confirm their allocations]
        │
        ▼
[Group RFQ issued to supplier with combined volume — standard RFQ/Quote/Deal Room flow]
        │
[Lead Buyer manages supplier relationship; co-buyers track their sub-allocation]
        │
        ▼
[Consolidated shipment (default) or individual shipments (buyer's choice at Deal Room)]
```

**Rules:**
- The **Lead Buyer** manages the supplier relationship, accepts the quote, and is the primary Deal Room contact
- Co-buyers confirm their volume allocation; their sub-allocation terms are locked once the group quote is accepted
- If a co-buyer withdraws before quote acceptance, the group RFQ is cancelled or restructured (Lead Buyer decides)
- Each buyer receives their own invoice and shipment record for customs and accounting purposes
- Platform charges a **group buy coordination fee** on top of any subscription (see monetization)

---

## 4. Stage Definitions — Standard Flow

### Stage 0 — Match Introduction

- AI Agent surfaces a match to both parties
- Each party sees a match card with score, rationale (in their language), and the other party's public profile
- **Actions available:**
  - Accept introduction → Stage 1
  - Pass / Not interested → negative feedback logged

### Stage 1 — Message Thread

- A private, platform-hosted message thread opens
- Both parties can view each other's full profile
- Contact details (email, phone) remain hidden until both parties mutually choose to share
- Parties can exchange documents, product specs, and samples in this thread
- **Actions available:**
  - Issue RFQ (Buyer) → Stage 2
  - Archive thread → deal abandoned

### Stage 2 — RFQ

Buyer creates a structured Request for Quotation. **Category templates** pre-fill common fields for 20+ sourcing verticals (food ingredients, electronics, apparel, industrial equipment, etc.) — reducing the time to issue a first RFQ from 20 minutes to under 5.

| RFQ Field | Type | Notes |
|-----------|------|-------|
| `product_service_description` | text | What is being quoted |
| `quantity` | integer + unit | |
| `delivery_location` | text | Port, city, address |
| `required_delivery_date` | date | |
| `required_certifications` | string[] | Any additional compliance asks |
| `preferred_incoterms` | enum | Pre-filled by category template |
| `preferred_payment_terms` | enum | |
| `sample_required` | boolean | |
| `additional_notes` | text | |
| `rfq_valid_until` | date | Expiry date for quote response |

**Multi-Supplier RFQ:**
Buyers may send the same RFQ to up to 5 matched suppliers simultaneously. Each supplier receives and responds independently — quotes are visible only to the buyer, never to competing suppliers. When multiple quotes arrive, the buyer sees a **side-by-side quote comparison view** (price, lead time, payment terms, Negotiation Coach recommendation per quote). The buyer selects a winning quote; non-selected suppliers receive an automated polite decline. All non-selected quotes remain private.

**Decision-maker routing:** When an RFQ arrives, the platform routes the notification to the supplier contact whose `routing_types` includes `commercial`. If no commercial contact is registered, it goes to the primary contact. A system note is prepended: *"This RFQ has been routed to [Name] ([role]) as your designated commercial contact."* If the RFQ contains certification or specification requirements, a parallel notification is also sent to the `technical` contact if one is registered.

Supplier is notified of the RFQ. Supplier can:
- Submit a Quote → Stage 3
- Request clarification (in message thread)
- Decline RFQ → deal archived

### Stage 3 — Quote

Supplier submits a structured Quote. The **Negotiation Coach Agent** activates at this stage, delivering private coaching to each party independently.

| Quote Field | Type | Notes |
|-------------|------|-------|
| `line_items` | LineItem[] | Product/service, quantity, unit price |
| `currency` | enum | |
| `incoterms` | enum | |
| `lead_time_days` | integer | |
| `payment_terms` | enum | |
| `validity_date` | date | |
| `notes` | text | |
| `sample_price` | float | Optional |
| `attachments` | URL[] | Spec sheets, price lists |

**LineItem sub-schema:**

| Field | Type |
|-------|------|
| `description` | string |
| `quantity` | integer |
| `unit` | string |
| `unit_price` | float |
| `total_price` | float (computed) |

**Negotiation Coach (private to each party):**
- Supplier coaching: category-typical acceptance range, lead time flexibility norms, payment term leverage
- Buyer coaching: market price benchmarks, typical counter-offer rounds, negotiating levers
- Neither party sees the other's coaching; it is stored per-user only and not in deal logs

Buyer can:
- Accept Quote → Stage 4
- Counter-offer → loops at Stage 3
- Decline → deal archived

### Stage 4 — Deal Room

Both parties have agreed on the quote. Deal Room is a shared space for finalizing:

- **Documents:** Pro-forma invoice, packing list, NDA, purchase order — upload and sign-off
- **Checklist:** Both parties confirm each milestone
- **Status tracking:** Deal moves through configurable milestones

**Default deal milestones:**

| Milestone | Confirmed by |
|-----------|-------------|
| Quote accepted | Buyer |
| Pro-forma invoice issued | Supplier |
| Deposit received | Supplier |
| Production started | Supplier |
| Sample approved (if applicable) | Buyer |
| Production completed | Supplier |
| Pre-shipment inspection passed (if requested) | Third-party inspector / Buyer |
| Shipment booked | Supplier |
| Documents shared | Supplier |
| Goods received | Buyer |
| Final payment sent | Buyer |
| Deal closed | Both |

**Trade Finance Referral (at Deal Room entry):**
When a deal enters the Deal Room stage, the supplier is shown a "Get Paid Now" option — a referral to a trade finance partner offering invoice factoring (receive 85–90% of invoice value immediately, while buyer's Net 60 terms play out normally). Revenue share to Gracera on each referral.

**Gracera Verified Logistics (at Deal Room entry):**
In-platform freight quotes from partner forwarders are shown alongside deal terms. Buyers see an estimated **landed cost** (product + freight + duties) based on origin, destination, incoterms, and HS code. Buyers can book directly; revenue share to Gracera.

**E-Signature & Contract Templates (at Deal Room entry):**
Native contract templates are available pre-populated from deal data (party names, product, quantity, price, incoterms, payment terms):

| Template | Common use |
|----------|-----------|
| Purchase Order (PO) | Formal buyer commitment |
| Distribution Agreement | Exclusive/non-exclusive reseller agreements |
| Non-Disclosure Agreement (NDA) | Sensitive product or formula negotiations |
| Sample Agreement | Paid sample terms and IP protection |

Either party initiates e-signature via the DocuSign/HelloSign integration from within the Deal Room. The signed document is stored permanently in the Deal Room; both parties receive a PDF copy by email.

**Third-Party Inspection (after Production completed milestone):**
After the supplier confirms "Production completed", the buyer can request a pre-shipment inspection through a partner inspection service (SGS, Bureau Veritas, QIMA). The buyer selects the inspector and confirms the booking in-platform. The inspection report is uploaded directly to the Deal Room by the inspector. Gracera earns a referral commission per booking. If the inspection fails, the deal re-enters the negotiation stage or can be escalated as a dispute.

**Buyer Protection / Payment Security (at Deal Room entry):**
First-time cross-border buyers are shown a **"Buyer Protection"** referral to a payment security partner that holds the buyer's payment and releases it in tranches tied to confirmed milestones (e.g., Deposit released on Production started; remainder on Goods received). No payment is transmitted through Gracera — this is a third-party escrow-as-a-service referral. Especially recommended when both parties are transacting for the first time.

**Human Translation (in Deal Room or message thread):**
Either party can request a **"Book a Translator"** session from within the Deal Room or message thread. A vetted Gracera trade translator joins for the booked session and leaves when it ends. See [§10 Human Translator Network](#10-human-translator-network) for the full spec.

### Stage 5 — Post-Deal Review

After both parties confirm "Deal Closed":
- Both parties are invited to leave a review of the transaction
- Reviews are visible on both profiles (visible only after both parties submit)
- Deal outcome feeds back into AI matching as a strong positive signal
- Both parties are added to each other's **Verified Deal Network** — a permanent connection visible on their profiles as social proof

**Repeat Orders:**
Closed deals show a **"Reorder"** button for both parties. Clicking it pre-populates a new RFQ with the terms from the closed deal (product, quantity, price, incoterms, payment terms) — bypassing the full match/introduction flow, since the Verified Deal Network connection is the direct channel. The buyer can modify any field before issuing.

For recurring buyers (`order_frequency` = Monthly, Quarterly, or Annual), the supplier can enable a **"Reorder Reminder"**: the platform prompts the buyer at their typical reorder interval (e.g., "Your last order from [Supplier] was 90 days ago — ready to reorder?") with a pre-populated draft RFQ.

---

## 5. RFQ Category Templates

Pre-built RFQ templates reduce first-RFQ friction. Buyers select their sourcing category and a template pre-fills standard fields, typical certifications, and common incoterms for that category.

| Category | Pre-filled defaults |
|----------|-------------------|
| Food & Beverage | FSSC 22000 / HACCP certifications, FOB or CIF incoterms, kosher/halal options |
| Electronics & Components | RoHS / CE certifications, EXW or FOB, HS code field highlighted |
| Apparel & Textiles | GOTS / OEKO-TEX options, FOB common, fabric composition required |
| Industrial Equipment | ISO 9001, custom drawing upload field, warranty terms |
| Health & Beauty | FDA / EU Cosmetics Regulation, private label flag, INCI list required |
| Chemicals & Materials | REACH / SDS required, minimum order weight, hazmat shipping flag |

Phase 3 target: 20 category templates covering 80% of common sourcing categories on the platform.

---

## 6. Supplier Alliance Packs

A **Supplier Alliance Pack** allows complementary suppliers to present themselves as a bundled offering. Example: a PCB manufacturer + a freight forwarder + a third-party inspection service form a pack — buyers see the bundle as a single "one-stop sourcing" option for their electronics category.

- Initiated by any member of the alliance
- Up to 4 suppliers per pack
- Each member maintains their own profile and deal relationships
- Pack is displayed on each member's profile as a "Also offered as part of Alliance Pack"
- Buyer can contact the pack as a group or individual members separately
- Platform earns fees on each individual deal within the pack

---

## 7. Dispute Resolution

Either party may file a dispute on an active deal or within 30 days of deal close.

### 7.1 Filing a Dispute

Navigate to the deal → "Report a Problem" → select a category and describe the issue (50–2,000 words) → upload supporting evidence (photos, shipping docs, payment records).

| Category | Description |
|----------|-------------|
| Non-delivery | Goods not received by agreed delivery date |
| Wrong specification | Goods received do not match the agreed specification |
| Quality issue | Goods fail the quality standards specified in the RFQ |
| Payment refused | Buyer refuses payment after milestones are confirmed |
| Certification mismatch | Supplier's certification was not valid at time of shipment |
| Other | Free-text description |

### 7.2 Escalation Path

```
[Dispute Filed]
        │
[48-hour cooling-off: parties encouraged to resolve in Deal Room thread]
        │
        ├── Resolved bilaterally → dispute closed; both parties confirm
        │
        ▼
[Gracera Trust Team reviews evidence]  ← 5 business day SLA
        │
        ├── Non-binding recommendation issued
        │
        ├── Resolved → dispute closed
        │
        ▼
[External arbitration referral]  ← if unresolved after trust team review
        → Recommended body: ICC, CIETAC, or SIAC (based on party countries)
        → Gracera provides deal record export as evidence package
```

### 7.3 Dispute Status States

| Status | Description |
|--------|-------------|
| `DISPUTE_FILED` | Dispute raised; 48-hour cooling-off period active |
| `DISPUTE_UNDER_REVIEW` | Gracera trust team reviewing |
| `DISPUTE_RESOLVED` | Closed bilaterally or after trust team recommendation |
| `DISPUTE_REFERRED` | Referred to external arbitration |

See [Security & Trust §9](12-security-and-trust.md#9-dispute-resolution-policy) for account consequences.

---

## 8. Deal Status States

```
PENDING_ACCEPTANCE (Sample Fast Track: SAMPLE_REQUESTED)
      │
      ▼
MESSAGING
      │
      ├──→ ABANDONED
      │
      ▼
RFQ_ISSUED
      │
      ├──→ ABANDONED
      │
      ▼
QUOTE_SUBMITTED
      │
      ├──→ COUNTER_OFFER (loops back to QUOTE_SUBMITTED)
      ├──→ ABANDONED
      │
      ▼
DEAL_ROOM
      │
      ├──→ ABANDONED
      │
      ▼
CLOSED
```

---

## 9. Notifications

| Event | Notify |
|-------|--------|
| New match surfaced | Both parties (in-app + email digest) |
| Introduction accepted by other party | Notified party |
| New message received | Recipient |
| Sample request received | Supplier |
| Sample dispatched | Buyer |
| RFQ issued | Supplier |
| Quote submitted | Buyer |
| Counter-offer received | Other party |
| Trade finance / logistics offer available | Supplier / Buyer (at Deal Room entry) |
| Deal milestone confirmed | Other party |
| Deal closed | Both parties |
| Review left | Other party |
| Inspection booking confirmed | Both parties |
| Inspection report uploaded | Buyer |
| E-signature requested | Other party |
| E-signature completed | Both parties |
| Dispute filed | Other party |
| Dispute recommendation issued | Both parties |
| Group buy invitation | Invited co-buyers |
| Group buy allocation confirmed | Lead Buyer |
| Reorder reminder triggered | Buyer |

---

## 10. Human Translator Network

For high-stakes negotiations where machine translation is inadequate — large distribution agreements, technical specification disputes, legal term negotiation — Gracera provides access to a vetted network of industry-specialist trade translators.

### 10.1 Translator Vetting

All Gracera trade translators are independently vetted before joining the network:

| Requirement | Standard |
|------------|---------|
| Language proficiency | Native or C2 level in both source and target languages, verified via standardized test |
| Industry knowledge | Demonstrated familiarity with trade terminology in the relevant vertical, assessed via a written test specific to that vertical |
| Professional background | Minimum 3 years translating B2B trade documents, contracts, or live negotiations in the relevant industry |
| Confidentiality | Signed NDA with Gracera before any access to platform deal data |
| Reference check | Two professional references from prior B2B translation clients |

Translators are certified for specific **language pair + vertical** combinations. A translator certified for EN↔ZH in Food & Beverage cannot be assigned to an EN↔ZH session in Industrial Equipment without separate vertical certification.

**Priority language pairs at launch:** EN↔ZH, EN↔KO, EN↔AR, EN↔ES, EN↔JA

### 10.2 Session Booking

Either party initiates from within the Deal Room or message thread:

1. Select language pair (auto-detected from both parties' `languages_spoken`; overridable)
2. Select session length (1–4 blocks of 30 minutes)
3. Choose a time window — platform suggests 2 options based on both parties' timezones
4. Gracera matches a translator (within 2 hours standard; 30 minutes for urgent, surcharge applies)
5. Both parties receive a notification: translator name, credential summary, confirmed session time

**Minimum lead time:** 4 hours for standard booking. Urgent booking (< 2 hours) available with a 25% surcharge.

### 10.3 Session Mechanics

The translator joins the existing deal thread as a temporary participant with a distinct `[Translator]` role badge:

| Participant | Thread access | Permitted actions |
|-------------|--------------|-------------------|
| Buyer | Full thread history + session timer | Send messages (auto-translated to supplier's language) |
| Supplier | Full thread history + session timer | Send messages (auto-translated to buyer's language) |
| Translator | Full thread history (this deal only) | Post translations; add `[Translator Note]` for nuance or ambiguity; cannot post as either party |

Translations appear as a distinct message immediately below the original, formatted:

```
[Buyer — English]  "We need the lead time reduced to 28 days or we cannot proceed."
[Translator]       "我们需要将交货时间缩短到28天，否则我们无法继续。"
```

A session timer is visible to all parties. Ten minutes before end-of-session, all parties receive a warning. Sessions can be extended at the per-block rate if the translator is still available.

### 10.4 Scope & Confidentiality

| Rule | Detail |
|------|--------|
| Data access | Translator sees only the deal thread they are assigned to — no other deals, no profile data beyond what appears in the thread |
| No retention | Translators may not retain, copy, or reference deal content after the session ends |
| NDA enforcement | Confidentiality breach triggers immediate removal from the network and legal action per the translator agreement |
| Gracera's position | Gracera facilitates the introduction between parties and translators. Gracera does not monitor session content in real time. |

### 10.5 Post-Session

- Translator thread access is revoked automatically when the session timer ends
- A session metadata record is added to the deal audit log (timestamp, translator ID, duration, language pair — not the content)
- Both parties are invited to rate the translator (1–5 stars, optional comment)
- Translators below a 4.0 average over 20+ sessions are reviewed for removal from the network

### 10.6 Pricing

| Session length | Price (initiating party pays) | Gracera margin |
|---------------|------------------------------|----------------|
| 30 minutes | $45 | 25% |
| 60 minutes | $80 | 25% |
| 90 minutes | $115 | 25% |
| 120 minutes | $150 | 25% |
| Urgent surcharge | +25% on session price | same |

Enterprise subscribers receive 2 complimentary 30-minute sessions per month. For deals where one party is significantly larger (e.g., a major retailer and a small manufacturer), the larger party often offers to cover translator cost as a deal-facilitation gesture — this is at the parties' discretion and not managed by the platform.

---

[Back to README](../README.md)
