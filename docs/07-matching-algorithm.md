# Matching Algorithm

This document describes how Gracera's two-sided matching works end-to-end, from candidate retrieval through final ranking and deduplication.

---

## 1. Overview

Matching runs in two stages:

1. **Pre-filter (Elasticsearch):** Fast, rule-based hard filtering to reduce the candidate pool to a manageable size
2. **Semantic scoring (Claude AI):** LLM-based deep evaluation of each candidate pair

This two-stage design keeps costs and latency in check: Elasticsearch narrows thousands of profiles to ~50–200 candidates, which the AI then scores precisely.

---

## 2. Stage 1 — Pre-filter (Elasticsearch)

### Hard Filters (must pass all)

| Filter | Supplier→Buyer | Buyer→Supplier |
|--------|---------------|----------------|
| Category overlap | Supplier category ∩ buyer sourcing category ≠ ∅ | Same |
| Geography | Supplier target_geographies ∩ buyer country/region | Buyer preferred_supplier_countries ∩ supplier country |
| Excluded countries | Not in buyer's `excluded_supplier_countries` | Not excluded by buyer policy |
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

Elasticsearch returns candidates sorted by soft-filter boost score. Top 200 (configurable) pass to Stage 2.

---

## 3. Stage 2 — Semantic Scoring (Claude AI)

For each candidate pair, the AI agent evaluates 6 dimensions and produces:
- Dimension scores (0–100 each)
- Overall compatibility score (0–100)
- Match summary (2–3 sentences, shown to user)

See [AI Agent Design](04-ai-agent-design.md) for the full prompt spec and scoring dimension weights.

---

## 4. Final Score Composition

The final match score used for ranking combines Stage 1 and Stage 2 signals:

```
final_score =
    (semantic_score       × 0.60)
  + (profile_completeness × 0.15)   # both profiles' average completeness
  + (activity_recency     × 0.10)   # days since last profile update (decays)
  + (verification_bonus   × 0.15)   # based on verification level of both parties
```

**Verification bonus values:**

| Level | Points |
|-------|--------|
| Basic | 0 |
| Verified Business | 5 |
| Certified | 10 |
| Premium | 15 |

Points from both parties are averaged.

---

## 5. Ranking & Shortlist

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

## 6. Match Freshness & Re-Matching

| Trigger | Re-match behavior |
|---------|------------------|
| Profile published (first time) | Full match run immediately |
| Profile updated (material change) | Full match run within 15 minutes |
| Profile updated (minor edit) | Batch re-match within 24 hours |
| Sourcing request opened | Full match run immediately |
| Sourcing request updated | Re-match within 15 minutes |
| Daily batch | Re-score all active pairs where either party updated in last 7 days |

**Material change** = any change to: category, geography, MOQ, certifications, ideal customer description, or sourcing description.

---

## 7. Feedback Signals

User feedback adjusts per-user match weighting over time:

| Action | Signal | Effect |
|--------|--------|--------|
| Accept introduction | Strong positive | Upweight similar profile characteristics for this user |
| Reject — "wrong category" | Negative — category | Strengthen category hard filter for this user |
| Reject — "wrong volume" | Negative — scale | Strengthen MOQ/volume filter for this user |
| Reject — "already know them" | Neutral | Suppress this pair; no weight change |
| Deal closed | Very strong positive | Upweight all characteristics of this pair |
| Report as spam | Very strong negative | Lower match score of reported profile platform-wide |

Feedback is stored per-user and used as a re-weighting layer on top of the base algorithm.

---

## 8. Cold Start Problem

New users with sparse profiles get a reduced match quality. Gracera mitigates this by:

1. **Onboarding wizard:** Step-by-step guide that pushes users to fill high-impact fields before publishing
2. **Category-based fallback:** If semantic data is thin, fall back to category+geography matches only
3. **Nudge notifications:** "Your profile is 45% complete. Add your ideal customer description to unlock better matches."

---

[Back to README](../README.md)
