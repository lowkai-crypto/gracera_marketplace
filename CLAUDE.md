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
| `docs/18-qa-test-plan.md` | QA process, Playwright structure, fixture strategy, CI/CD pipeline, bug severity, definition of done |
| `docs/19-tech-stack-dev-setup.md` | Full stack reference, local Docker setup, env vars, migrations, Coolify deployment, troubleshooting |
| `docs/20-admin-ops-spec.md` | Admin roles, verification queue, dispute queue, wire transfer queue, manual match override, platform metrics |
| `docs/21-notifications-email-spec.md` | All email templates, in-app notification design, digest cadence, delivery rules, user preferences |
| `docs/22-onboarding-flows.md` | Supplier and buyer activation flows, completeness gates, dual-role onboarding, white-glove concierge |
| `docs/23-unit-economics.md` | CAC, LTV, payback period, MRR build model, GMV projections, break-even |
| `docs/24-competitive-positioning.md` | Alibaba, ThomasNet, IndiaMART, Faire, Sourcify comparison; Gracera moat; sales objections |
| `docs/25-legal-compliance.md` | GDPR/CCPA, KYB, sanctions screening, marketplace liability, contract template library |
| `docs/26-runbook.md` | Incident response, on-call playbook, SLAs by tier, deployment, backup/restore, background jobs |
| `docs/27-integrations.md` | Claude API, Stripe, SendGrid, DocuSign, QIMA, DeepL, ERP (Coupa/Odoo), freight APIs |
