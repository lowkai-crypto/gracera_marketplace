# Product Roadmap

---

## Guiding Principles

1. **Match quality first.** Every feature that improves match relevance ships before growth features.
2. **Both sides, always.** Every release delivers value to both suppliers and buyers simultaneously.
3. **Trust compounds.** Verification, reviews, and deal history are infrastructure — invest early.
4. **International by design.** Build for global trade from the start; retrofitting is expensive.

---

## Phase 1 — Core Platform (Months 1–4)

**Goal:** Launch a working marketplace where suppliers and buyers can find each other.

### Milestone 1.1 — Foundation (Month 1–2)
- [ ] User registration and authentication (email + Google OAuth)
- [ ] Supplier profile builder (all fields from spec)
- [ ] Buyer profile builder + sourcing request
- [ ] Business registration verification (email + manual review)
- [ ] Basic keyword + filter search (Elasticsearch)
- [ ] Category taxonomy finalized

### Milestone 1.2 — Discovery (Month 2–3)
- [ ] Batch AI matching (daily digest) — top 10 matches per user
- [ ] Match card UI with score and rationale
- [ ] Accept / reject introduction flow
- [ ] Secure in-platform messaging (post-introduction)
- [ ] Email notifications (match digest, new message)

### Milestone 1.3 — Trust Layer (Month 3–4)
- [ ] Profile completeness score and nudge system
- [ ] Certification upload and verification
- [ ] Verified Business badge
- [ ] User reviews (post-deal)
- [ ] Basic spam/fraud controls

**Phase 1 Exit Criteria:**
- 500 active supplier profiles
- 200 active buyer sourcing requests
- > 100 mutual introductions accepted
- NPS > 30 among active users

---

## Phase 2 — AI Agent MVP (Months 4–7)

**Goal:** Move from daily batch matching to real-time, intelligent matching.

### Milestone 2.1 — Real-Time Matching (Month 4–5)
- [ ] Event-driven match trigger (profile publish/update → immediate re-match)
- [ ] Match quality improvements based on Phase 1 feedback signals
- [ ] "Why this match?" expandable rationale UI
- [ ] User feedback on matches (reject with reason category)

### Milestone 2.2 — Personalization (Month 5–6)
- [ ] Per-user match weight adjustment based on feedback history
- [ ] Buyer intent scoring (activity signals: views, messages, deal history)
- [ ] Supplier lead score (conversion history, response rate)
- [ ] "Find me more like this" — user-triggered re-match from an accepted introduction

### Milestone 2.3 — AI Polish (Month 6–7)
- [ ] Prompt caching for high-volume match scoring (cost reduction)
- [ ] Match explanation available in user's preferred language
- [ ] AI-generated "onboarding tips" based on profile gaps
- [ ] A/B test: match rationale short vs. long → optimize acceptance rate

**Phase 2 Exit Criteria:**
- Match acceptance rate > 65%
- Average time-to-first-match < 1 hour from profile publish
- AI inference cost per match < $0.005

---

## Phase 3 — Deal Workflow (Months 7–10)

**Goal:** Support the full deal lifecycle in-platform, from introduction to closed deal.

### Milestone 3.1 — RFQ & Quote (Month 7–8)
- [ ] RFQ builder (buyer)
- [ ] Quote builder with line items (supplier)
- [ ] Counter-offer flow
- [ ] Deal status tracking

### Milestone 3.2 — Deal Room (Month 8–9)
- [ ] Deal room UI with shared document store
- [ ] Milestone checklist (both parties confirm)
- [ ] Trade document templates (pro-forma invoice, packing list, PO)
- [ ] PDF export

### Milestone 3.3 — Deal Intelligence (Month 9–10)
- [ ] Deal analytics dashboard (per user: win rate, avg deal size, cycle time)
- [ ] AI-generated deal summary at close (for reporting)
- [ ] Deal outcome feeds back into match scoring

**Phase 3 Exit Criteria:**
- 200 deals entered deal room
- 50 deals marked closed
- Average deal cycle time tracked and < 30 days from intro to close

---

## Phase 4 — International Scale (Months 10–14)

**Goal:** Extend the platform for international trade with language, currency, and compliance features.

### Milestone 4.1 — Multi-Language (Month 10–11)
- [ ] UI localization: EN, ZH, ES, AR
- [ ] Profile content machine translation (DeepL)
- [ ] AI match rationale in user's preferred language
- [ ] RTL layout for Arabic

### Milestone 4.2 — Multi-Currency & Trade (Month 11–12)
- [ ] Live exchange rate display
- [ ] Currency selection in user settings
- [ ] HS code tagging and search
- [ ] Incoterms matching and compatibility flags

### Milestone 4.3 — Compliance & Trust (Month 12–14)
- [ ] Sanctioned country pair blocking
- [ ] Certification requirements by destination country
- [ ] Certificate of Origin template
- [ ] KYB (Know Your Business) verification — Premium tier

---

## Phase 5 — Growth & Monetization (Month 14+)

**Goals:** Sustainable revenue model; viral growth mechanics.

### Planned Features
- Subscription tiers (Free, Pro, Enterprise) with feature gates
- Lead credits for boosted match visibility
- Success fee on verified closed deals (optional)
- Featured supplier placements in search results (auction-based)
- API access for ERP / procurement system integrations
- Mobile native app (iOS + Android)
- Referral program for both suppliers and buyers
- Gracera Verified — premium trust badge with marketing value

---

## Backlog (Unscheduled)

- Video profiles for suppliers (30-second factory/office tour)
- Sample order management (tracking sample shipments)
- Third-party logistics integrations (freight forwarder quotes)
- Escrow / payment facilitation
- Supplier group buying coordination (buyers pool demand)
- Trade finance integrations (invoice factoring, LC issuance)
- Industry-specific verticals: Food & Beverage, Electronics, Apparel, Industrial

---

[Back to README](../README.md)
