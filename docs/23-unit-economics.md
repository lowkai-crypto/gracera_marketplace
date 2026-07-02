# Unit Economics

Customer acquisition costs, lifetime value, payback periods, and GMV projections across subscription tiers and revenue streams. These models are inputs to fundraising and operational planning — they should be revisited after each phase with real data.

---

## 1. Key Metrics Definitions

| Metric | Definition |
|--------|-----------|
| **CAC** | Total sales & marketing spend ÷ new paying customers acquired in the period |
| **LTV** | Average monthly revenue per customer × average customer lifetime (months) × gross margin |
| **Payback period** | CAC ÷ monthly contribution margin per customer |
| **GMV** | Gross Merchandise Value — total deal value transacted through the platform (not Gracera's revenue) |
| **Take rate** | Gracera revenue ÷ GMV |
| **MRR** | Monthly Recurring Revenue from subscriptions |
| **ARR** | MRR × 12 |
| **Churn rate** | % of paying customers who cancel or downgrade in a month |
| **NRR** | Net Revenue Retention — revenue retained + expansion from existing customers ÷ prior period revenue |

---

## 2. Customer Acquisition Channels & CAC

### 2.1 Acquisition Channels

| Channel | Mechanism | Target CAC |
|---------|-----------|-----------|
| Organic SEO / AEO | Programmatic supplier pages rank in Google / AI assistants → supplier claims free profile → upgrades | $0–$15 |
| Buyer-led invitation | Buyer posts sourcing request → Prospecting Agent sends off-platform supplier invite | $20–$40 |
| Trade association partnership | Association endorses Gracera to members → warm introduction | $50–$100 |
| Trade show presence | On-site white-glove onboarding → direct sign-up | $80–$150 |
| Content / vertical hubs | Blog/guide ranks for sourcing keywords → reader converts | $30–$60 |
| Paid social (LinkedIn) | Targeted campaigns to procurement and supply chain roles | $100–$200 |
| Referral program (Phase 5) | Existing users invite peers for credit | $20–$50 |

**Blended CAC target at Phase 1 launch:** < $80 per paying supplier, < $50 per paying buyer.

The organic SEO + buyer-invitation channel is structurally low-CAC because the buyer does the acquisition work for us. Every new buyer sourcing request triggers outreach to off-platform suppliers — this creates a self-reinforcing loop where buyer growth directly drives supplier acquisition at near-zero marginal cost.

### 2.2 CAC Assumptions by Phase

| Phase | Blended CAC (supplier) | Blended CAC (buyer) | Notes |
|-------|----------------------|--------------------|-|
| Phase 0–1 | $120 | $60 | Heavy on trade show + founder outreach |
| Phase 2–3 | $80 | $40 | SEO starts producing organic volume |
| Phase 4–5 | $50 | $25 | SEO/AEO flywheel established; referral program active |

---

## 3. Average Revenue Per User (ARPU)

### 3.1 Supplier ARPU

| Tier | MRR | Estimated tier mix (Phase 3) |
|------|-----|------------------------------|
| Free | $0 | 55% of supplier accounts |
| Pro ($49/mo) | $49 | 35% |
| Enterprise ($199/mo) | $199 | 10% |
| **Blended supplier ARPU** | **~$37** | |

**Annual billing discount** (2 months free = ~16% discount): of annual subscribers, effective ARPU is ~$41/mo vs. $49/mo monthly, but LTV is higher due to lower churn. Model assumes 40% of Pro and 60% of Enterprise choose annual billing.

**White-glove onboarding upsell** (Phase 2+): adds $199 one-time to ARPU for ~15% of new Pro signups acquired via that channel. Not included in ARPU above; treated as separate revenue line.

### 3.2 Buyer ARPU

| Tier | MRR | Estimated tier mix (Phase 3) |
|------|-----|------------------------------|
| Free | $0 | 65% of buyer accounts |
| Pro ($29/mo) | $29 | 27% |
| Enterprise ($99/mo) | $99 | 8% |
| **Blended buyer ARPU** | **~$16** | |

---

## 4. Churn & Lifetime

### 4.1 Churn Assumptions

| Segment | Monthly churn target | Basis |
|---------|---------------------|-------|
| Supplier Pro | 3.5% | ~29-month average lifetime |
| Supplier Enterprise | 1.5% | ~67-month average lifetime |
| Buyer Pro | 4.5% | ~22-month average lifetime |
| Buyer Enterprise | 2.0% | ~50-month average lifetime |

B2B SaaS benchmarks for SME-focused platforms typically run 3–7% monthly churn. The deal-closing network effect and Verified Deal Network lock-in should push churn toward the lower end as the platform matures.

**Key churn drivers to monitor:**
- No introductions accepted within first 30 days (highest leading indicator of churn)
- Match acceptance rate < 30% (suggests profile–request mismatch)
- Zero activity in deal workflow (supplier/buyer never gets to RFQ stage)

**Churn reduction levers:**
- 72h/24h safety nets reduce early churn by converting at-risk users before month-end billing
- Weekly digest keeps Pro/Enterprise users engaged between active deals
- AI-Brain (Phase 3) creates stickiness via institutional memory of deal history

### 4.2 Average Customer Lifetime

| Segment | Avg months | Calculation |
|---------|-----------|------------|
| Supplier Pro | 28.6 | 1 ÷ 3.5% |
| Supplier Enterprise | 66.7 | 1 ÷ 1.5% |
| Buyer Pro | 22.2 | 1 ÷ 4.5% |
| Buyer Enterprise | 50.0 | 1 ÷ 2.0% |

---

## 5. Lifetime Value (LTV)

**Formula:** LTV = ARPU × Average lifetime (months) × Gross margin

Gross margin assumption: 75% (subscription revenue; primary costs are AI inference, infrastructure, and trust team labor).

| Segment | ARPU | Avg lifetime | Gross margin | **LTV** |
|---------|------|-------------|-------------|---------|
| Supplier Pro | $49 | 28.6 mo | 75% | **$1,052** |
| Supplier Enterprise | $199 | 66.7 mo | 75% | **$9,960** |
| Buyer Pro | $29 | 22.2 mo | 75% | **$483** |
| Buyer Enterprise | $99 | 50.0 mo | 75% | **$3,713** |

---

## 6. LTV:CAC Ratio

| Segment | LTV | CAC (Phase 3) | **LTV:CAC** | Target |
|---------|-----|--------------|------------|--------|
| Supplier Pro | $1,052 | $80 | **13:1** | > 3:1 ✓ |
| Supplier Enterprise | $9,960 | $150 | **66:1** | > 3:1 ✓ |
| Buyer Pro | $483 | $40 | **12:1** | > 3:1 ✓ |
| Buyer Enterprise | $3,713 | $80 | **46:1** | > 3:1 ✓ |

These ratios look strong because the CAC is kept low by organic and buyer-invitation channels. The ratios compress if paid social scales up — keep blended CAC below $100 to maintain > 5:1 across the board.

---

## 7. Payback Period

**Formula:** CAC ÷ (ARPU × Gross margin)

| Segment | CAC | Monthly contribution | **Payback** |
|---------|-----|---------------------|------------|
| Supplier Pro | $80 | $49 × 75% = $36.75 | **2.2 months** |
| Supplier Enterprise | $150 | $199 × 75% = $149.25 | **1.0 month** |
| Buyer Pro | $40 | $29 × 75% = $21.75 | **1.8 months** |
| Buyer Enterprise | $80 | $99 × 75% = $74.25 | **1.1 months** |

Sub-3-month payback across all tiers means every paid user is cash-flow positive within their first quarter. This makes Gracera capital-efficient to scale — growth investment pays back before the next funding cycle.

---

## 8. MRR Build Model

### 8.1 Phase Targets (from [docs/15-monetization.md §10](15-monetization.md))

| Phase (end) | Suppliers (paying) | Buyers (paying) | Est. MRR |
|------------|-------------------|-----------------|---------|
| Phase 1 (Mo 4) | 175 Pro + 25 Ent | 75 Pro + 15 Ent | ~$15K |
| Phase 2 (Mo 7) | 500 Pro + 80 Ent | 250 Pro + 50 Ent | ~$45K |
| Phase 3 (Mo 10) | 1,200 Pro + 200 Ent | 700 Pro + 130 Ent | ~$115K |
| Phase 4 (Mo 14) | 3,000 Pro + 600 Ent | 2,000 Pro + 400 Ent | ~$330K |
| Phase 5 (Mo 18) | 6,000 Pro + 1,500 Ent | 4,000 Pro + 1,000 Ent | ~$720K |

### 8.2 MRR Build Components

At Phase 3 (Month 10), estimated MRR breakdown:

| Revenue stream | Monthly | Notes |
|---------------|---------|-------|
| Supplier subscriptions | $74,800 | 1,200 × $49 + 200 × $199 |
| Buyer subscriptions | $33,500 | 700 × $29 + 130 × $99 |
| Sample order fees | $2,500 | ~250 orders × avg $10 fee |
| Trade Finance referrals | $3,000 | 10–15 referrals × avg $200 |
| Inspection referrals | $3,000 | 60 bookings × $50 avg |
| White-glove onboarding | $2,000 | ~10 sessions/month |
| Translation sessions | $1,500 | ~40 sessions × $37.50 net |
| **Total** | **~$120K** | |

---

## 9. GMV & Take Rate

**GMV** is the total value of deals closed on the platform. It is the largest leading indicator of Gracera's long-term monetization potential — revenue streams like trade finance, inspection, and the future success fee are GMV-linked.

### 9.1 Deal Value Assumptions

| Deal type | Average deal value | Basis |
|-----------|------------------|-------|
| Sample order | $50 | Low-commitment first transaction |
| First full deal (new pair) | $8,000 | SME first purchase order |
| Repeat deal (Verified Deal Network) | $25,000 | Established relationship, higher volumes |
| Group buy (pooled) | $60,000 | Combined order value across co-buyers |

### 9.2 GMV Projections

| Phase (end) | Deals closed | Avg deal value | **GMV** |
|------------|-------------|---------------|--------|
| Phase 1 | 50 | $6,000 | $300K |
| Phase 2 | 300 | $8,000 | $2.4M |
| Phase 3 | 1,000 | $12,000 | $12M |
| Phase 4 | 3,000 | $18,000 | $54M |
| Phase 5 | 8,000 | $22,000 | $176M |

### 9.3 Take Rate

Current model (Phases 1–3): take rate is effectively 0% on GMV — Gracera earns via subscriptions, not deal commissions.

At Phase 5 with optional success fee (opt-in, 1–2% of deal value on closed deals), and assuming 20% opt-in rate:

- Phase 5 GMV: $176M
- Success fee-eligible GMV: $176M × 20% = $35.2M
- Success fee at 1.5% average: $528K/month additional revenue

Success fee is positioned as a performance-based premium — Gracera only earns more when users close deals. This aligns incentives and provides a natural upsell conversation at deal close.

---

## 10. Break-Even Analysis

**Monthly fixed cost estimates (Phase 1–2, lean team):**

| Cost category | Monthly |
|--------------|---------|
| Infrastructure (OCI A1 + SendGrid + misc SaaS) | $200 |
| AI inference (Claude API — matching + RAG) | $1,500–$3,000 (scales with users) |
| Team: 2 founders + 1 trust/CS (contractor) | $15,000 |
| Legal, accounting, insurance | $1,500 |
| Marketing (content + trade show amortized) | $3,000 |
| **Total fixed + semi-fixed** | **~$23,000** |

**Break-even MRR:** ~$23,000 / 75% gross margin = ~$30,700 MRR

This is achievable at end of Phase 2 (projected ~$45K MRR). From Phase 2 onward, the business is cash-flow positive on subscription revenue alone before accounting for transactional revenue streams.

---

## 11. Key Sensitivity Drivers

| Variable | Impact | Risk mitigation |
|----------|--------|----------------|
| AI inference cost | High — scales with match volume | Prompt caching (Phase 2); batch matching vs. real-time for Free tier users |
| Churn rate | High — 1% change in monthly churn moves LTV by 15–25% | 72h/24h safety nets; AI-Brain stickiness; Verified Deal Network lock-in |
| CAC via paid social | Medium — can blow up unit economics if organic channels stall | Maintain > 70% of acquisition from organic/invitation channels |
| Supplier-to-buyer ratio | Medium — if ratio falls below 2:1 in a vertical, match quality degrades | Per-vertical supply/demand monitoring; Prospecting Agent to balance |
| Enterprise tier attachment | High — Enterprise LTV is 5–10x Pro LTV | API access, Intelligence Reports, and dedicated AM as Enterprise pull |

---

[Back to README](../README.md)
