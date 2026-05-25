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

- **AI Matching Agent** — Proactively matches suppliers with buyers based on profile data, intent signals, and deal history
- **Supplier Profiles** — Rich catalog of business info, product lines, certifications, MOQs, lead times, and target markets
- **Buyer Profiles** — Structured sourcing requests: category, volume, geography, quality requirements, and more
- **Smart Inbox** — AI-curated introductions, not spam — both sides see ranked, relevant matches
- **Deal Workflow** — RFQ, quote, negotiation, and agreement tracked in-platform
- **International Support** — Multi-currency, multi-language, trade-ready documentation assistance

---

## Documentation

| Document | Description |
|----------|-------------|
| [Product Requirements](docs/01-product-requirements.md) | Goals, success metrics, and scope |
| [User Personas](docs/02-user-personas.md) | Detailed profiles of each user type |
| [System Architecture](docs/03-system-architecture.md) | High-level technical design |
| [AI Agent Design](docs/04-ai-agent-design.md) | How the matching AI works |
| [Supplier Profile Spec](docs/05-supplier-profile-spec.md) | Data model and fields for supplier/vendor profiles |
| [Buyer Profile Spec](docs/06-buyer-profile-spec.md) | Data model and fields for buyer/purchaser profiles |
| [Matching Algorithm](docs/07-matching-algorithm.md) | Scoring and ranking logic |
| [Deal Workflow](docs/08-deal-workflow.md) | RFQ → Quote → Deal lifecycle |
| [Data Model](docs/09-data-model.md) | Database schema and entity relationships |
| [API Reference](docs/10-api-reference.md) | Endpoint contracts for frontend and integrations |
| [Internationalization](docs/11-internationalization.md) | Multi-language, multi-currency, and trade compliance |
| [Security & Trust](docs/12-security-and-trust.md) | Verification, fraud prevention, and data privacy |
| [Roadmap](docs/13-roadmap.md) | Milestones and phased release plan |

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

| Phase | Status |
|-------|--------|
| Phase 1 — Core profiles & search | Planning |
| Phase 2 — AI Matching Agent (MVP) | Not started |
| Phase 3 — Deal workflow | Not started |
| Phase 4 — International features | Not started |

See [Roadmap](docs/13-roadmap.md) for full timeline.

---

*Gracera — Find the right partner. Close the deal.*
