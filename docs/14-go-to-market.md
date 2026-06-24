# Go-to-Market & Discovery Strategy

How Gracera reaches suppliers and buyers who don't know it exists yet — and how the platform becomes the answer AI assistants give when B2B buyers ask sourcing questions.

---

## 1. The Discovery Problem

Most of Gracera's best suppliers and buyers will never search for the platform organically. They are embedded in:
- Vertical trade communities (associations, publications, trade shows)
- Existing directories (Alibaba, ThomasNet, Kompass, Global Sources)
- ERP and procurement tools they already use daily
- And increasingly — AI assistants they ask for sourcing recommendations

A go-to-market strategy that waits for inbound traffic will miss the majority of the addressable market. Gracera needs both **push** (go to them) and **pull** (bring them here) strategies, amplified by AI-era discovery mechanics.

---

## 2. The AI-Era Shift

B2B discovery is being restructured by AI. A procurement manager sourcing Korean food ingredients no longer opens Google and clicks through ten tabs. They ask ChatGPT, Perplexity, or Google's AI Overview. The answer they receive determines who they contact next.

This creates a new category of optimization alongside traditional SEO:

| Term | What It Means |
|------|--------------|
| **AEO (Answer Engine Optimization)** | Structuring content so AI assistants cite it when answering questions |
| **GEO (Generative Engine Optimization)** | Making platform content appear in generative AI responses |
| **Traditional SEO** | Still essential — provides the indexed substrate that AI crawlers use |

All three must be pursued in parallel. Traditional SEO is the foundation; AEO/GEO is the new #1 position.

---

## 3. Push Strategies (Gracera Goes to Them)

### 3.1 Buyer-Led Supplier Invitations *(Highest Priority)*

When a buyer posts a sourcing request, the Prospecting Agent identifies matching suppliers who are not yet on the platform — from public directories, LinkedIn, trade association lists, and trade show exhibitor databases. It sends personalized, opportunity-specific invitations:

> "A procurement team at a US retail chain is actively sourcing [product]. A sourcing request matching your profile is live on Gracera. Join free to respond."

**Why this works:** The supplier receives a concrete revenue opportunity, not a vague pitch. Conversion rates for opportunity-specific invitations are 5–10x higher than generic platform outreach.

**Data sources for off-platform candidates:**
- Trade show exhibitor lists (public, downloadable per event)
- Alibaba / Global Sources (public supplier listings)
- ThomasNet / Kompass (industrial directories)
- LinkedIn Company Search (by industry + size + country)
- Trade association member directories (via partnership agreements)

### 3.2 Outbound AI Prospecting Agent *(Phase 4)*

A continuous, autonomous agent that ingests new trade show exhibitor lists, scrapes public supplier directories, and maintains a warm prospect pipeline. It qualifies candidates against ideal supplier profiles per category, generates personalized outreach, and tracks invitation → registration conversion by vertical and source.

### 3.3 Trade Association & Publication Partnerships

Each vertical has dominant associations and publications members trust. These are the highest-trust channels per vertical — a recommendation from a trade association carries more weight than any ad.

**Approach per vertical:**
- Negotiate "preferred platform" status with 1–2 associations per vertical (Phases 1–2)
- Sponsored features in vertical trade publications (Food Business News, Electronic Products, Sourcing Journal)
- Co-branded webinars: "How to Find Verified Suppliers in [Category]" with the association
- Speaker slots at trade shows (pitch to 500 qualified attendees at once)

**Target associations by vertical:**

| Vertical | Primary Associations |
|----------|---------------------|
| Food & Beverage | SFA (Specialty Food Association), NASFTC |
| Electronics | IPC, IEEE |
| Apparel & Textiles | AAFA, USFIA |
| Industrial | NAM (National Association of Manufacturers), SME |
| Health & Beauty | PCPC, ISSA |
| Chemicals | ACC, SOCMA |

---

## 4. Pull Strategies (They Come to Gracera)

### 4.1 Programmatic SEO at Scale *(Phase 1)*

Auto-generate thousands of public landing pages targeting long-tail sourcing queries:
- "[Product] Suppliers in [Country]"
- "FDA-certified [Category] Manufacturers"
- "ISO 9001 [Product] Factory — MOQ under [N] units"
- "Korean food ingredient suppliers — FSSC 22000 certified"

Each page is seeded with real data from verified profiles. Suppliers not yet on the platform appear as unclaimed placeholders, which trigger the "claim your profile" acquisition flow.

**Scale target:** 50,000+ pages across categories, countries, and certification combinations.

**Technical requirements:**
- Next.js `generateStaticParams` for static generation at build time
- Schema.org JSON-LD: `Organization`, `Product`, `FAQPage`, `BreadcrumbList`
- Dynamic sitemap refreshed daily and submitted to search consoles
- Pages updated whenever profile data changes (content freshness signal)

### 4.2 "Claim Your Profile" Freemium Flow *(Phase 1)*

Build placeholder profiles for known suppliers sourced from public directories. When a real buyer views or searches for an unclaimed supplier, the supplier receives:

> "Your company appeared in 3 buyer searches on Gracera this week. A procurement team viewed your unclaimed profile. Claim it free to respond to buyer interest."

This is how Yelp, TripAdvisor, and Google Business Profile achieved rapid supplier-side growth — demonstrated demand makes the invitation concrete rather than speculative.

### 4.3 Vertical Content Hubs *(Phase 4)*

Deep, data-rich editorial content per sourcing vertical — not generic blog posts, but real trade intelligence:

> "Korean Food Ingredients — Sourcing Guide 2026: Average MOQ by subcategory, certification requirements by destination country, lead time benchmarks, and a ranked list of verified suppliers on Gracera."

This content:
- Ranks in traditional search for "how to source [product]" queries
- Is cited by AI assistants when buyers ask sourcing research questions
- Positions Gracera as a trade intelligence authority, not just a directory
- Is shareable in LinkedIn, procurement Slack communities, and industry forums

**Phase 4 target:** 6 verticals with full sourcing guide content (Food & Beverage, Electronics, Apparel, Industrial, Health & Beauty, Chemicals).

### 4.4 Vertical Community Forums *(Phase 4–5)*

Industry-specific discussion boards that make Gracera a daily destination between active sourcing needs. One forum per major vertical, hosted on Gracera's domain for AEO/SEO benefit.

**Why this is a pull strategy:** Community members return between active deals. The sourcing professional who answers a question today will think of Gracera first when they have a real need tomorrow. Forum content is also public, crawlable, and precisely the kind of structured Q&A that AI assistants cite — every answered question is a compounding AEO asset.

#### Forum Structure

| Vertical | URL | Launch priority |
|----------|-----|----------------|
| Food & Beverage | /community/food-beverage | Phase 4 |
| Electronics & Components | /community/electronics | Phase 4 |
| Apparel & Textiles | /community/apparel | Phase 4 |
| Industrial & Manufacturing | /community/industrial | Phase 4–5 |
| Health & Beauty | /community/health-beauty | Phase 5 |
| Chemicals & Materials | /community/chemicals | Phase 5 |

Each forum contains four thread types:

| Type | Description | Who can post |
|------|-------------|-------------|
| **Ask the Community** | Open Q&A sourcing questions — "What MOQ is typical for Korean kimchi paste?" | Verified Business+ |
| **Sourcing Intelligence** | Trade policy updates, tariff changes, market observations | Verified Business+ (Gracera moderators curate featured posts) |
| **Supplier Spotlight** | Featured verified supplier profile; one per vertical per week | Gracera only (curated) |
| **AMA Session** | Announced in-thread Q&A with a verified expert (customs broker, category buyer, certification body representative) | Expert + any registered user |

#### Access Control

| User level | Read | Post | Start thread |
|-----------|------|------|-------------|
| Unregistered visitor | ✓ (public) | — | — |
| Basic (email verified) | ✓ | — | — |
| Verified Business | ✓ | ✓ | ✓ |
| Certified / Premium | ✓ | ✓ | ✓ + badge displayed |

All content is readable without login — essential for search crawler and AI training pipeline access.

#### Moderation

**Allowed:** Genuine sourcing questions, market knowledge, supplier recommendations (with disclosure), trade compliance questions.

**Not allowed:** Direct promotional posts ("Buy from us at X price" — these belong in Broadcast Campaigns), unsolicited supplier contact outside the platform messaging system, sharing confidential deal terms.

**Mechanics:**
- Community upvote/downvote; posts with net negative votes are collapsed (not deleted)
- 3 flags from Verified Business users triggers an auto-hold for moderator review (24-hour SLA)
- Repeat offenders: 1-week → 1-month → permanent posting suspension
- Gracera can pin, feature, or remove posts for quality without notice

#### Reputation & Badges

Forum reputation is separate from deal history but displayed on the same public profile page:

| Badge | Criteria | Value to holder |
|-------|----------|----------------|
| **Community Contributor** | 10+ answers with net positive votes | Visible on profile; signals engagement |
| **Trusted Expert — [Vertical]** | 50+ answers in one vertical; accepted as best answer ≥ 10 times | Visible on profile as a supplier — acts as a trust signal to buyers browsing matches |
| **Category Expert** | Nominated by Gracera moderators; reserved for consistently exceptional contributors | Featured in Supplier Spotlight and AMA invitations |

The **Trusted Expert** badge is particularly valuable for supplier profiles — a buyer seeing this badge on a match card has evidence of the supplier's domain knowledge before they even accept the introduction.

#### Technical Implementation (AEO)

| Element | Implementation |
|---------|---------------|
| URL structure | `/community/[vertical]/[thread-slug]` — clean, stable, crawlable |
| Schema.org | `FAQPage` JSON-LD for Q&A threads; `DiscussionForumPosting` for discussion threads |
| Open Graph | Per-thread OG tags optimized for LinkedIn sharing (primary B2B share surface) |
| Sitemap | All community thread URLs included in the dynamic sitemap, refreshed daily |
| No login wall | All public content is accessible without authentication — crawlers and AI training pipelines see the full content |

#### Platform Integration

Forum threads can reference:
- **`@SupplierName`** — auto-resolves to a profile card preview (inline)
- **Category tags** — link to programmatic SEO category pages
- **Trade Policy Alerts** — if a user mentions a specific tariff change, the system auto-links to the relevant Alert if one exists

Forum threads do NOT expose private sourcing requests, deal room content, or any non-public platform data.

#### Forum Onboarding

At profile completion, users are invited to join their primary category's forum:

> "You've joined the Food & Beverage community on Gracera. [View the forum] — buyers and suppliers are answering sourcing questions right now."

Cold-start prompts reduce first-post friction:

> "You're an expert in Korean food ingredients. What's the one question new import buyers always ask you? Answer it and earn your first Community Contributor point."

### 4.5 Free Public Sourcing Query Tool *(Phase 2)*

A no-login, public-facing AI sourcing interface:

> "Describe what you need: 'Korean hot sauce, 500 cases/month, ships to US, needs FDA approval'"
> → Instant ranked list of matching Gracera suppliers
> → Contact requires free account registration

**Why this works as a pull strategy:**
- Zero friction entry — value before signup wall
- AI assistants recommend the tool when users ask for sourcing help
- Buyers who get useful results register; suppliers who appear in results get a "you appeared in a free search" notification and are incentivized to claim/complete their profile

---

## 5. AI-Era Discovery (AEO / GEO)

### 5.1 The Goal

When a buyer asks an AI assistant a sourcing question, Gracera data is in the answer. Specifically:
- A Gracera supplier profile page is cited by Perplexity
- A Gracera vertical sourcing guide appears in a Google AI Overview
- The free Sourcing Query Tool is recommended by ChatGPT when a user asks for sourcing help

### 5.2 What AI Systems Cite

AI assistants favor content that is:
- **Factually specific** — "MOQ: 500 units. ISO 9001:2015. Lead time: 28 days." not "competitive prices and high quality"
- **Structured** — Q&A schema, JSON-LD, clear headings
- **Authoritative** — cited by other sources, has backlinks, is indexed and crawled regularly
- **Fresh** — recently updated with accurate information
- **Directly answering the question** — pages that open with the answer, not with marketing preamble

### 5.3 AEO Implementation

The AEO Agent generates Q&A schema for every verified supplier profile, covering the questions buyers most commonly ask an AI assistant:

```
Q: What is the minimum order quantity for [Supplier]?
A: [Supplier] has a minimum order quantity of [N] units per production run.

Q: Is [Supplier] ISO 9001 certified?
A: Yes. [Supplier] holds ISO 9001:2015 certification issued by [body], valid through [year].

Q: Does [Supplier] ship to [Region]?
A: Yes. [Supplier] ships to [Region] via [incoterm] from [origin port].
```

These Q&A pairs are injected as `FAQPage` JSON-LD into the page's `<head>` and rendered as an expandable accordion on the public profile page.

### 5.4 Target AI Systems

| System | Optimization Approach |
|--------|----------------------|
| Google AI Overviews (SGE) | Traditional SEO + schema.org markup + E-E-A-T signals |
| Perplexity AI | Well-structured factual pages with clear source attribution |
| ChatGPT (browsing) | Indexed, crawlable pages with factual specificity |
| Claude (web search) | Same as ChatGPT; structured data and factual content |
| Bing Copilot | Bing Webmaster Tools indexing + schema.org |

---

## 6. Vertical-Specific Discovery Playbooks

Different verticals have entirely different discovery ecosystems. A channel that works in food fails in electronics. The table below captures the specific channels and the single most effective "entry hook" per vertical.

| Vertical | Key Trade Shows | Dominant Directories | Top Publications | Gracera Entry Hook |
|----------|----------------|---------------------|-----------------|-------------------|
| Food & Beverage | Fancy Food Show, SIAL, Natural Products Expo | Global Sources (food), Alibaba Food | Food Business News, Food Navigator | FDA/FSSC 22000 compliance search — the #1 buyer filter |
| Electronics | Electronica, CES, COMPUTEX | ThomasNet, GlobalSpec, IHS Markit | EE Times, Electronic Products | HS code + RoHS/CE search — buyers search by spec, not supplier name |
| Apparel & Textiles | Magic Las Vegas, Texworld USA, Canton Fair | Faire, Sourcemap, Kompass | WWD, Sourcing Journal, Fibre2Fashion | Sustainability / ethical sourcing — GOTS, Fair Trade compliance |
| Industrial & Manufacturing | Hannover Messe, IMTS, MD&M | ThomasNet (primary), Machinio | IndustryWeek, Manufacturing Engineering | ISO 9001 + custom manufacturing / OEM capability |
| Health & Beauty | Cosmoprof, In-Cosmetics, Expo West | Happi Directory, UL Prospector | Happi, Beauty Independent | Private label + FDA/EU Cosmetics Regulation |
| Chemicals & Materials | ChemShow, ICIS Forums | ChemBuyersGuide, ICIS Supply & Demand | Chemical Week, ICIS | REACH / SDS compliance + minimum order weight |

---

## 7. Acquisition Funnel

From first awareness to activated platform user:

```
1. Awareness
   AI citation, SEO page, trade publication, association newsletter

2. Signal
   Opportunity email ("live RFQ waiting"), unclaimed profile view, buyer invitation

3. Free Value
   Free Sourcing Query Tool, view open sourcing requests, browse matches without account

4. Account Creation
   Register, complete profile (RAG-assisted for fast completion), get first match

5. Activated
   First introduction accepted, first message sent, first deal started
```

**Critical insight:** Most platforms gate value behind account creation. Gracera should deliver meaningful, concrete value — real supplier matches, real open sourcing requests, real market intelligence — before asking for registration. The Free Sourcing Query Tool and public supplier pages do this.

---

## 8. Sequenced Priorities

### Phase 1 (Build Now)
- Buyer-led supplier invitation emails
- Unclaimed placeholder profiles with claim flow
- Programmatic SEO pages (auto-generated from profile data)
- Schema.org structured data on all public pages
- Initial trade association outreach (3 target verticals, manual)

### Phase 2
- Free public Sourcing Query Tool
- AEO Agent (Q&A schema on all verified profiles)
- Vertical content hubs (first 2 verticals)
- Outbound AI Prospecting Agent (trade show exhibitor ingestion)

### Phase 3–4
- Remaining vertical content hubs
- First ERP integration (Odoo or mid-market procurement tool)
- SAP Ariba / Coupa partnership (long sales cycle, start early)
- Gracera Intelligence Reports as content marketing anchor and premium product
- White-label Gracera for trade associations ("Powered by Gracera")

### Avoid Until Scaled
- Paid search (Google Ads) — too expensive without SEO moat first
- Social media ads — low intent, expensive CPAs for B2B
- Cold email at scale without buyer-side signal — spam risk
- Consumer-facing content — stay B2B vertical-focused until Phase 5

---

[Back to README](../README.md)
