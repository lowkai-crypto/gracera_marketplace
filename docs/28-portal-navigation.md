# Portal Navigation (Sidebar Spec)

Defines the dashboard sidebar contents for each account context. Per
[Data Model](09-data-model.md) §3.1, this is **one shell with a top-nav
context switcher** (`[Supplier ▼]` / `[Buyer ▼]`) for dual-role accounts —
not two separate portal codebases. The tables below are "sidebar items
when Supplier context is active" and "sidebar items when Buyer context is
active."

Each item cites the doc section that defines the underlying feature. Build
status is tracked separately in [Roadmap](13-roadmap.md); this doc is IA
only, not a completion record.

---

## Supplier context

| Item | Shows | Spec |
|---|---|---|
| Dashboard | Completeness score, active matches, deals in progress, recent activity | — |
| My Profile | Company, products, certifications, target market — edit + republish | [05](05-supplier-profile-spec.md) |
| Matches | Ranked buyer introductions, score + rationale, accept/reject | [04](04-ai-agent-design.md) §2.3, §2.7 |
| Deals | RFQ → Quote → Deal Room → Closed, per deal; sample requests live here too | [08](08-deal-workflow.md) §1–2, §4 |
| Messages | In-platform inbox, pre-RFQ negotiation | [03](03-system-architecture.md) §3.6 |
| AI-Brain | Conversational advisor + "AI Growth Advisor" roadmap mode | [04](04-ai-agent-design.md) §7, §7.7 |
| Insights | Business Intelligence Brief — profile gaps, category benchmarks, growth strategy | [04](04-ai-agent-design.md) §4.2 |
| Certifications | Upload, track expiry (90/60/30-day alerts), verification status | [05](05-supplier-profile-spec.md) §1.4 |
| Visibility (AEO) | Generated Q&A pairs, factual summary, which AI engines have cited you | [04](04-ai-agent-design.md) §6 |
| Broadcasts | Announce new products/certs — boosts recency score | [04](04-ai-agent-design.md) §2.5 |
| Finance | "Get Paid Now" factoring referral, wire-transfer payment history | [08](08-deal-workflow.md) (Deal Room), [15](15-monetization.md) §4 |
| Reviews | Post-deal reviews, Verified Deal Network | [08](08-deal-workflow.md) §4 Stage 5 |
| Contacts | Additional commercial/technical/finance routing contacts | [05](05-supplier-profile-spec.md) §1.8 |
| Billing | Subscription tier | [15](15-monetization.md) |
| Settings | Account, language, notification prefs | — |

## Buyer context

| Item | Shows | Spec |
|---|---|---|
| Dashboard | Snapshot across all sourcing requests | — |
| My Profile | Buyer company profile | [06](06-buyer-profile-spec.md) §1 |
| Sourcing Requests | Create/manage — the buyer's primary artifact | [06](06-buyer-profile-spec.md) §2 |
| Matches | Ranked suppliers per sourcing request | [04](04-ai-agent-design.md) §2.3 |
| Deals | RFQ/Quote tracking, including side-by-side multi-supplier quote comparison | [08](08-deal-workflow.md) §4 Stage 2 |
| Messages | In-platform inbox | [03](03-system-architecture.md) §3.6 |
| Group Buys | Pooled-MOQ deals — lead vs. co-buyer allocation | [08](08-deal-workflow.md) §3 |
| AI-Brain | "Should I accept this counter-offer?" style advisor | [04](04-ai-agent-design.md) §7.3 |
| Price Compass | Market-rate benchmarks before negotiating | [01](01-product-requirements.md), [15](15-monetization.md) §5 |
| Insights | Sourcing request health, market intel, supplier diversification strategy | [04](04-ai-agent-design.md) §4.3 |
| Logistics | Verified Logistics landed-cost estimates | [08](08-deal-workflow.md) (Deal Room) |
| Payment & Trust | Buyer Protection escrow referral, own payment track record | [06](06-buyer-profile-spec.md) §5, [08](08-deal-workflow.md) (Deal Room) |
| Reviews | Given/received | [08](08-deal-workflow.md) §4 Stage 5 |
| Contacts | Technical/finance routing contacts | [06](06-buyer-profile-spec.md) §1.4 |
| Billing | Subscription tier | [15](15-monetization.md) |
| Settings | Account, language, notification prefs | — |

---

## Not a sidebar item: RAG

RAG isn't its own nav destination — it's the engine behind **My Profile**'s
fill-in paths ("Upload a catalog," "Paste your website") and the public,
no-login Sourcing Query Tool ([03](03-system-architecture.md) §3.3), which
lives outside the portal entirely. Giving it its own slot would send users
looking for a place to "do RAG" that doesn't need to exist.

## Cross-cutting, not in either sidebar

- **Dispute Center** ([08](08-deal-workflow.md) §7) — an action inside a
  specific Deal, not a standalone list, until volume justifies one.
- **Human Translator booking** ([08](08-deal-workflow.md) §10) —
  contextual inside Deal Room/Messages, not a nav item.

---

[Back to README](../README.md)
