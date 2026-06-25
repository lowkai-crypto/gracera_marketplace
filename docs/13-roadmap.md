# Product Roadmap

**Version:** 0.3 — Gap analysis: dispute resolution, multi-supplier RFQ, e-signature, dual-role UX, capacity signals, group buying, trade policy alerts, and more added across all phases.

---

## Guiding Principles

1. **Match quality first.** Every feature that improves match relevance ships before growth features.
2. **Both sides, always.** Every release delivers value to both suppliers and buyers simultaneously.
3. **Trust compounds.** Verification, reviews, and deal history are infrastructure — invest early.
4. **International by design.** Build for global trade from the start; retrofitting is expensive.
5. **Be cited, not just found.** AI assistants are becoming the primary discovery channel for B2B buyers — every supplier profile should be structured to appear in AI-generated answers.

---

## Legend

- *(core)* — Original Gracera spec
- *(skystar)* — Imported from SkyStarCloud reference project
- *(new)* — New business suggestion

---

## Phase 1 — Core Platform (Months 1–4)

**Goal:** Launch a working marketplace where suppliers and buyers can find each other, with a production-ready billing system and an acquisition engine that works from day one.

### Milestone 1.1 — Foundation (Month 1–2)
- [ ] User registration and authentication — email + Google OAuth *(core)*
- [ ] **Dual-role account support** — `role = both` allows one login to hold a supplier profile AND a buyer profile; context switcher in top navigation; self-match suppression; unified notification inbox with Supplier/Buyer tags; independent subscription records per role *(new)*
- [ ] Supplier profile builder (all fields from spec) *(core)*
- [ ] **RAG profile auto-population** — upload catalog PDF → AI fills profile fields *(skystar)*
- [ ] Buyer profile builder + sourcing request *(core)*
- [ ] Business registration verification (email + manual review) *(core)*
- [ ] Basic keyword + filter search (Elasticsearch) *(core)*
- [ ] Category taxonomy finalized *(core)*
- [ ] **Subscription tiers with offline payment support** (wire transfer confirmation queue) *(skystar)*
- [ ] **Admin impersonation** for customer success team *(skystar)*

### Milestone 1.2 — Discovery (Month 2–3)
- [ ] Batch AI matching (daily digest) — top 10 matches per user *(core)*
- [ ] Match card UI with score and rationale (in user's preferred language) *(core)*
- [ ] Accept / reject introduction flow *(core)*
- [ ] Secure in-platform messaging (post-introduction) *(core)*
- [ ] Email notifications (match digest, new message) *(core)*
- [ ] **Unclaimed placeholder profiles** with "claim your profile" flow *(new)*
- [ ] **Buyer-led supplier invitation emails** — AI identifies off-platform matches when a buyer posts *(new)*
- [ ] **Programmatic SEO at Scale** — three-tier URL taxonomy (category hub → country spoke → certification leaf); 50,000+ combination pages seeded with verified profile data; unclaimed placeholder pages with "claim your profile" flow; `ItemList` + `FAQPage` + `Organization` schema.org markup; ISR revalidation on profile change events; `noindex` below ≥3 verified supplier threshold *(new)*

### Milestone 1.3 — Trust Layer (Month 3–4)
- [ ] **Competitive profile benchmarking** — "Your MOQ is 2x the category average; here's what top suppliers in your category look like" *(new)*
- [ ] Profile completeness score and nudge system *(core)*
- [ ] Certification upload and verification *(core)*
- [ ] Verified Business badge *(core)*
- [ ] User reviews (post-deal) *(core)*
- [ ] Basic spam/fraud controls *(core)*

**Phase 1 Exit Criteria:**
- 500 active supplier profiles
- 200 active buyer sourcing requests
- > 100 mutual introductions accepted
- NPS > 30 among active users
- First offline payment successfully confirmed

---

## Phase 2 — AI Agent MVP (Months 4–7)

**Goal:** Real-time, intelligent matching; AI insights that make both sides better at their jobs; and the first off-platform reach tools that bring in non-registered users.

### Milestone 2.1 — Real-Time Matching (Month 4–5)
- [ ] Event-driven match trigger (profile publish/update → immediate re-match) *(core)*
- [ ] **Vector supplement search** (Pinecone/Weaviate) — catches semantic matches Elasticsearch misses *(new)*
- [ ] "Why this match?" expandable rationale UI *(core)*
- [ ] User feedback on matches (reject with reason category) *(core)*
- [ ] **Social proof integration** — LinkedIn/trade social signals feed match recency score *(skystar)*
- [ ] **AEO Agent** — Q&A schema markup on all verified supplier profile pages *(new)*
- [ ] **Supplier availability signals** — `Available / Limited / Fully Booked` on profiles; weekly re-prompt; used in matching soft filter *(new)*
- [ ] **Certification expiry monitoring** — automated alerts at 90/60/30 days; auto-exclude expired certs from matching *(new)*
- [ ] **White-glove onboarding service** — 5-step flow: intake form → structured specialist interview (30–60 min) → profile build (≥85% completeness target) → supplier review → publish + first match monitor. Requires: internal admin onboarding queue (session scheduler, split-screen profile builder, RAG trigger, communication thread); specialist vertical certification program (Food, Electronics, Apparel, Industrial at launch). Pricing: $199 one-time or included in annual Pro. *(new)*

### Milestone 2.2 — Intelligence Layer (Month 5–6)
- [ ] **AI Business Insights Brief** — profile health, category benchmarks, certification ROI *(skystar)*
- [ ] **Growth Strategy Engine** — export market entry plan (supplier) / sourcing diversification strategy (buyer) *(skystar)*
- [ ] Buyer intent scoring, Supplier lead scoring *(core)*
- [ ] Per-user match weight adjustment based on feedback history *(core)*
- [ ] **Free public Sourcing Query Tool** — no-login, contact-gated *(new)*

### Milestone 2.3 — Deal Activation (Month 6–7)
- [ ] **Sample Order Fast Track** — 1-click sample request, no RFQ required *(new)*
- [ ] **AI Price Compass** — market rate estimates before negotiating *(new)*
- [ ] **Verified Deal Network** — closed deals create permanent connections *(new)*
- [ ] Prompt caching for high-volume match scoring (cost reduction) *(core)*
- [ ] Match explanation available in user's preferred language *(core)*

**Phase 2 Exit Criteria:**
- Match acceptance rate > 65%
- Average time-to-first-match < 1 hour from profile publish
- AI inference cost per match < $0.005
- 1,000+ supplier profiles citing Q&A schema (AEO coverage)
- 200+ sample orders placed via Fast Track

---

## Phase 3 — Deal Workflow (Months 7–10)

**Goal:** Support the full deal lifecycle in-platform; give both sides the intelligence tools to close deals faster; expand the supplier ecosystem with alliance packs and trade finance.

### Milestone 3.1 — RFQ & Quote (Month 7–8)
- [ ] **RFQ builder with category templates** (20+ verticals) *(new)*
- [ ] **Multi-supplier RFQ** — send one RFQ to up to 5 suppliers; side-by-side quote comparison; winner selection flow *(new)*
- [ ] Quote builder with line items *(core)*
- [ ] Counter-offer flow *(core)*
- [ ] Deal status tracking *(core)*
- [ ] **AI Negotiation Coach** — private deal coaching during quote/counter-offer *(new)*
- [ ] **Dispute resolution** — filing flow, 48h cooling-off, trust team mediation, arbitration referral *(new)*
- [ ] **Buyer payment track record** — on-time payment rate and avg days-to-payment, computed and shown to suppliers at introduction stage *(new)*

### Milestone 3.2 — Deal Room & AI-Brain (Month 8–9)
- [ ] Deal Room UI with shared document store *(core)*
- [ ] Milestone checklist (both parties confirm) *(core)*
- [ ] Trade document templates (pro-forma invoice, packing list, PO) *(core)*
- [ ] PDF export *(core)*
- [ ] **E-signature & contract templates** — PO, Distribution Agreement, NDA, Sample Agreement via DocuSign/HelloSign *(new)*
- [ ] **Third-party pre-shipment inspection** — QIMA/SGS/Bureau Veritas integration; bookable from Deal Room after "Production completed" milestone *(new)*
- [ ] **Buyer protection / payment security referral** — milestone-linked escrow partner at Deal Room entry *(new)*
- [ ] **Repeat order flow** — "Reorder" button on closed deals; standing order reminder for recurring buyers *(new)*
- [ ] **Human translator network (Phase 3 scope)** — in-Deal Room booking UX; translator vetting pipeline (language proficiency test + vertical knowledge test + NDA + references); first 3 language pairs at launch: EN↔ZH, EN↔KO, EN↔AR; session mechanics (translator joins thread as distinct participant; auto-revoke on session end); post-session rating system. Phase 3 exit target: 20+ vetted translators across 3 language pairs. *(new)*
- [ ] **AI-Brain (Business Advisor)** — persistent, conversational AI advisor with full context of profile, match history, active deals, deal history, and category benchmarks; available to Pro/Enterprise users; prompt-cached context block for cost efficiency *(new)*
- [ ] **AI Growth Advisor** — structured mode within AI-Brain; 10-question intake assessment → personalized AI adoption roadmap across 4 domains (Marketing & Visibility, Sales & Customer Reach, Operations, Product Development); every recommendation grounded in the user's actual Gracera deal data and category benchmarks; roadmap regenerated quarterly and on significant deal pattern changes *(new)*
- [ ] **Trade Finance Referral** — "Get Paid Now" factoring at Deal Room entry *(new)*
- [ ] **Gracera Verified Logistics** — freight quotes + landed cost estimate at Deal Room entry *(new)*

### Milestone 3.3 — Ecosystem Expansion (Month 9–10)
- [ ] **SOP Library for suppliers** — publish QC procedures and handling specs as trust signals *(skystar)*
- [ ] **Supplier Broadcast Campaigns** — targeted trade announcements to relevant buyer segments *(skystar)*
- [ ] **Downstream Customer Segmentation** — buyers define end-customer profiles for second-order matching *(skystar)*
- [ ] **Supplier Alliance Packs** — complementary suppliers bundle as a package offering *(new)*
- [ ] Deal analytics dashboard (win rate, avg deal size, cycle time) *(core)*

**Phase 3 Exit Criteria:**
- 200 deals entered Deal Room
- 50 deals marked closed
- Average deal cycle time < 30 days from intro to close
- 10+ Alliance Packs formed
- Trade Finance Referral rate > 15% of Deal Room entries
- 20+ vetted translators active across EN↔ZH, EN↔KO, EN↔AR
- 0 open dispute cases older than 10 business days

---

## Phase 4 — International Scale (Months 10–14)

**Goal:** Extend the platform for international trade; launch the intelligence report product; build ERP integrations and logistics partnerships.

### Milestone 4.1 — Multi-Language & Currency (Month 10–11)
- [ ] UI localization: EN, ZH, ES, AR *(core)*
- [ ] Profile content machine translation (DeepL) *(core)*
- [ ] AI match rationale in user's preferred language *(core)*
- [ ] RTL layout for Arabic *(core)*
- [ ] Live exchange rate display and currency selection *(core)*
- [ ] Prices stored in USD; displayed in user's preferred currency *(core)*

### Milestone 4.2 — Trade Features (Month 11–12)
- [ ] HS code tagging and search *(core)*
- [ ] Incoterms matching and compatibility flags *(core)*
- [ ] Trade document templates (Certificate of Origin) *(core)*
- [ ] **Gracera Intelligence Reports** — category market data: MOQ averages, price ranges, lead times *(new)*
- [ ] **Vertical content hubs** — deep sourcing guides per vertical, AEO-optimized *(new)*

### Milestone 4.2b — Group Buying & Trust (Month 11–12)
- [ ] **Group buying (MOQ pooling)** — pool demand across compatible buyers; Lead Buyer model; group RFQ flow *(new)*
- [ ] **Document authenticity verification** — issuer API digital verification + AI pre-screening for uploaded certifications *(new)*
- [ ] **Trade policy & tariff alert system** — USITC, EU TARIC, WTO feed per user's active categories and country pairs *(new)*

### Milestone 4.3 — Compliance & Ecosystem (Month 12–14)
- [ ] Sanctioned country pair blocking (OFAC, EU, UN lists) *(core)*
- [ ] Certification requirements by destination country *(core)*
- [ ] KYB (Know Your Business) verification — Premium tier *(core)*
- [ ] **ERP / Procurement tool integration** — Coupa, Odoo, SAP Ariba API *(new)*
- [ ] **Outbound AI Prospecting Agent** — trade show exhibitor list ingestion, systematic off-platform reach *(new)*
- [ ] **Vertical community forums — Phase 4 launch (4 verticals):** Food & Beverage, Electronics, Apparel, Industrial. Includes: 4 thread types (Ask the Community, Sourcing Intelligence, Supplier Spotlight, AMA); access control (Verified Business+ can post; public read); moderation tools (flag queue, 24h SLA); `FAQPage` + `DiscussionForumPosting` schema.org markup; Trusted Expert badge earning system; platform integration (`@SupplierName` mention resolution). *(new)*
- [ ] **Human translator network — Phase 4 expansion:** Add EN↔ES and EN↔JA (completing all 5 priority language pairs); vertical certification program for all 6 sourcing verticals; urgent booking (<2h, 25% surcharge) support; Enterprise complimentary session entitlement (2 × 30min/month); translator quality dashboard (rating trend, session volume, removal threshold monitoring). *(new)*

**Phase 4 Exit Criteria:**
- Users in 30+ countries
- First Intelligence Report published and sold
- At least 1 ERP integration live
- AI assistant citation rate measurable (tracked via referral logs)
- All 4 Phase 4 community forums live with ≥ 50 threads each
- All 5 priority language pairs active in the translator network
- ≥ 10 translator sessions completed with average rating ≥ 4.2

---

## Phase 5 — Growth & Monetization (Month 14+)

**Goals:** Sustainable, diversified revenue; viral growth mechanics; platform as a data and intelligence product.

### Planned Features
- Subscription tiers fully gated (Free / Pro / Enterprise) with differentiated feature sets *(core)*
- Lead credits for boosted match visibility *(core)*
- **Intelligence Reports** as Enterprise feature gate *(new)*
- **AI Negotiation Coach** as Pro feature gate *(new)*
- **Alliance Pack premium listings** (auction-based placement) *(new)*
- API access for ERP / procurement system integrations *(core)*
- Mobile native app (iOS + Android) *(core)*
- Referral program for both suppliers and buyers *(core)*
- Gracera Verified — premium trust badge with marketing value *(core)*
- Success fee on verified closed deals (optional, opt-in) *(core)*
- Featured supplier placements in search results (auction-based) *(core)*
- **Vertical community forums — Phase 5 completion:** Launch Health & Beauty and Chemicals verticals; Category Expert nomination program; AMA session scheduling tool; forum-to-sourcing-request conversion tracking (community engagement → deal attribution) *(new)*
- **White-glove onboarding — specialist expansion:** Add vertical certifications for Health & Beauty and Chemicals; expand to 3 additional business languages (PT, FR, DE); track specialist NPS and deal conversion rate per specialist as a performance KPI *(new)*
- **Dual-role bundle pricing** — formal 15% discount for Pro on both supplier + buyer sides; dual-role Enterprise negotiated tier *(new)*

---

## Backlog (Unscheduled)

- Video profiles for suppliers (30-second factory/office tour)
- Sample order tracking (logistics integration for sample shipments)
- Trade finance integrations (LC issuance — beyond invoice factoring referral)
- Industry-specific verticals: dedicated sub-platforms for Food & Beverage, Electronics, Apparel, Industrial
- White-label Gracera for trade associations ("Powered by Gracera")
- Consumer NPS and deal outcome survey integration
- Buyer group buying expansion: formal buying cooperatives with long-term shared supplier contracts

---

[Back to README](../README.md)
