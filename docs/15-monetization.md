# Monetization Strategy

How Gracera generates revenue across subscriptions, transactions, referrals, and data products — diversified across the platform lifecycle.

---

## 1. Revenue Stream Overview

| Stream | When Available | Type | Margin |
|--------|---------------|------|--------|
| Subscription tiers | Phase 1 | Recurring | High |
| Sample Order transaction fee | Phase 2 | Per-transaction | Medium |
| Trade Finance referral | Phase 3 | Referral commission | High |
| Gracera Verified Logistics | Phase 3–4 | Referral commission | High |
| Gracera Intelligence Reports | Phase 4 | Data product | Very high |
| Lead credits / boosted visibility | Phase 5 | Pay-per-use | Medium |
| Alliance Pack premium listings | Phase 5 | Placement fee | Medium |
| Success fee on closed deals | Phase 5 | Per-transaction (opt-in) | Medium |
| API access / ERP integrations | Phase 5 | Recurring | High |
| White-glove supplier onboarding | Phase 2 | Per-engagement | Medium |
| Third-party inspection referral | Phase 3 | Referral commission | High |
| Human translation sessions | Phase 3–4 | Per-session margin | Medium |
| Group buy coordination fee | Phase 4 | Per-group-deal | Medium |
| Trade policy alert feed | Phase 4 | Subscription premium | High |

---

## 2. Subscription Tiers

### 2.1 Supplier Tiers

| Feature | Free | Pro ($49/mo) | Enterprise ($199/mo) |
|---------|------|-------------|---------------------|
| Profile listing | ✓ | ✓ | ✓ |
| AI matches per month | 3 | Unlimited | Unlimited |
| RAG profile auto-population | — | ✓ | ✓ |
| Match rationale visible | Partial | Full | Full |
| AI Business Insights Brief | — | ✓ | ✓ |
| Growth Strategy Engine | — | ✓ | ✓ |
| SOP Library | — | ✓ | ✓ |
| Supplier Broadcast Campaigns | — | 2/mo | Unlimited |
| Verified Business badge | — | ✓ | ✓ |
| Alliance Pack membership | — | 1 pack | Unlimited |
| Gracera Intelligence Reports | — | — | ✓ |
| AI Negotiation Coach | — | ✓ | ✓ |
| AI-Brain (Business Advisor) | — | ✓ | ✓ |
| AI Growth Advisor (adoption roadmap) | — | ✓ | ✓ |
| API access | — | — | ✓ |
| Priority in match ranking | — | — | ✓ |

### 2.2 Buyer Tiers

| Feature | Free | Pro ($29/mo) | Enterprise ($99/mo) |
|---------|------|-------------|---------------------|
| Browse suppliers | ✓ | ✓ | ✓ |
| Sourcing requests | 1 active | 10 active | Unlimited |
| AI match suggestions | 5 total | Unlimited | Unlimited |
| Sample Order Fast Track | ✓ | ✓ | ✓ |
| AI Price Compass | — | ✓ | ✓ |
| AI Negotiation Coach | — | ✓ | ✓ |
| AI-Brain (Business Advisor) | — | ✓ | ✓ |
| AI Growth Advisor (adoption roadmap) | — | ✓ | ✓ |
| Downstream customer segmentation | — | ✓ | ✓ |
| Sourcing Diversification Strategy | — | ✓ | ✓ |
| Gracera Intelligence Reports | — | — | ✓ |
| API access | — | — | ✓ |
| Dedicated account manager | — | — | ✓ |

### 2.3 Billing

- Monthly and annual billing (annual = 2 months free)
- Online payment (Stripe) for most users
- **Offline payment (wire transfer)** for international SMBs who cannot pay by credit card — admin confirmation queue; invoice generated in USD with optional display currency
- Invoice PDF auto-generated for all paid plans
- Subscription renewal runs on a daily cron (existing SkyStarCloud infrastructure)

---

## 3. Sample Order Transaction Fee

When a buyer places a paid sample order via the Sample Order Fast Track:
- Gracera charges a **10% platform fee** on the sample price
- Minimum fee: $2 per order
- Free samples (supplier-priced at $0) incur no fee
- Fee is charged to the buyer at order confirmation; remitted to supplier minus the platform fee

**Rationale:** Sample orders are high-intent, low-friction conversions. Even a $5 sample fee generates platform data, a verified transaction, and a warm supplier-buyer relationship likely to convert to a full deal.

---

## 4. Trade Finance Referral

When a deal enters the Deal Room stage, the supplier is offered a **"Get Paid Now"** option via a partner trade finance provider (invoice factoring).

**Mechanics:**
- Supplier receives 85–90% of invoice value immediately from the finance partner
- Buyer's payment terms (e.g., Net 60) are unchanged — they pay the finance partner directly
- Gracera earns a **referral commission of 0.3–0.5% of invoice value** from the finance partner
- No risk to Gracera — purely a referral relationship

**Target partners:** Drip Capital, Crestmont Capital, C2FO, or equivalent trade finance providers active in cross-border SME lending.

**Revenue model example:**
- 50 deals/month enter Deal Room at average invoice value of $25,000
- 20% take the trade finance referral = 10 referrals/month
- Average commission: 0.4% × $25,000 = $100/referral
- Monthly trade finance revenue: ~$1,000 (growing with deal volume)

---

## 5. Gracera Verified Logistics

At Deal Room entry, buyers receive in-platform freight quotes from 2–3 partner freight forwarders, including a full landed cost estimate (product + freight + duties).

**Mechanics:**
- Freight quotes pulled via real-time API from partner forwarders
- Buyer can book directly in-platform or use their own forwarder
- Gracera earns a **referral commission of $50–$200 per booking** (flat fee, negotiated with partners) or a % of freight value
- No logistics operations risk — purely referral

**Target partners:** Flexport, Freightos, Freightify, or equivalent digital freight forwarders with B2B API access.

**Value to buyers:** The single biggest source of "sticker shock" in cross-border B2B is the gap between the quoted FOB price and the actual landed cost. Gracera eliminates this surprise before a deal is committed.

---

## 6. Gracera Intelligence Reports

Aggregated, anonymized trade data from platform transactions published as market intelligence reports.

### 6.1 Report Types

| Report | Contents | Audience | Price |
|--------|----------|----------|-------|
| Category Market Report | Average MOQ, price ranges, lead times, top certifications, sourcing countries by category | Buyers, strategic analysts | $299/report or Enterprise subscription |
| Supplier Benchmark Report | How a supplier's profile compares to category top performers | Suppliers | Included in Pro/Enterprise |
| Trade Flow Report | Volume and deal flow between country pairs by category, per quarter | Enterprise buyers, trade analysts | $499/report |
| Vertical Sourcing Guide | Narrative + data guide for a specific sourcing category | All | Free (content marketing) |

### 6.2 Data Governance

- All data is anonymized and aggregated — no individual deal or company is identifiable
- Minimum sample size: 20 data points per cell (no cell with fewer than 20 deals is reported)
- Users consent to anonymized data use in Gracera's Terms of Service
- GDPR-compliant aggregation — no PII in report data

### 6.3 Revenue Model

- Free Vertical Sourcing Guides drive SEO/AEO and platform awareness
- Paid Category and Trade Flow Reports sold to buyers, analysts, and enterprise procurement teams
- Intelligence Reports included in Enterprise subscription tier

---

## 7. Lead Credits & Boosted Visibility

Available in Phase 5 as an add-on to any paid subscription.

- **Lead Credits:** Suppliers purchase credits to "boost" their profile in match results for specific categories or buyer types. Credits are consumed per impression (supplier profile viewed by a buyer in a boosted category)
- **Alliance Pack Premium Listings:** Supplier Alliance Packs pay for featured placement in vertical search results
- **Sponsored category pages:** Suppliers pay for featured placement at the top of a programmatic SEO category page

**Guardrails:** Boosted suppliers are clearly labeled "Sponsored" or "Featured." Match quality for non-boosted suppliers is unaffected — boosts only affect placement within the same quality tier.

---

## 8. New Revenue Streams

### 8.1 White-Glove Supplier Onboarding

A concierge onboarding service for suppliers who struggle with self-serve profile setup — particularly high-quality manufacturers in emerging markets with limited digital familiarity.

**Mechanics:** A Gracera team member (or trained specialist) builds the supplier's profile via a phone or video interview, uploads their catalog, and completes profile verification on their behalf.

**Pricing:** $199 one-time setup fee, or included in an annual Pro subscription. Requires a minimum 3-month commitment.

**Why it matters as revenue:** Every concierge session is a direct supplier acquisition conversation — it generates a completed, high-quality profile and a committed Pro subscriber simultaneously.

---

### 8.2 Third-Party Inspection Referral

When a buyer requests a pre-shipment inspection from within the Deal Room (after "Production completed" milestone), Gracera routes the booking to a partner inspection service (QIMA, SGS, Bureau Veritas).

**Revenue:** Referral commission of $30–$80 per inspection booking (flat fee negotiated with partners), or 5–8% of inspection fee.

**Volume projection:** At 200 active Deal Rooms and a 30% inspection uptake rate, that is ~60 inspections/month. At $50 average commission: ~$3,000/month, growing with deal volume.

---

### 8.3 Human Translation Sessions

Vetted trade translators bookable from within the Deal Room or message thread for high-stakes negotiations.

**Pricing:** $40–$80 per 30-minute session (varies by language pair and industry vertical). Gracera charges the buyer or supplier who initiates, and earns a 25–30% platform margin on translator fees.

**Language pairs prioritized:** EN↔ZH, EN↔KO, EN↔AR, EN↔ES, EN↔JA.

---

### 8.4 Group Buy Coordination Fee

When a Group Buy closes (all co-buyer allocations fulfilled), Gracera charges a **coordination fee of 1.5%** on the total group order value (split pro-rata among co-buyers based on their allocation).

**Rationale:** The coordination fee is substantially below what a sourcing agent would charge (typically 3–5%), and Gracera delivers automated matching, communication infrastructure, and deal tracking in return.

---

### 8.5 Trade Policy Alert Feed

The real-time tariff and trade policy alert feed is available as a premium tier feature:

| Tier | Access |
|------|--------|
| Free | No alerts |
| Pro | Weekly email digest of relevant tariff changes |
| Enterprise | Real-time in-platform alerts + full alert history + Policy Impact Score per category |

Enterprise subscribers also receive policy change summaries inside their Intelligence Reports.

---

## 9. API Access & ERP Integrations

Enterprise tier includes API access. Gracera's supplier match API can be embedded into:
- **ERP procurement modules:** Buyers see Gracera supplier matches inside their existing procurement software
- **Procurement platforms:** Coupa, Ariba, Odoo — "Find Suppliers on Gracera" button inside the tool
- **Trade association platforms:** White-labeled Gracera matching for association members

**Pricing:** API access is included in the Enterprise tier ($99–$199/mo per user). High-volume ERP integrations (>1,000 queries/day) have custom pricing.

---

## 10. Revenue Projection Framework

| Phase | Primary Revenue Driver | Target MRR |
|-------|----------------------|-----------|
| Phase 1 | Subscriptions (supplier Pro tier) | $5K–$20K |
| Phase 2 | Subscriptions + Sample Order fees | $20K–$60K |
| Phase 3 | Subscriptions + Trade Finance referrals + Logistics | $60K–$150K |
| Phase 4 | All above + Intelligence Reports | $150K–$400K |
| Phase 5 | All above + Lead Credits + API access | $400K+ |

**Key unit economics to track:**
- Customer Acquisition Cost (CAC) by channel (organic SEO, buyer-led invitation, association partnership)
- Lifetime Value (LTV) by user tier
- Trade Finance referral attach rate (% of Deal Room entries that take the referral)
- Intelligence Report conversion rate from Enterprise subscribers

---

## 11. Competitive Positioning

| Platform | Revenue Model | Gracera Differentiation |
|---------|--------------|------------------------|
| Alibaba | Transaction fees + Gold Supplier subscriptions | Gracera: AI matching quality; not pay-to-rank; two-sided intelligence |
| ThomasNet | Supplier subscriptions + lead gen | Gracera: buyer-side too; deal workflow; AI matching |
| Global Sources | Trade show + subscription | Gracera: year-round; digital-first; AI-powered |
| Faire (B2B retail) | 15% commission on orders | Gracera: not a storefront; deal intelligence focus; international trade |

Gracera's sustainable moat is **data network effects**: the more deals close on the platform, the better the Intelligence Reports, the better the matching benchmarks, the better the Negotiation Coach — which attracts more users, who close more deals.

---

[Back to README](../README.md)
