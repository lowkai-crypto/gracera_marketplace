# Gracera Marketplace

> AI-powered B2B marketplace connecting global suppliers, vendors, and manufacturers with buyers, resellers, and small businesses.

---

## What is Gracera?

Gracera is a two-sided marketplace that removes the friction from B2B sourcing and sales — both domestically and internationally. Suppliers and vendors publish rich profiles of their business, products, and services. Buyers describe what they need. An AI Agent works both sides: matching suppliers to the right customers, and helping buyers find qualified vendors — cutting deal cycles from weeks to hours.

---

## Who Is This For?

| Role | Description |
|------|-------------|
| **Supplier / Vendor / Manufacturer** | Companies wanting to reach new buyers, distributors, or business partners |
| **Buyer / Purchaser / Reseller** | Businesses, SMEs, or procurement teams looking for vetted suppliers |
| **Sales Representative** | Individuals representing a product line seeking end customers |
| **Small Business Owner** | Entrepreneurs sourcing goods or services to build or grow their business |

---

## Core Value Proposition

- **For Suppliers:** Get discovered by the right buyers. Stop cold-calling. Let AI surface qualified leads that match your ideal customer profile.
- **For Buyers:** Stop sifting through unqualified vendors. Describe what you need and let AI shortlist verified suppliers that match your criteria.
- **For Both:** A structured, trusted platform with verified profiles, AI-driven matching, and a deal workflow from first contact to closed deal.

---

## Key Features

### Discovery & Matching
- **AI Matching Agent** — Five-stage pipeline (Elasticsearch pre-filter → vector supplement → Claude semantic scoring) surfaces the top 10 ranked matches per user with rationale in their preferred language
- **Supplier Profiles** — Rich catalog of business info, product lines, certifications, MOQs, lead times, availability signals, and target markets; RAG auto-population from catalog PDF upload
- **Buyer Profiles** — Structured sourcing requests with category templates; includes payment track record visible to suppliers at the introduction stage
- **Dual-Role Accounts** — Distributors and trading companies can operate as both supplier and buyer under one login with a context switcher and independent profiles

### Deal Workflow
- **Multi-Supplier RFQ** — Send one RFQ to up to 5 suppliers simultaneously; side-by-side quote comparison; winner selection
- **Deal Room** — Milestone checklist, shared document store, e-signature (DocuSign/HelloSign), pre-shipment inspection booking (QIMA/SGS), and trade finance referral in one place
- **Repeat Orders** — "Reorder" button on closed deals pre-populates a new RFQ from prior terms; standing order reminders for recurring buyers
- **Group Buying** — Multiple buyers pool demand to meet supplier MOQs; Lead Buyer model; individual invoicing per co-buyer
- **Dispute Resolution** — Structured filing flow, 48-hour cooling-off, Gracera trust team mediation, and international arbitration referral

### Intelligence & Trust
- **AI-Brain (Business Advisor)** — Always-on conversational advisor with full context of profile, match history, active deals, and category benchmarks; answers questions like "why am I not matching with German buyers?" or "should I accept this counter-offer?" — Pro/Enterprise only
- **AI Growth Advisor** — Structured AI adoption roadmap personalized to each business; 10-question intake → domain-by-domain action plan across Marketing, Sales, Operations, and Product Development; every recommendation grounded in the user's actual deal data and category benchmarks — Pro/Enterprise only
- **AI Negotiation Coach** — Private, per-party deal coaching during quote and counter-offer; never shared between parties
- **AI Price Compass** — Market rate estimates before negotiating, drawn from platform deal data
- **Gracera Intelligence Reports** — Anonymized category market data (MOQ averages, price ranges, lead times, trade flows) sold as standalone reports and included in Enterprise tiers
- **Certification Management** — Upload, digitally verify against issuer APIs, and monitor expiry with automated 90/60/30-day alerts
- **Document Authenticity Verification** — AI pre-screening plus issuer API verification for uploaded certification documents

### Reach & Acquisition
- **Buyer-Led Supplier Invitations** — When a buyer posts a sourcing request, the Prospecting Agent finds matching off-platform suppliers and sends opportunity-specific invitations
- **Programmatic SEO + AEO** — 50,000+ auto-generated public pages with `FAQPage` JSON-LD so AI assistants (ChatGPT, Perplexity, Google AI Overviews) cite Gracera supplier profiles
- **Vertical Community Forums** — Verified-member Q&A boards per sourcing category; public and crawlable; Trusted Expert badges feed back into supplier match profiles
- **Trade Policy & Tariff Alerts** — Per-user monitoring of HS code tariff changes and import/export regulation updates relevant to their active deals

### International & Operations
- **Multi-Currency, Multi-Language** — USD canonical storage with live FX conversion; UI in EN/ZH/ES/AR; machine translation (DeepL) for profile content; RTL support
- **Human Translator Network** — Vetted trade translators bookable within Deal Room for high-stakes negotiations (30-minute blocks; language pair + vertical certified)
- **White-Glove Onboarding** — Specialist-assisted profile setup for non-digital-native suppliers; ≥85% completeness target; $199 or included in annual Pro
- **Gracera Verified Logistics** — In-platform freight quotes and landed cost estimates from partner forwarders at Deal Room entry

---

## Documentation

| Document | What it covers |
|----------|----------------|
| [Product Requirements](docs/01-product-requirements.md) | Goals, success metrics, and full feature scope across all 5 phases |
| [User Personas](docs/02-user-personas.md) | Supplier, Buyer, Sales Rep, and SMB profiles |
| [System Architecture](docs/03-system-architecture.md) | Tech stack, service decomposition, AI agent pipeline, RAG engine, AEO/SEO layer |
| [AI Agent Design](docs/04-ai-agent-design.md) | Five AI agents: Matching, Prospecting, Business Intelligence, Negotiation Coach, AEO |
| [Supplier Profile Spec](docs/05-supplier-profile-spec.md) | All profile fields, availability signals, certification expiry management, white-glove onboarding service |
| [Buyer Profile Spec](docs/06-buyer-profile-spec.md) | Company profile, sourcing request fields, payment track record, buyer verification tiers |
| [Matching Algorithm](docs/07-matching-algorithm.md) | Three-stage pipeline (Elasticsearch → vector supplement → Claude scoring), final score formula, feedback signals |
| [Deal Workflow](docs/08-deal-workflow.md) | Standard flow, Sample Fast Track, Group Buying, multi-supplier RFQ, e-signature, inspection, dispute resolution, human translator network |
| [Data Model](docs/09-data-model.md) | Database schema including dual-role accounts, disputes, group RFQs, deal contracts, and buyer payment track record |
| [API Reference](docs/10-api-reference.md) | Endpoint contracts for frontend and integrations |
| [Internationalization](docs/11-internationalization.md) | Multi-language, multi-currency, HS codes, Incoterms, trade policy and tariff alert system |
| [Security & Trust](docs/12-security-and-trust.md) | Verification tiers, certification expiry monitoring, document authenticity verification, dispute resolution policy |
| [Roadmap](docs/13-roadmap.md) | Phased milestones v0.3 — all features tagged *(core/skystar/new)* with exit criteria per phase |
| [Go-to-Market](docs/14-go-to-market.md) | Buyer-led invitations, programmatic SEO, AEO/GEO strategy, vertical playbooks, community forums spec |
| [Monetization](docs/15-monetization.md) | Subscription tiers, transaction fees, referral commissions, intelligence reports, white-glove onboarding, group buy fee, human translator margin |

---

## Quick Start (Development)

```bash
# Clone the repo
git clone https://github.com/your-org/gracera-marketplace.git
cd gracera-marketplace

# Install dependencies
npm install          # or: pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run locally
npm run dev
```

> See [System Architecture](docs/03-system-architecture.md) for tech stack details.

---

## Project Status

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 (Months 1–4) | Core profiles, search, dual-role accounts, billing, acquisition | Planning |
| Phase 2 (Months 4–7) | AI matching, intelligence layer, availability signals, white-glove onboarding | Not started |
| Phase 3 (Months 7–10) | Full deal workflow, e-signature, dispute resolution, translator network | Not started |
| Phase 4 (Months 10–14) | International scale, group buying, trade policy alerts, community forums | Not started |
| Phase 5 (Month 14+) | Growth, monetization, mobile, forum completion | Not started |

See [Roadmap](docs/13-roadmap.md) for full timeline.

---

*Gracera — Find the right partner. Close the deal.*
