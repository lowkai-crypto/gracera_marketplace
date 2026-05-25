# Product Requirements Document (PRD)

**Project:** Gracera Marketplace
**Version:** 0.1 (Draft)
**Date:** 2026-05-25

---

## 1. Problem Statement

B2B sourcing and sales are slow, opaque, and relationship-gated. Suppliers waste time on unqualified leads. Buyers spend weeks manually searching directories, attending trade shows, and sending blind RFQs. Small businesses and international operators are especially underserved — lacking the networks that large enterprises take for granted.

Gracera solves this with a structured, AI-assisted platform where both sides invest in profile quality upfront and the AI agent does the matching work continuously.

---

## 2. Goals

### Business Goals
- Become the go-to B2B discovery platform for SME suppliers and buyers globally
- Generate revenue through subscription tiers, lead credits, and transaction success fees
- Reach 10,000 active supplier profiles and 5,000 active buyer profiles within 12 months of launch

### Product Goals
- Reduce time-to-first-qualified-contact from weeks to < 48 hours
- Achieve > 70% match acceptance rate (user acts on AI-surfaced introduction)
- Support international trade workflows: USD, EUR, CNY, and 10+ additional currencies at launch

### User Goals
- **Suppliers:** Get found by buyers who match their ideal customer profile without manual outreach
- **Buyers:** Receive a shortlist of qualified, verified suppliers within hours of posting a sourcing need

---

## 3. Non-Goals (v1)

- Consumer-to-business (B2C) transactions
- Direct payment processing or escrow (deferred to later phase)
- Physical logistics / freight booking
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

---

## 5. Scope

### In Scope — Phase 1 (Core)
- User registration and onboarding (supplier and buyer flows)
- Supplier profile builder (products, services, certifications, target markets)
- Buyer sourcing request builder (category, volume, geography, timeline)
- Keyword and filter-based search
- Basic AI match suggestions (batch, daily digest)
- Secure messaging between matched parties
- Profile verification (email, business registration number)

### In Scope — Phase 2 (AI Agent MVP)
- Real-time AI matching on profile publish/update
- AI-generated match rationale ("Why we matched you")
- Buyer intent scoring
- Supplier lead scoring

### In Scope — Phase 3 (Deal Workflow)
- RFQ creation and response
- Quote builder
- Deal room (shared thread, document uploads)
- Deal status tracking

### In Scope — Phase 4 (International)
- Multi-language UI (English, Mandarin, Spanish, Arabic — MVP)
- Multi-currency display and conversion
- Trade document templates (pro-forma invoice, packing list)
- Regional compliance flags (import/export restrictions)

---

## 6. Assumptions

- Suppliers and buyers are willing to invest 20–30 minutes completing detailed profiles in exchange for better matches
- AI match quality depends on profile completeness; onboarding must incentivize thorough data entry
- Initial target markets: North America, Southeast Asia, and East Asia

---

## 7. Constraints

- All AI inference must use user-provided profile data only (no scraping third-party sources without consent)
- PII and business data must comply with GDPR and CCPA from day one
- Platform must be usable on mobile web (not just desktop)

---

## 8. Dependencies

| Dependency | Owner | Notes |
|------------|-------|-------|
| AI Matching model | Engineering | See [AI Agent Design](04-ai-agent-design.md) |
| Identity verification provider | TBD | Business registration lookup API |
| Translation service | TBD | DeepL or equivalent |
| Email / notification service | TBD | SendGrid or equivalent |

---

[Back to README](../README.md)
