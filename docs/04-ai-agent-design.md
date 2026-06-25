# AI Agent Design

Gracera runs six distinct AI agents. The Matching Agent is the core differentiator. The Prospecting, Business Intelligence, Negotiation Coach, AEO, and AI-Brain agents extend the platform's intelligence layer across the full user lifecycle.

---

## 1. Agent Overview

| Agent | When It Runs | Who Benefits | Primary Output |
|-------|-------------|-------------|----------------|
| **Matching Agent** | Profile publish/update, new sourcing request | Both sides | Ranked match list with rationale |
| **Prospecting Agent** | Buyer posts sourcing request | Platform (growth) | Off-platform supplier invitation list |
| **Business Intelligence Agent** | Profile saved, weekly cron | Individual user | Insights brief, benchmarks, growth strategy |
| **Negotiation Coach Agent** | Quote submitted or counter-offered | Individual deal party | Private deal coaching (not shared) |
| **AEO Agent** | Profile verified, nightly cron | Platform (SEO/AEO) | Structured Q&A schema for AI citation |
| **AI-Brain Agent** | User-initiated (always-on chat) | Individual user | Conversational business advice synthesized across profile, deals, matches, and benchmarks |

---

## 2. Matching Agent

### 2.1 Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Candidate retrieval** | Pull candidate profiles from Elasticsearch + pgvector using structured filters and vector similarity |
| **Semantic scoring** | Use Claude LLM to evaluate deep compatibility beyond keyword overlap |
| **Match rationale** | Generate a human-readable explanation of why each match was made, in the viewer's preferred language |
| **Ranking** | Produce an ordered shortlist for each user |
| **Intent monitoring** | Re-run matching when profile data changes or new signals arrive |

### 2.2 Trigger Events

| Event | Action |
|-------|--------|
| Supplier publishes / updates profile | Find matching buyers |
| Buyer publishes / updates sourcing request | Find matching suppliers |
| New buyer signs up | Proactively match against existing supplier catalog |
| New supplier signs up | Proactively match against open buyer sourcing requests |
| User explicitly requests a re-match | Re-run matching for that user |

### 2.3 Matching Pipeline

```
Step 1: Pre-filter (Elasticsearch)
  - Hard filters: category match, geography overlap, language
  - Soft filters: MOQ range, lead time, certification requirements
  - Output: candidate set (up to 200 profiles per trigger)

Step 1b: Vector Supplement (pgvector)
  - Semantic similarity search on profile embeddings
  - Surfaces non-obvious cross-category matches
    (e.g. "industrial kitchen equipment" matching "food processing facility")
  - Adds up to 50 additional candidates not caught by Elasticsearch hard filters

Step 2: Semantic scoring (Claude API)
  - Input: supplier profile + buyer profile (structured JSON)
  - Prompt: asks Claude to evaluate compatibility across 6 dimensions
  - Output: score (0–100) + rationale per dimension
  - Prompt caching: supplier profile portion cached to reduce cost when scoring
    same supplier against many buyers

Step 3: Re-ranking
  - Weighted final score combining:
    • Semantic score (55%)
    • Profile completeness bonus (15%)
    • Verification bonus (15%)
    • Activity / recency score (10%)  ← includes social proof signals
    • Feedback adjustment (5%)        ← per-user learned weights
  - Top 10 matches surfaced per user per matching run

Step 4: Deduplication & suppression
  - Remove matches already accepted or rejected by the user
  - Suppress matches the user has already messaged
  - Remove blocked pairs

Step 5: Delivery
  - Write ranked results to matches table
  - Publish notification event
  - Match rationale generated in viewer's preferred language
```

### 2.4 Scoring Dimensions

| Dimension | What is evaluated | Weight |
|-----------|------------------|--------|
| **Category alignment** | Does the supplier's product/service match the buyer's sourcing category? | 25% |
| **Geography fit** | Can the supplier serve the buyer's required region? | 20% |
| **Scale compatibility** | Does buyer volume match supplier's MOQ and capacity? | 20% |
| **Certification / compliance match** | Does supplier hold certifications the buyer requires? | 15% |
| **Target customer fit** | Does the buyer type match the supplier's stated ideal customer? | 10% |
| **Communication / language** | Can both parties communicate effectively? | 10% |

### 2.5 Activity Signal Inputs (Recency Score)

The recency component incorporates:
- Days since last profile update (decays logarithmically)
- Social proof signals: LinkedIn posts, certification announcements pulled via OAuth
- Platform activity: logins, message responses, deal progress
- Broadcast campaign engagement (supplier who just announced new product gets a recency boost)

### 2.6 Claude API Integration

```python
import anthropic
import json

client = anthropic.Anthropic()

MATCH_PROMPT = """
You are a B2B trade matching expert. Given a supplier profile and a buyer
sourcing request, evaluate their compatibility across 6 dimensions.

Supplier Profile:
{supplier_json}

Buyer Sourcing Request:
{buyer_json}

Return a JSON object with this structure:
{{
  "overall_score": <0-100>,
  "dimensions": {{
    "category_alignment": {{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "geography_fit":      {{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "scale_compatibility":{{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "certification_match":{{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "target_customer_fit":{{"score": <0-100>, "rationale": "<1-2 sentences>"}},
    "communication_fit":  {{"score": <0-100>, "rationale": "<1-2 sentences>"}}
  }},
  "summary": "<2-3 sentence human-readable summary explaining why this is a good match>"
}}

Only return valid JSON. No commentary outside the JSON object.
Respond in {language}.
"""

def score_match(supplier: dict, buyer: dict, language: str = "English") -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a B2B trade matching expert. Return only valid JSON.",
        messages=[{
            "role": "user",
            "content": MATCH_PROMPT.format(
                supplier_json=json.dumps(supplier, indent=2),
                buyer_json=json.dumps(buyer, indent=2),
                language=language,
            )
        }]
    )
    return json.loads(response.content[0].text)
```

**Prompt caching:** The supplier profile portion is cached using Anthropic's prompt caching feature to reduce latency and cost when scoring the same supplier against many buyers.

### 2.7 Match Rationale — User-Facing Output

Each match card includes:
- Match score (Strong / Good / Potential based on thresholds)
- Summary sentence generated by Claude (in viewer's language)
- Up to 3 highlighted matching dimensions
- "Why this match?" expandable panel with dimension-level detail

### 2.8 Feedback Loop

| Action | Signal | Effect |
|--------|--------|--------|
| Accept introduction | Strong positive | Upweight similar profile characteristics |
| Reject — "wrong category" | Negative — category | Strengthen category filter for this user |
| Reject — "wrong volume" | Negative — scale | Strengthen MOQ/volume filter |
| Reject — "already know them" | Neutral | Suppress pair; no weight change |
| Deal closed | Very strong positive | Upweight all characteristics of this pair |
| Report as spam | Very strong negative | Lower platform-wide score of flagged profile |

---

## 3. Prospecting Agent

### 3.1 Purpose

When a buyer posts a sourcing request, the Prospecting Agent identifies matching suppliers who are **not yet on the platform** and triggers personalized outbound invitation emails. This drives the "buyer-led supplier invitation" acquisition channel — the highest-converting acquisition path because the supplier receives a concrete opportunity, not a generic pitch.

### 3.2 Data Sources

| Source | Type | Data Accessed |
|--------|------|---------------|
| Gracera Elasticsearch | On-platform | Unclaimed placeholder profiles |
| Trade show exhibitor databases | Public | Company name, category, country, website |
| LinkedIn Company Search | Public API | Company size, industry, contact info |
| Alibaba / Global Sources | Public crawl | Supplier name, category, country |
| ThomasNet, Kompass | Public directories | Industrial supplier data |
| Trade association member lists | Partnership | Category-specific verified lists |

### 3.3 Pipeline

```
Sourcing request posted
         │
         ▼
Prospecting Agent:
  → Pulls hard filter criteria from sourcing request
    (category, geography, certifications, MOQ range)
  → Queries public data sources for matching companies
  → Deduplicates against existing registered suppliers
  → Scores candidates by profile completeness potential
  → Generates personalized invitation email per candidate:
    "A [buyer_industry] procurement team is looking for [product].
     They posted a sourcing request matching your profile. Join free."
         │
         ▼
Email sent via SendGrid
Unclaimed profile created (placeholder) if company not yet in DB
Click-through lands on claim-your-profile flow
```

### 3.4 Guardrails

- Maximum 3 invitation emails per supplier domain per 30 days
- Only sends to publicly listed business contact emails (not scraped personal emails)
- Unsubscribe honored immediately
- CAN-SPAM and GDPR compliant

---

## 4. Business Intelligence Agent

### 4.1 Purpose

After a user completes their profile, and then weekly thereafter, the Business Intelligence Agent generates an **Intelligence Brief** — a private, personalized report covering profile gaps, category benchmarks, and strategic recommendations. For suppliers this includes an export market entry plan; for buyers, a sourcing diversification strategy.

### 4.2 Intelligence Brief — Supplier Output

```json
{
  "profile_health": {
    "completeness": 72,
    "top_gaps": [
      "Ideal customer description is under 50 words — add detail to improve match quality",
      "No certifications uploaded — RoHS and ISO 9001 are required by 68% of buyers in your category"
    ]
  },
  "category_benchmarks": {
    "your_moq": 1000,
    "category_average_moq": 500,
    "note": "Your MOQ is 2x the category average. Consider adding a trial order tier."
  },
  "certification_roi": [
    { "certification": "RoHS", "additional_matches": 340 },
    { "certification": "CE", "additional_matches": 210 }
  ],
  "growth_strategy": {
    "recommended_markets": ["United States", "Germany", "Australia"],
    "rationale": "...",
    "suggested_buyer_types": ["OEM Manufacturer", "Distributor"],
    "next_certification_to_pursue": "ISO 14001"
  }
}
```

### 4.3 Intelligence Brief — Buyer Output

```json
{
  "sourcing_request_health": {
    "completeness": 58,
    "top_gaps": [
      "Ideal supplier description is vague — specify preferred production region and audit requirements",
      "No certification requirements listed — adding ISO 9001 would narrow to higher-quality suppliers"
    ]
  },
  "market_intelligence": {
    "category": "Korean hot sauce",
    "average_moq": "400 cases/month",
    "average_lead_time": "28 days",
    "top_supplier_countries": ["South Korea", "China", "Vietnam"],
    "common_certifications": ["FSSC 22000", "HACCP", "FDA registration"]
  },
  "diversification_strategy": {
    "current_single_supplier_risk": "high",
    "recommended_backup_regions": ["Vietnam", "Thailand"],
    "rationale": "..."
  }
}
```

### 4.4 Claude Prompt Structure

The agent uses a structured prompt with:
- User's full profile data (supplier or buyer)
- Anonymized category benchmarks from platform data
- A request for both diagnostic findings and forward-looking recommendations

---

## 5. Negotiation Coach Agent

### 5.1 Purpose

During the quote and counter-offer stage, the Negotiation Coach gives each party **private, non-shared** coaching. Neither party sees the other's coaching. This shortens the counter-offer loop, reduces dead deals from price miscommunication, and keeps both parties on-platform.

### 5.2 Inputs

- Current deal context (product, quantity, stage)
- The submitted quote or counter-offer
- Anonymized platform benchmarks for this category:
  - Typical acceptance range (% variance from buyer's target price)
  - Average number of counter-offer rounds before acceptance
  - Average lead time flexibility in this category

### 5.3 Output Examples

**Supplier coaching (after submitting quote):**
> "Buyers in this category typically accept quotes within 8–12% of their target price. Your quote is 18% above the range where most deals in this category close. Consider reducing your unit price or offering a graduated volume discount. Buyers in this category also frequently ask about a trial order at a lower MOQ — proactively offering one can unlock deals that would otherwise stall."

**Buyer coaching (after receiving quote):**
> "This supplier's lead time of 35 days is 7 days above the category average but within normal range. Suppliers in this category typically have 10–15 days of flexibility when asked. Payment terms are your strongest negotiating lever — offering TT in advance instead of Net 30 often unlocks a 3–5% discount in this category."

### 5.4 Privacy Guarantee

The Negotiation Coach output is:
- Stored per-user, not per-deal (inaccessible to the other party)
- Never included in deal audit logs
- Clearly labeled "Private to you" in the UI
- Not used in matching or scoring

---

## 6. AEO Agent (Answer Engine Optimization)

### 6.1 Purpose

The AEO Agent ensures every Gracera supplier profile page is structured to be **cited by AI assistants** (ChatGPT, Perplexity, Google AI Overviews, Claude) when buyers ask sourcing questions. It runs on profile verification and on a nightly cron for all active profiles.

### 6.2 What It Generates

For each verified supplier profile, the agent generates:

1. **Q&A schema pairs** — factual, specific, AI-citable:
   ```json
   { "question": "What is the minimum order quantity for Acme PCB?",
     "answer": "Acme PCB Assembly has a minimum order quantity of 500 units per run." }
   { "question": "Is Acme PCB ISO 9001 certified?",
     "answer": "Yes. Acme PCB holds ISO 9001:2015 certification issued by TÜV Rheinland, valid through 2027." }
   { "question": "Does Acme PCB ship to North America?",
     "answer": "Yes. Acme PCB ships to the United States, Canada, and Mexico via FOB Shenzhen." }
   ```

2. **Profile summary paragraph** — one factual paragraph for AI citation:
   > "Acme PCB Assembly is a Shenzhen-based manufacturer of PCB assemblies and electronic enclosures. MOQ: 500 units. ISO 9001:2015 and RoHS certified. Lead time: 28 days. Accepts OEM and private label orders. Ships to North America and Europe. Annual capacity: 2M units."

3. **JSON-LD structured data blocks** — `FAQPage`, `Product`, `Organization`, `BreadcrumbList` — injected into the page's `<head>`

### 6.3 Quality Rules

- No marketing language ("high quality", "competitive prices") — factual data only
- Every claim must be sourced from the verified profile (hallucination prevention)
- Q&A pairs are regenerated when profile data changes
- Minimum specificity threshold: if a field is missing, the Q&A for that field is omitted rather than estimated

---

## 7. AI-Brain Agent (Business Advisor)

### 7.1 Purpose

The AI-Brain is a persistent, conversational AI advisor available to every Pro and Enterprise user. Unlike the Business Intelligence Agent (periodic cron-based briefings) and Negotiation Coach (triggered per deal), the AI-Brain is always-on and user-initiated — a natural-language interface the user can query at any time about their business on the platform.

It synthesizes context across the user's full profile, match history, active deals, deal history, and category benchmarks into a single coherent advisor. The existing agents are event-triggered outputs; the AI-Brain is the conversational layer that ties them together.

### 7.2 Context Assembled Per Session

| Context Block | Source | Cached? |
|--------------|--------|---------|
| User profile (supplier and/or buyer) | profiles DB | Yes — cached per session |
| Match history (last 90 days, accepted/rejected with reasons) | matches table | Yes — refreshed daily |
| Active deals summary (stage, last activity, outstanding actions) | deals table | No — fetched live |
| Deal history summary (win rate, avg deal size, cycle time) | deals aggregate | Yes — refreshed daily |
| Category benchmarks (MOQ averages, price ranges, deal velocity) | anonymized platform data | Yes — refreshed weekly |
| Upcoming certification expiries | certifications table | Yes — refreshed daily |
| Trade policy alerts (user's active categories + country pairs) | alerts feed | No — fetched live |

### 7.3 Example Queries

**Supplier:**
- *"Why am I not getting matched with buyers in Germany?"* → cross-references profile geography settings, missing EU certifications, language flags, and German buyer concentration in the category
- *"What should I prioritize to double my matches this month?"* → ranks profile gaps by expected match lift
- *"How does my pricing compare to others in my category?"* → pulls category benchmark data

**Buyer:**
- *"Should I accept this counter-offer from ShinwaChem?"* → pulls deal context, category price benchmarks, supplier deal history, and provides coaching
- *"I need a backup supplier for this category — what should I look for?"* → sourcing diversification advice using category benchmark data
- *"How long does it typically take to close a deal in this category?"* → category deal velocity benchmarks

### 7.4 How It Differs From Existing Agents

| | Business Intelligence Agent | Negotiation Coach | AI-Brain |
|-|----------------------------|-------------------|---------|
| Trigger | Weekly cron / profile save | Quote submitted | User-initiated, always-on |
| Interface | Structured brief (read-only) | Per-deal coaching card | Conversational chat |
| Scope | Profile + category benchmarks | Single deal | All profile + all deals + benchmarks |
| Memory | Stateless per run | Stateless per run | Session history; full context synthesized |

The Business Intelligence Agent and Negotiation Coach continue to run independently. Their outputs are available as context the AI-Brain can reference when the user asks about a specific brief or deal.

### 7.5 Claude API Integration

```python
import anthropic

client = anthropic.Anthropic()

BRAIN_SYSTEM = """
You are the Gracera Business Advisor — a private AI advisor for {user_name}.
You have full context of their business on the Gracera marketplace.

Profile context:
{profile_context}

Match history summary:
{match_summary}

Active deals:
{active_deals}

Category benchmarks:
{benchmarks}

Upcoming certification expiries:
{cert_expiries}

Rules:
- Speak as a trusted advisor, not a search engine. Give direct recommendations.
- Base every claim on the provided context. Do not hallucinate benchmarks or data.
- Never reveal another user's private data. Benchmarks are always anonymized aggregates.
- Respond in {language}.
"""

def ai_brain_chat(user_context: dict, conversation_history: list, user_message: str) -> str:
    messages = conversation_history + [{"role": "user", "content": user_message}]
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=BRAIN_SYSTEM.format(**user_context),
        messages=messages,
    )
    return response.content[0].text
```

**Prompt caching:** The `BRAIN_SYSTEM` block (profile, match summary, benchmarks) is stable within a session and cached using Anthropic prompt caching — only the conversation turns incur per-token cost on each message.

### 7.6 Privacy & Cost Controls

- Context is assembled per-user; no other user's private data is ever included
- Benchmarks are anonymized aggregates — no individual competitor deal data is exposed
- Conversation history stored encrypted; users can clear it at any time
- Available on **Pro and Enterprise tiers only**
- Long sessions are summarized before continuing to bound token usage

### 7.7 AI Growth Advisor Mode

A structured mode within the AI-Brain that generates a personalized, prioritized AI adoption roadmap for each business. Unlike the open-ended conversational interface, the AI Growth Advisor is goal-directed: it starts with a short intake assessment, then produces a domain-by-domain action plan grounded in the user's actual Gracera data — deal outcomes, match patterns, certification gaps, and category benchmarks.

**The core differentiation:** Generic AI advice ("use ChatGPT for marketing") is available anywhere. Gracera's advice is grounded in data no external consultant has — why this specific business is losing deals, which certifications unlock which buyer segments in their category, where their pricing and lead time sits vs. competitors, and which markets have growing demand for their exact product.

#### Intake Assessment

Triggered on first use and refreshed annually. 10 questions covering:

| # | Question | Purpose |
|---|---------|---------|
| 1 | Current AI tools in use | Calibrate maturity baseline |
| 2 | Biggest business pain point | Focus roadmap on highest-leverage domain |
| 3 | Primary target markets (geography + buyer type) | Localize recommendations |
| 4 | Top goal this year | Rank actions by alignment to goal |
| 5 | Current sales and marketing channels | Identify gaps vs. what's working in their category |
| 6 | Self-reported quote win rate | Cross-reference against platform deal data |
| 7 | Biggest bottleneck in the sales process | Finding leads / Qualifying / Pricing / Negotiation / Follow-up |
| 8 | Main source of competitive differentiation | Price / Quality / Certifications / Speed / Customization |
| 9 | Team size | Scale recommendations to operational capacity |
| 10 | Willingness to adopt new tools | Low / Medium / High — filters tool recommendations |

#### Four-Domain Roadmap

Each domain produces 2–3 actions ranked by expected impact. Every action includes a specific AI tool recommendation and an expected outcome grounded in platform data.

**Domain 1 — Marketing & Visibility**
- Profile AEO optimization: restructure profile text so AI assistants (Perplexity, Google AI Overviews) cite the supplier when buyers ask sourcing questions in their category
- Content localization: which languages to translate product content into, based on where buyer demand for their category is growing
- Programmatic SEO alignment: ensure profile data is complete enough to feed Gracera's combination pages for their top category + country + certification combination

**Domain 2 — Sales & Customer Reach**
- Buyer segment prioritization: which buyer types and geographies have the highest acceptance rates for this supplier's profile characteristics
- Certification ROI: ranked list of certifications by expected match lift, drawn from platform benchmark data
- Market expansion: which new geographies show growing demand for their product category, based on sourcing request trends

**Domain 3 — Operations & Delivery**
- Quote response time: comparison vs. category average; faster response correlates with higher acceptance rates
- AI tool recommendations for operational friction: auto-translation of incoming RFQs, AI-assisted quote generation, availability status automation
- Capacity signaling: how to use `availability_status` to boost recency score during peak demand periods

**Domain 4 — Product & Service Development**
- MOQ and lead time gaps: where this supplier's terms diverge from what buyers in their category are requesting
- Certification gaps: certifications required by buyers they're currently not matching with
- Emerging buyer requirements: new filters and requirements appearing in sourcing requests in their category over the last 90 days

#### Roadmap Output Format

```json
{
  "business_context": {
    "category": "Food Ingredients",
    "primary_market": "South Korea → United States",
    "ai_maturity": "basic",
    "top_pain_point": "finding_customers",
    "top_goal": "new_market_entry"
  },
  "roadmap": {
    "marketing": [
      {
        "priority": 1,
        "action": "Add FSSC 22000 prominently to your profile headline and all product descriptions",
        "why": "68% of US food buyers filter for FSSC 22000 — you hold this cert but it is not featured in your profile text",
        "tool": "Gracera profile editor",
        "impact": "Estimated +47 additional US buyer matches",
        "effort": "low"
      }
    ],
    "sales": [],
    "operations": [],
    "product": []
  },
  "next_review": "2026-09-25"
}
```

#### Update Triggers

The roadmap is regenerated when:
- Quarterly review cycle completes
- A material profile change occurs (new certification, new product line, new geography)
- A significant deal rejection pattern emerges (same reason 3+ times in 30 days)
- The user marks an action as completed — the next-priority action is surfaced
- New category benchmark data changes the relative ranking of recommendations

---

## 8. Agent Limitations (v1)

- Matching Agent does not browse the web or access external databases
- All scoring is based on user-provided profile data only
- Agents do not initiate contact on behalf of users — they surface introductions; users decide
- Negotiation Coach is advisory only; it does not send messages or make commitments
- Prospecting Agent sends invitations to publicly listed business emails only
- Real-time matching (< 5 seconds) is targeted for Phase 2; Phase 1 uses batch (daily digest)

---

[Back to README](../README.md)
