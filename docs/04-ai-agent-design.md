# AI Agent Design

The AI Matching Agent is the core differentiator of Gracera. It reads structured profile data from both sides of the marketplace and produces ranked, explained match recommendations.

---

## 1. Agent Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Candidate retrieval** | Pull candidate profiles from Elasticsearch using structured filters |
| **Semantic scoring** | Use Claude LLM to evaluate deep compatibility beyond keyword overlap |
| **Match rationale** | Generate a human-readable explanation of why each match was made |
| **Ranking** | Produce an ordered shortlist for each user |
| **Intent monitoring** | Re-run matching when profile data changes or new signals arrive |

---

## 2. Trigger Events

The AI Agent is invoked by the following events:

| Event | Action |
|-------|--------|
| Supplier publishes / updates profile | Find matching buyers |
| Buyer publishes / updates sourcing request | Find matching suppliers |
| New buyer signs up | Proactively match against existing supplier catalog |
| New supplier signs up | Proactively match against open buyer sourcing requests |
| User explicitly requests a re-match ("Find me new matches") | Re-run matching for that user |

---

## 3. Matching Pipeline

```
Step 1: Pre-filter (Elasticsearch)
  - Hard filters: category match, geography overlap, language
  - Soft filters: MOQ range, lead time, certification requirements
  - Output: candidate set (up to 200 profiles per trigger)

Step 2: Semantic scoring (Claude API)
  - Input: supplier profile + buyer profile (structured JSON)
  - Prompt: asks Claude to evaluate compatibility across 6 dimensions
  - Output: score (0–100) + rationale per dimension

Step 3: Re-ranking
  - Weighted final score combining:
    • Semantic score (60%)
    • Profile completeness bonus (15%)
    • Recency / activity score (10%)
    • Verification bonus (15%)
  - Top 10 matches surfaced per user

Step 4: Deduplication & suppression
  - Remove matches already accepted or rejected by the user
  - Suppress matches the user has already messaged

Step 5: Delivery
  - Write ranked results to match_results table
  - Publish notification event
```

---

## 4. Scoring Dimensions

The Claude prompt evaluates 6 dimensions for each supplier–buyer pair:

| Dimension | What is evaluated | Weight |
|-----------|------------------|--------|
| **Category alignment** | Does the supplier's product/service match the buyer's sourcing category? | 25% |
| **Geography fit** | Can the supplier serve the buyer's required region? | 20% |
| **Scale compatibility** | Does buyer volume match supplier's MOQ and capacity? | 20% |
| **Certification / compliance match** | Does supplier hold certifications the buyer requires? | 15% |
| **Target customer fit** | Does the buyer type match the supplier's stated ideal customer? | 10% |
| **Communication / language** | Can both parties communicate effectively (language, timezone)? | 10% |

---

## 5. Claude API Integration

```python
import anthropic

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
"""

def score_match(supplier: dict, buyer: dict) -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a B2B trade matching expert. Return only valid JSON.",
        messages=[
            {
                "role": "user",
                "content": MATCH_PROMPT.format(
                    supplier_json=json.dumps(supplier, indent=2),
                    buyer_json=json.dumps(buyer, indent=2),
                )
            }
        ]
    )
    return json.loads(response.content[0].text)
```

**Prompt caching:** The supplier profile portion of the prompt is cached using Anthropic's prompt caching feature to reduce latency and cost when scoring the same supplier against many buyers.

---

## 6. Match Rationale — User-Facing Output

Each match card shown to users includes:
- Match score (displayed as a quality indicator: Strong / Good / Potential)
- Summary sentence generated by Claude
- Up to 3 highlighted matching dimensions
- "Why this match?" expandable panel with dimension-level detail

Example match card (supplier view):
```
[Strong Match] Pacific Rim Importers — Seattle, WA
"Pacific Rim is sourcing Korean food ingredients in exactly your volume range
 and holds all the FDA import compliance you already meet. They're actively
 looking for a direct supplier with your product line."

Category: Korean sauces and condiments   Volume: 500–2,000 cases/month
Certifications required: FDA, FSSC 22000 ✓
```

---

## 7. Feedback Loop

User actions feed back into match quality:
- **Accept introduction:** positive signal for this pairing type
- **Reject introduction:** negative signal; flag reason (volume mismatch, wrong category, etc.)
- **Deal closed:** strongest positive signal; both profiles gain credibility score
- **Report as spam/irrelevant:** penalizes profile quality score of the flagged party

Feedback is stored and used to re-weight matching parameters per-user over time.

---

## 8. Agent Limitations (v1)

- Agent does not browse the web or access external databases
- All scoring is based on user-provided profile data only
- Agent does not initiate contact on behalf of users — it surfaces introductions; users decide to connect
- Real-time matching (< 5 seconds) is targeted for Phase 2; Phase 1 uses batch (daily digest)

---

[Back to README](../README.md)
