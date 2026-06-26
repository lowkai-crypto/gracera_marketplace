# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

```
gracera_marketplace/
  docs/           # Product and architecture specs (01–16) — primary work
  skystarcloud/   # Reference project only — do not treat as Gracera's implementation
  README.md       # Project overview and doc index
```

## What Gracera is

A two-sided B2B marketplace connecting suppliers/vendors/manufacturers with buyers/resellers/SMEs. An AI Matching Agent (Claude API) scores compatibility between supplier profiles and buyer sourcing requests across 6 dimensions (category, geography, scale, certifications, customer fit, language) and surfaces ranked introductions. Deals flow through RFQ → Quote → Negotiation → Agreement in-platform.

## Key docs

| Doc | What it specifies |
|-----|------------------|
| `docs/01-product-requirements.md` | Goals, success metrics, scope |
| `docs/02-user-personas.md` | Supplier, Buyer, Sales Rep, SMB profiles |
| `docs/03-system-architecture.md` | Planned tech stack and service decomposition |
| `docs/04-ai-agent-design.md` | Matching pipeline, scoring dimensions, Claude prompt |
| `docs/05-supplier-profile-spec.md` | Supplier data model and fields |
| `docs/06-buyer-profile-spec.md` | Buyer sourcing request model |
| `docs/07-matching-algorithm.md` | Weighted scoring formula |
| `docs/08-deal-workflow.md` | Deal state machine |
| `docs/09-data-model.md` | Database schema narrative |
| `docs/10-api-reference.md` | Endpoint contracts |
| `docs/11-internationalization.md` | Multi-language, multi-currency |
| `docs/12-security-and-trust.md` | Verification, fraud prevention |
| `docs/13-roadmap.md` | Phased milestones (updated with all new features) |
| `docs/14-go-to-market.md` | Off-platform reach, AEO/SEO strategy, vertical playbooks |
| `docs/15-monetization.md` | Revenue streams, subscription tiers, trade finance & logistics referral |
| `docs/16-category-taxonomy.md` | Full 15-vertical B2B category tree, HS code alignment, priority verticals, governance rules |
| `docs/17-use-cases.md` | 12 end-to-end use cases (supplier + buyer per priority vertical); maps to Playwright test fixtures |
