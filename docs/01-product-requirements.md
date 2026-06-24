# Product Requirements Document (PRD)

**Project:** Gracera Marketplace
**Version:** 0.2
**Date:** 2026-06-24

---

## 1. Problem Statement

B2B sourcing and sales are slow, opaque, and relationship-gated. Suppliers waste time on unqualified leads. Buyers spend weeks manually searching directories, attending trade shows, and sending blind RFQs. Small businesses and international operators are especially underserved — lacking the networks that large enterprises take for granted.

Gracera solves this with a structured, AI-assisted platform where both sides invest in profile quality upfront and the AI agent does the matching work continuously. Beyond discovery, the platform gives suppliers and buyers the business intelligence tools to improve their sourcing and sales — turning Gracera from a directory into a trade intelligence platform.

---

## 2. Goals

### Business Goals
- Become the go-to B2B discovery platform for SME suppliers and buyers globally
- Generate revenue through subscription tiers, lead credits, referral commissions (trade finance, logistics), and Intelligence Reports
- Reach 10,000 active supplier profiles and 5,000 active buyer profiles within 12 months of launch

### Product Goals
- Reduce time-to-first-qualified-contact from weeks to < 48 hours
- Achieve > 70% match acceptance rate (user acts on AI-surfaced introduction)
- Support international trade workflows: USD, EUR, CNY, and 10+ additional currencies at launch
- Surface Gracera supplier profiles in AI assistant responses (ChatGPT, Perplexity, Google AI Overviews)

### User Goals
- **Suppliers:** Get found by buyers who match their ideal customer profile without manual outreach; receive AI-driven insights to improve their profile and business strategy
- **Buyers:** Receive a shortlist of qualified, verified suppliers within hours of posting a sourcing need; get market intelligence to negotiate better

---

## 3. Non-Goals (v1)

- Consumer-to-business (B2C) transactions
- Direct payment processing or escrow (deferred to later phase)
- Physical logistics / freight booking (referral only — see Phase 4)
- Inventory management for suppliers
- Public storefront / e-commerce pages

---

## 4. Success Metrics

| Metric | Target (12 months post-launch) |
|--------|-------------------------------|
| Registered suppliers | 10,000 |
| Registered buyers | 5,000 |
| AI-generated introductions per month | 50,000 |
| Match acceptance rate | > 70% |
| Deals closed via platform | 1,000 |
| Net Promoter Score | > 40 |
| Supplier profiles cited in AI assistant responses | Tracked via referral logs |
| Sample Order Fast Track orders placed | 500 |

---

## 5. Scope

### In Scope — Phase 1 (Core, Months 1–4)
- User registration and onboarding (supplier and buyer flows) — including **dual-role accounts** (supplier + buyer under one login, with a dashboard context switcher)
- Supplier profile builder with RAG auto-population (upload catalog/brochure → AI fills fields)
- Buyer profile builder + sourcing request builder
- Keyword and filter-based search (Elasticsearch)
- Basic AI match suggestions (batch, daily digest)
- Secure messaging between matched parties
- Profile verification (email, business registration number)
- Competitive profile benchmarking (how your profile compares to top suppliers in category)
- Subscription tiers with offline payment support (wire transfer confirmation queue)
- Admin impersonation for customer success
- Unclaimed placeholder profiles with "claim your profile" flow
- Programmatic SEO public pages with schema.org structured data
- Buyer-led supplier invitation emails (AI identifies off-platform matches)

### In Scope — Phase 2 (AI Agent MVP, Months 4–7)
- Real-time AI matching on profile publish/update
- AI-generated match rationale ("Why we matched you")
- Buyer intent scoring; Supplier lead scoring
- AI Business Insights Brief (profile gaps, category benchmarks, certification ROI)
- Growth Strategy Engine (export market entry plans for suppliers; sourcing diversification for buyers)
- Social proof integration (LinkedIn/trade social signals feed match recency score)
- Sample Order Fast Track (1-click sample request, no RFQ required)
- AI Price Compass (market rate estimates before negotiating)
- Verified Deal Network (closed deals create permanent connections between parties)
- Free public Sourcing Query tool (no login required; contact-gated)
- Answer Engine Optimization (AEO): Q&A schema on all supplier profile pages
- **Supplier availability signals** (`Available / Limited / Fully Booked`) on profiles; used in matching and browse filter
- **Certification expiry monitoring** — automated alerts at 90/60/30 days; expired certs excluded from matching
- **White-glove supplier onboarding** — assisted profile setup via phone/email for non-digital-native suppliers (Phase 2 premium service)

### In Scope — Phase 3 (Deal Workflow, Months 7–10)
- RFQ creation and response (with category templates for 20+ verticals)
- **Multi-supplier RFQ** — send one RFQ to up to 5 suppliers; side-by-side quote comparison; winner selection
- Quote builder with line items and counter-offer flow
- Deal Room: shared thread, document uploads, milestone checklist
- **E-signature & contract templates** (PO, Distribution Agreement, NDA, Sample Agreement) via DocuSign/HelloSign
- **Third-party pre-shipment inspection** integration (QIMA, SGS, Bureau Veritas) — bookable from Deal Room
- **Buyer protection / payment security** referral at Deal Room entry (milestone-linked escrow partner)
- **Repeat order flow** — "Reorder" button on closed deals; standing order reminders for recurring buyers
- **Dispute resolution** — structured filing flow, 48-hour cooling-off, Gracera trust team mediation, arbitration referral
- **Buyer payment track record** — on-time payment rate, avg days-to-payment, visible to suppliers at introduction stage
- **Group buying (MOQ pooling)** — pool demand across multiple buyers to meet supplier MOQs
- Deal status tracking and analytics dashboard
- SOP Library for suppliers (publish QC procedures, handling specs as trust signals)
- Supplier Broadcast Campaigns (targeted trade announcements to relevant buyer segments)
- Downstream Customer Segmentation for buyers (define end-customer profiles for second-order matching)
- AI Negotiation Coach (private deal coaching during quote/counter-offer stage)
- **Human translation sessions** — vetted trade translators bookable within the Deal Room for high-stakes negotiations
- Supplier Alliance Packs (complementary suppliers bundle as a package offering)
- Trade Finance Referral (post-deal "Get Paid Now" factoring partner integration)

### In Scope — Phase 4 (International + Ecosystem, Months 10–14)
- Multi-language UI (English, Mandarin, Spanish, Arabic — MVP)
- Profile content machine translation (DeepL)
- AI match rationale in user's preferred language
- Multi-currency display and conversion (12 currencies at launch)
- HS code tagging and search
- Incoterms matching and compatibility flags
- Regional compliance flags (OFAC, EU, UN sanctioned country pairs)
- KYB (Know Your Business) verification — Premium tier
- Gracera Intelligence Reports (category market data: MOQ averages, price ranges, lead times)
- Gracera Verified Logistics (in-platform freight quotes alongside supplier quotes, landed cost estimate)
- ERP/Procurement tool integration (Coupa, Odoo API)
- Vertical content hubs (deep sourcing guides per vertical, AI-optimized)
- **Trade policy & tariff alert system** — per-user monitoring of HS code tariff changes and import/export regulation updates relevant to their active category and country pairs
- **Document authenticity verification** — issuer API digital verification + AI pre-screening for uploaded certifications
- **Vertical community forums** — verified-member Q&A boards per sourcing category; public and indexable for AEO

### In Scope — Phase 5 (Growth & Monetization, Month 14+)
- Subscription tier gates (Free / Pro / Enterprise) with feature gates
- Lead credits for boosted match visibility
- Intelligence Reports as premium/Enterprise feature
- AI Negotiation Coach as Pro feature
- Alliance Pack premium listings (auction-based placement)
- API access for ERP / procurement system integrations
- Mobile native app (iOS + Android)
- Referral program for both suppliers and buyers
- Gracera Verified premium trust badge

---

## 6. Assumptions

- Suppliers and buyers are willing to invest 20–30 minutes completing detailed profiles in exchange for better matches; RAG auto-population reduces this to < 10 minutes
- AI match quality depends on profile completeness; onboarding must incentivize thorough data entry
- Initial target markets: North America, Southeast Asia, and East Asia
- A meaningful portion of international SMB users prefer offline payment (wire transfer) over credit card; offline billing support is a requirement for international reach

---

## 7. Constraints

- All AI inference must use user-provided profile data only (no scraping third-party sources without consent)
- PII and business data must comply with GDPR and CCPA from day one
- Platform must be usable on mobile web (not just desktop)
- Buyer price targets/budgets are never shown to suppliers — AI eyes only
- Contact details are not revealed until both parties accept an introduction

---

## 8. Dependencies

| Dependency | Owner | Notes |
|------------|-------|-------|
| AI Matching model | Engineering | See [AI Agent Design](04-ai-agent-design.md) |
| RAG / Vector DB | Engineering | Pinecone or Weaviate for profile semantic search |
| Identity verification provider | TBD | Business registration lookup API |
| Translation service | TBD | DeepL or equivalent |
| Email / notification service | TBD | SendGrid or equivalent |
| Trade finance partner | TBD | Invoice factoring partner for referral program |
| Freight forwarder partner | TBD | 2–3 partners for Gracera Verified Logistics |
| Schema.org / AEO | Engineering | Q&A, Product, Business structured data markup |

---

[Back to README](../README.md)
