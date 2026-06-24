# Matching Algorithm

This document describes how Gracera's two-sided matching works end-to-end, from candidate retrieval through final ranking and deduplication.

---

## 1. Overview

Matching runs in three stages:

1. **Pre-filter (Elasticsearch):** Fast, rule-based hard filtering to reduce the candidate pool
2. **Vector supplement (Pinecone / Weaviate):** Semantic similarity to surface non-obvious matches Elasticsearch misses
3. **Semantic scoring (Claude AI):** LLM-based deep evaluation of each candidate pair

This three-stage design keeps costs and latency in check: Elasticsearch narrows thousands of profiles to ~200 candidates, vector search adds up to 50 more semantically similar candidates, and Claude scores all candidates precisely.

---

## 2. Stage 1 — Pre-filter (Elasticsearch)

### Hard Filters (must pass all)

| Filter | Supplier→Buyer | Buyer→Supplier |
|--------|---------------|----------------|
| Category overlap | Supplier category ∩ buyer sourcing category ≠ ∅ | Same |
| Geography | Supplier target_geographies ∩ buyer country/region | Buyer preferred_supplier_countries ∩ supplier country |
| Excluded countries | Not in buyer's `excluded_supplier_countries` | Not excluded by buyer policy |
| Sanctioned pairs | Not a blocked country pair (OFAC, EU, UN) | Same |
| Active status | Buyer sourcing request status = Open | Supplier profile status = Active |
| MOQ range | Buyer estimated volume ≥ supplier MOQ (with 20% buffer) | Same |

Any candidate failing a hard filter is excluded from AI scoring entirely.

### Soft Filters (boost, not exclude)

| Boost | Effect |
|-------|--------|
| Certification overlap | Each matching certification adds to candidate ranking score |
| Language overlap | Shared languages boost score |
| Deal type preference match | Both prefer same deal structure |
| Incoterm compatibility | Preferred incoterms overlap |
| HS code match | Buyer knows HS code and supplier's product line matches |
| Availability match | Supplier `availability_status = Available` and buyer `deal_timeline` is within 60 days |

Elasticsearch returns candidates sorted by soft-filter boost score. Top 200 (configurable) pass to Stage 1b.

---

## 2b. Stage 1b — Vector Supplement (Pinecone / Weaviate)

For each trigger profile, a vector embedding is generated from the `ideal_customer_description` (supplier) or `ideal_supplier_description` (buyer). This embedding is queried against the vector index of all active profiles on the opposite side.

**Why this stage matters:** Elasticsearch uses keyword and filter logic. It will not match a supplier who describes their product as "precision die-cast aluminum enclosures" with a buyer sourcing "custom metal housings for industrial electronics" — even though these are the same thing. Vector similarity catches this semantic overlap.

The vector search returns up to 50 additional candidates not already in the Elasticsearch set. Both sets are merged (deduped) before passing to Stage 2.

**Embedding model:** Claude API embeddings or OpenAI `text-embedding-3-large`. Profile embeddings are pre-computed and stored; re-computed on profile update.

---

## 3. Stage 2 — Semantic Scoring (Claude AI)

For each candidate pair (up to 250 combined from Stage 1 + 1b), the AI agent evaluates 6 dimensions and produces:
- Dimension scores (0–100 each)
- Overall compatibility score (0–100)
- Match summary (2–3 sentences, shown to user in their preferred language)

See [AI Agent Design](04-ai-agent-design.md) §2 for the full prompt spec, Claude API integration, and scoring dimension weights.

---

## 4. Final Score Composition

The final match score combines Stage 2 and profile-level signals:

```
final_score =
    (semantic_score            × 0.55)
  + (profile_completeness      × 0.15)   # both profiles' average completeness
  + (verification_bonus        × 0.15)   # based on verification level of both parties
  + (activity_recency          × 0.10)   # recency score including social proof signals
  + (feedback_adjustment       × 0.05)   # per-user learned weight adjustment
```

**Verification bonus values:**

| Level | Points |
|-------|--------|
| Basic | 0 |
| Verified Business | 5 |
| Certified | 10 |
| Premium (KYB) | 15 |

Points from both parties are averaged.

**Activity recency inputs:**
- Days since last profile update (decays logarithmically)
- Social proof signals: LinkedIn/trade social activity (new certification post, product launch)
- Platform engagement: logins, message response rate, deal progress
- Supplier broadcast campaign posted in last 30 days
- `availability_status` updated to "Available" within last 7 days (+2 points)

**Feedback adjustment:** Per-user weight modifier learned from accept/reject history. Starts neutral (0); positive or negative adjustments accumulate per category dimension over time. Bounded to ±10 points.

---

## 5. Downstream Customer Segmentation Layer

Buyers who have defined **downstream customer segments** (who they're ultimately buying for) receive a second-order matching pass. After the primary final score is computed, an additional compatibility check evaluates whether the supplier's stated target customer types align with the buyer's downstream customer profile.

Example: A food distributor whose end customers are health-conscious millennials will have this context factored in when matching with food ingredient suppliers — suppliers with organic, clean-label, or non-GMO positioning receive a small boost even if their primary category match is equivalent to a conventional supplier.

This adjustment is a modifier of up to ±8 points on the final score, applied only when downstream segment data is available for the buyer.

---

## 6. Ranking & Shortlist

After scoring, results are:
1. Sorted descending by `final_score`
2. Deduplicated (remove pairs already introduced, messaged, or rejected)
3. Suppressed if either party has blocked the other
4. Capped at **top 10 matches** surfaced per user per matching run

### Score Thresholds → Quality Labels

| Score | Label | Shown to user as |
|-------|-------|-----------------|
| 80–100 | Strong Match | Green indicator |
| 60–79 | Good Match | Blue indicator |
| 40–59 | Potential Match | Grey indicator |
| < 40 | Not surfaced | Filtered out |

---

## 7. Match Freshness & Re-Matching

| Trigger | Re-match behavior |
|---------|------------------|
| Profile published (first time) | Full match run immediately |
| Profile updated (material change) | Full match run within 15 minutes |
| Profile updated (minor edit) | Batch re-match within 24 hours |
| Sourcing request opened | Full match run immediately |
| Sourcing request updated | Re-match within 15 minutes |
| Social proof signal received | Recency score updated; re-rank within 1 hour |
| Daily batch | Re-score all active pairs where either party updated in last 7 days |

**Material change** = any change to: category, geography, MOQ, certifications, ideal customer description, sourcing description, or downstream customer segments.

---

## 8. Feedback Signals

User feedback adjusts per-user match weighting over time:

| Action | Signal | Effect |
|--------|--------|--------|
| Accept introduction | Strong positive | Upweight similar profile characteristics for this user |
| Reject — "wrong category" | Negative — category | Strengthen category hard filter for this user |
| Reject — "wrong volume" | Negative — scale | Strengthen MOQ/volume filter for this user |
| Reject — "already know them" | Neutral | Suppress this pair; no weight change |
| Deal closed | Very strong positive | Upweight all characteristics of this pair |
| Report as spam | Very strong negative | Lower match score of reported profile platform-wide |
| Negotiation Coach used | Weak positive signal | Indicates intent to engage; minor boost to this pair |

Feedback is stored per-user and used as a re-weighting layer on top of the base algorithm.

---

## 9. Cold Start Problem

New users with sparse profiles get reduced match quality. Gracera mitigates this by:

1. **RAG auto-population:** Catalog/brochure upload during onboarding dramatically reduces cold-start sparsity — a supplier who uploads a product catalog on day one has a 70%+ complete profile before touching a form field
2. **Onboarding wizard:** Step-by-step guide pushes users to fill high-impact fields before publishing
3. **Category-based fallback:** If semantic data is thin, fall back to category + geography matches only
4. **Nudge notifications with benchmarks:** "Your profile is 45% complete. Adding your ideal customer description would unlock ~180 additional matches in your category."

---

[Back to README](../README.md)
