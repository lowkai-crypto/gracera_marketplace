# Legal & Compliance Framework

Gracera's legal obligations, data privacy compliance, Know Your Business (KYB) requirements, marketplace liability boundaries, and contract template structure.

> **Disclaimer:** This document defines Gracera's product-level compliance framework. It is not legal advice. Gracera should engage qualified legal counsel in each jurisdiction it operates before final terms are drafted and enforced.

---

## 1. Governing Documents

Gracera requires users to agree to the following at registration:

| Document | Purpose | Reviewed/updated |
|----------|---------|-----------------|
| **Terms of Service (ToS)** | Defines platform rules, user obligations, Gracera's role as neutral facilitator, limitation of liability | At each major platform change; minimum annually |
| **Privacy Policy** | GDPR/CCPA-compliant disclosure of data collection, use, retention, and rights | At any change to data practices |
| **Cookie Policy** | Cookie categories, consent mechanism | At any change to cookie usage |
| **Supplier Agreement** | Additional terms for listing suppliers; prohibited goods; misrepresentation consequences | Phase 1 |
| **Acceptable Use Policy (AUP)** | Prohibited conduct: fraud, harassment, prohibited trade, manipulation of the matching algorithm | Phase 1 |
| **Data Processing Agreement (DPA)** | For Enterprise users subject to GDPR — formal data processor agreement between Gracera and the Enterprise user | Phase 4 (when EU Enterprise contracts are signed) |

All documents are versioned (e.g., ToS v1.2 — 2026-08-01). Users are notified of material changes by email with 30 days' notice and must re-acknowledge before continuing.

---

## 2. GDPR Compliance

Applies to all users in the European Economic Area (EEA) and any user whose data is processed by Gracera regardless of location.

### 2.1 Legal Bases for Processing

| Data category | Legal basis | Notes |
|--------------|------------|-------|
| Account registration data (name, email) | Contract | Necessary to provide the service |
| Profile data (company, products, certifications) | Contract | Necessary to provide matching |
| Budget/price targets | Contract | Used only by AI; never disclosed |
| Analytics / usage data | Legitimate interest | Platform improvement |
| Marketing emails (digest) | Consent | Opt-in at registration; opt-out available |
| Aggregated deal data for Intelligence Reports | Legitimate interest | Fully anonymised; minimum 20 data points per cell |

### 2.2 User Rights

| Right | Implementation | SLA |
|-------|---------------|-----|
| Right to access | User downloads their data at `/settings/data-export` — full JSON export of profile, match history, deal history, messages | Immediate (automated) |
| Right to erasure | User requests deletion at `/settings/delete-account`; admin processes within 30 days; email anonymised, profile soft-deleted, then hard-deleted after 30-day grace period | 30 days |
| Right to portability | Same export as right to access; machine-readable JSON | Immediate |
| Right to rectification | User can edit all personal data fields from their profile settings | Immediate |
| Right to restriction | User can request processing restriction via support; manual handling | 30 days |
| Right to object | Users can opt out of all non-essential processing (analytics, benchmarking) from `/settings/privacy` | Immediate |

### 2.3 Data Retention

| Data type | Retention period | Basis |
|-----------|----------------|-------|
| Active user data | Until account deletion + 30-day grace | Service necessity |
| Deleted account data (anonymised) | 7 years | Legal / audit requirement |
| Deal records | 7 years from deal close | Tax / legal |
| Audit logs | 7 years | Legal requirement |
| AI match scoring data | 90 days (then anonymised into aggregate) | Service improvement |
| Security logs | 12 months | Security monitoring |

### 2.4 Data Residency

At launch, all user data is stored on Oracle Cloud Infrastructure (OCI) in the Singapore region (ap-singapore-1). Phase 4 will add EU-West and US-East data residency options:

| User region | Data stored in | Phase |
|-------------|---------------|-------|
| Asia-Pacific | ap-singapore-1 (OCI) | Phase 1 |
| European Union | eu-frankfurt-1 (OCI) | Phase 4 |
| North America | us-ashburn-1 (OCI) | Phase 4 |

Users in the EU who require EU data residency are accommodated in Phase 4. Until then, Gracera relies on Standard Contractual Clauses (SCCs) for GDPR-compliant data transfers to Singapore.

### 2.5 Sub-Processors

Gracera's GDPR sub-processor list (disclosed in Privacy Policy and DPA):

| Sub-processor | Role | Location |
|--------------|------|---------|
| Anthropic (Claude API) | AI inference for matching and coaching | US |
| SendGrid (Twilio) | Email delivery | US |
| Stripe | Payment processing | US / EU |
| Oracle Cloud | Infrastructure, object storage | Singapore / multi-region |
| DocuSign / HelloSign | E-signature | US |
| DeepL (Phase 4) | Translation | EU (Germany) |

For each US-based sub-processor, Gracera relies on the EU–US Data Privacy Framework (DPF) or Standard Contractual Clauses.

---

## 3. CCPA Compliance

Applies to California residents.

| Requirement | Implementation |
|-------------|---------------|
| Right to know | Privacy Policy discloses all categories of data collected |
| Right to delete | Same mechanism as GDPR right to erasure |
| Right to opt out of sale | Gracera does not sell personal data. Privacy Policy states this explicitly |
| Right to non-discrimination | Free tier remains available regardless of privacy choices |
| Notice at collection | Privacy Policy link shown on all data collection forms |

**"Do Not Sell or Share" toggle** is available at `/settings/privacy` for California users (detected by IP or user-declared location). Gracera's Intelligence Reports use fully anonymised aggregate data — no personal data is included.

---

## 4. KYB (Know Your Business)

KYB is a **Premium-tier identity verification** for businesses requiring the highest level of trust signal (Enterprise subscription or upon request). It is not mandatory for all users.

### 4.1 KYB Requirements

| Document / Check | Standard |
|-----------------|---------|
| Business registration | Valid, active registration in country of incorporation |
| Proof of address | Utility bill, bank statement, or official correspondence dated within 90 days |
| Ultimate Beneficial Owner (UBO) ID | Government-issued photo ID for any owner with ≥ 25% shareholding |
| Reference check | Two contactable business references who have transacted with this business |
| Video verification | Live video call with a Gracera trust team specialist to confirm identity |

### 4.2 KYB Process

See [docs/20-admin-ops-spec.md §3.3](20-admin-ops-spec.md) for the admin workflow.

### 4.3 KYB and OFAC / Sanctions Screening

Every KYB applicant (and their UBOs) is screened against:
- OFAC Specially Designated Nationals (SDN) list
- EU Consolidated Financial Sanctions List
- UN Security Council sanctions list
- UK OFSI financial sanctions list

Screening runs automatically via a sanctions screening API (e.g., Comply Advantage, Dow Jones Risk & Compliance) as part of KYB submission. Any match holds the KYB application for manual review. A confirmed match results in account rejection and reporting as required by applicable law.

Sanctions screening also runs at deal creation (Phase 3+) for all parties in a deal, checked against the country-pair blocking list.

---

## 5. Marketplace Liability Framework

Gracera operates as a **neutral platform facilitator**, not a party to any transaction between suppliers and buyers. This is a critical liability boundary that must be clearly stated in the ToS and upheld in product design.

### 5.1 What Gracera Is

- A technology platform that facilitates introductions between suppliers and buyers
- A provider of AI-generated match scores and rationale (not binding recommendations)
- A facilitator of messaging and document exchange in the Deal Room
- A referral partner for trade finance, logistics, and inspection services (not a provider of those services)

### 5.2 What Gracera Is Not

- A party to any supply agreement, purchase order, or distribution agreement between users
- A guarantor of supplier quality, product conformity, or delivery
- An arbitrator (the trust team issues non-binding recommendations; users must seek arbitration independently for unresolved disputes)
- A financial institution, escrow provider, or payment processor for trade transactions

### 5.3 Key ToS Provisions

These provisions must appear clearly in the Terms of Service:

**Limitation of liability:**
> Gracera's total liability to any user for any claim arising from use of the platform shall not exceed the total fees paid by that user to Gracera in the 12-month period preceding the claim.

**No warranties on match quality:**
> AI-generated match scores and rationale are provided for informational purposes only. Gracera makes no warranty that any introduction will result in a completed transaction or that a supplier or buyer is as described in their profile.

**User responsibility for due diligence:**
> Users are solely responsible for conducting their own due diligence before entering into any business agreement. Gracera's verification badges (Verified Business, Certified) indicate that certain checks have been performed; they do not constitute a guarantee of the user's trustworthiness or ability to perform.

**Prohibited goods:**
> The platform may not be used to source or supply goods that are: illegal in the user's jurisdiction or the counterparty's jurisdiction; on any applicable export control list; classified as weapons, controlled substances, counterfeit goods, or endangered species products.

**Indemnification:**
> Users agree to indemnify and hold harmless Gracera from any claims, losses, or damages arising from their use of the platform, including any disputes with counterparties.

### 5.4 Gracera's Dispute Role

Gracera's trust team provides a non-binding mediation service (see [docs/08-deal-workflow.md §7](08-deal-workflow.md) and [docs/20-admin-ops-spec.md §4](20-admin-ops-spec.md)). Gracera does not guarantee refunds or outcomes. Unresolved disputes are referred to appropriate arbitration bodies (ICC, CIETAC, SIAC) based on the parties' domiciles.

This non-binding mediation structure is important: it maintains Gracera's role as facilitator (not party to transactions) while providing a practical dispute resolution service that increases user trust without creating legal liability.

---

## 6. Contract Templates

Gracera provides pre-built contract templates within the Deal Room for users to customise and sign via DocuSign/HelloSign (Phase 3+). These are starting-point templates, not legal advice. Each template includes a visible disclaimer: *"This template is a starting point provided for convenience. Seek qualified legal counsel before signing any binding agreement."*

### 6.1 Template Library

| Template | Use case | Key variables |
|----------|---------|--------------|
| **Purchase Order (PO)** | Buyer commitment to purchase at agreed terms | Parties, product, quantity, price, incoterms, payment terms, delivery date |
| **Non-Disclosure Agreement (NDA)** | Protecting confidential information shared during negotiation | Parties, scope of confidential info, term (1–3 years), governing law |
| **Distribution Agreement** | Exclusive or non-exclusive reseller/distributor rights | Parties, territory, exclusivity, minimum purchase commitments, term, renewal |
| **Sample Agreement** | Paid or free sample provision terms | Parties, sample specs, IP ownership of product concept, confidentiality, conversion to PO timeline |
| **Manufacturing Agreement** | Custom production for buyer's specifications | Parties, product specs (by reference to attached drawings/docs), QC standards, IP ownership, tooling costs |

### 6.2 Template Governance

- Templates are maintained by Gracera's legal counsel and reviewed annually
- Templates are jurisdiction-neutral by default; a "Governing Law" field lets users select their jurisdiction
- Templates carry version numbers; users are warned if they open an older-version template after a newer one is published
- Completed (signed) agreements are stored in Oracle Cloud Object Storage, encrypted at rest, retained for 7 years

---

## 7. Export Controls & Trade Sanctions

### 7.1 Country-Pair Blocking

Gracera maintains a blocklist of sanctioned country pairs derived from:
- OFAC (US Treasury): SDN list and country sanctions programs
- EU Consolidated Sanctions List
- UN Security Council Resolutions
- UK OFSI

**Current broadly sanctioned countries (as of 2026):** North Korea (DPRK), Iran, Syria, Cuba, Russia (sector-specific), Belarus (sector-specific).

When a buyer sourcing request or supplier profile involves a sanctioned country:
- Introduction between sanctioned parties is blocked at the matching layer
- If a deal is initiated that would involve a sanctioned country pair (e.g., supplier updates their country post-introduction), the deal is flagged and suspended pending review

### 7.2 Prohibited Goods List

Gracera maintains a blocklist of product categories that may not be listed:
- Military weapons, firearms, ammunition
- Controlled substances, narcotics, precursor chemicals (without specific licensing)
- Counterfeit or trademark-infringing goods
- CITES-listed endangered species products
- Goods on applicable export control lists (EAR, ITAR, EU Dual-Use Regulation)

New sourcing requests are scanned against this list at publish time (see [docs/20-admin-ops-spec.md §8.3](20-admin-ops-spec.md)).

---

## 8. Intellectual Property

### 8.1 Platform Content

- Gracera's matching algorithms, scoring models, AI prompts, and platform software are proprietary
- User-submitted profile content (descriptions, certifications) remains the property of the user
- Gracera holds a non-exclusive license to use user profile content for: displaying it on the platform, including it in AI matching, generating anonymised benchmarks for Intelligence Reports, and optimising SEO/AEO pages

### 8.2 Intelligence Reports

- Intelligence Reports are compiled from aggregated, anonymised data — no individual deal or company is identifiable
- Reports are Gracera's original work product and are copyright Gracera
- Users who purchase Intelligence Reports may use the data internally; they may not resell or republish Gracera's report data

### 8.3 User IP in Deal Room

- Specifications, CAD files, product formulations, and other IP shared in the Deal Room remain the property of the submitting party
- Gracera's NDA template (available in the Deal Room) provides a framework for protecting IP exchanged during negotiation
- Gracera does not access Deal Room attachments except for the virus scan performed on upload

---

## 9. Accessibility & Consumer Protection

- Platform must comply with WCAG 2.1 AA at minimum (Phase 4 target)
- UK Consumer Rights Act, EU Distance Selling Directive, and Australian Consumer Law may apply to some user interactions — seek local legal advice before entering those markets at scale
- Subscription auto-renewal must be clearly disclosed at signup and in renewal reminder emails (EU requirement)
- Right to cancel subscription (with refund for unused period) is offered within 14 days of initial purchase to EU users under the Consumer Rights Directive

---

[Back to README](../README.md)
