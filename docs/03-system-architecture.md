# System Architecture

---

## 1. Architecture Overview

Gracera is a web-based B2B trade intelligence platform with a multi-tier architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│   Web App (React / Next.js)   |   Mobile Web (responsive)       │
│   Public SEO Pages            |   Free Sourcing Query Tool      │
└───────────────────┬─────────────────────────────────────────────┘
                    │ HTTPS / REST
┌───────────────────▼─────────────────────────────────────────────┐
│                      API Gateway (Node.js)                      │
│   Auth  |  Rate Limiting  |  Request Routing  |  Versioning     │
└──────┬──────────┬──────────────────┬───────────────────┬────────┘
       │          │                  │                   │
┌──────▼──┐  ┌────▼────┐  ┌─────────▼──────┐   ┌───────▼───────┐
│ User    │  │ Profile │  │  Search &      │   │  AI Agent     │
│ Service │  │ Service │  │  Discovery Svc │   │  Cluster      │
└──────┬──┘  └────┬────┘  └─────────┬──────┘   └───────┬───────┘
       │          │                  │                   │
┌──────▼──────────▼──────────────────▼───────────────────▼───────┐
│                        Data Layer                               │
│  PostgreSQL (profiles, users, deals, matches)                   │
│  pgvector extension (vector embeddings — HNSW index)           │
│  Elasticsearch (full-text search, faceted filters)             │
│  Redis (session cache, real-time match queue)                  │
│  Oracle Cloud Object Storage (S3-compatible API; managed)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js (React) | SSR for SEO, shared component library, programmatic page generation |
| API Gateway | Node.js + Express | TypeScript, matches frontend; shared types across stack |
| Profile Service | Node.js / Python | RAG ingestion pipeline, AI field extraction |
| Search Service | Elasticsearch | Rich faceted search, multi-language tokenizers |
| Vector Search | pgvector (PostgreSQL extension) | Semantic similarity via HNSW index; runs inside the existing Postgres instance on a dedicated read replica — no separate service |
| AI Matching Agent | Python + Claude API (Anthropic) | LLM-based matching, rationale generation, coaching |
| RAG Engine | LangChain + Claude API | Document ingestion, embedding, retrieval-augmented profile generation |
| Primary DB | PostgreSQL | Relational — users, deals, profiles, matches |
| Cache | Redis | Session store, match queue, FX rate cache, real-time events |
| Object Storage | Oracle Cloud Object Storage | Certifications, product images, deal docs, uploaded catalogs; S3-compatible API (same SDKs as AWS S3) — Always Free 20 GB; no self-hosted service required |
| Email | SendGrid | Transactional email, match digest, supplier invitations |
| Auth | JWT (jose) + OAuth2 | 15-min access tokens, 30-day refresh, Google/LinkedIn SSO |
| Hosting | Coolify on Oracle Cloud Free Tier (A1 ARM — 4 OCPU, 24 GB RAM) | Always Free compute; Coolify manages deployments, Traefik reverse proxy, and SSL; expand to paid OCI regions for multi-region latency targets |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## 3. Key Services

### 3.1 User Service
- Registration, login, session management
- Role management: Supplier, Buyer, Both, Admin
- Business verification (email, business registration number)
- MFA (TOTP), account lockout, session invalidation on password change

### 3.2 Profile Service
- Supplier profile CRUD (see [Supplier Profile Spec](05-supplier-profile-spec.md))
- Buyer profile / sourcing request CRUD (see [Buyer Profile Spec](06-buyer-profile-spec.md))
- **RAG Auto-Population:** Accepts uploaded files (PDF catalogs, brochures, price sheets). Extracts structured fields (categories, MOQ, certifications, target markets) using Claude API and populates profile fields automatically
- Profile completeness scoring (drives match quality)
- Versioning and change history

### 3.3 Search & Discovery Service
- Elasticsearch index for supplier and buyer profiles
- Full-text search with language-aware tokenization
- Faceted filtering: category, geography, certifications, MOQ, HS code, incoterms, etc.
- **Programmatic SEO pages:** Auto-generated public pages (e.g. "Korean food ingredient suppliers — FDA certified") with schema.org Q&A, Product, and Business structured data, optimized for both traditional search and AI assistant citation (AEO)
- **Free Sourcing Query Tool:** Public-facing no-login interface powered by the matching API; contact-gated to drive account creation

### 3.4 AI Agent Cluster
Five distinct agents, each with a specific responsibility. See [AI Agent Design](04-ai-agent-design.md) for full spec.

| Agent | Trigger | Output |
|-------|---------|--------|
| **Matching Agent** | Profile publish/update, new sourcing request | Ranked match list with rationale |
| **Prospecting Agent** | Buyer posts sourcing request | Off-platform supplier candidates for outbound invitation |
| **Business Intelligence Agent** | Profile saved, weekly cron | Insights brief, benchmarks, growth strategy |
| **Negotiation Coach Agent** | Quote submitted or countered | Private coaching for each deal party |
| **AEO Agent** | Profile verified, schema cron | Q&A schema markup, factual profile summary for AI citation |
| **AI-Brain Agent** | User-initiated (always-on chat) | Conversational business advice synthesized across profile, deals, matches, and category benchmarks |

### 3.5 RAG Engine
- Document ingestion: PDF, CSV, DOCX, images (OCR), plain text
- Embedding generation using Claude API (or OpenAI `text-embedding-3-large`)
- Vector storage in pgvector — `vector(1536)` column on `supplier_profiles` and `sourcing_requests`; HNSW index built on first write, incrementally updated
- Retrieval pipeline: query → pgvector cosine similarity search → context assembly → Claude generation
- Used by: Profile auto-population, Business Intelligence Agent, Sourcing Query Tool

### 3.6 Messaging Service
- Secure in-platform inbox between matched parties
- Thread management per deal
- File attachment support
- Real-time delivery via WebSocket

### 3.7 Deal Service
- Sample Order Fast Track: lightweight path for sample requests (no RFQ/quote required)
- RFQ creation with category templates (20+ verticals)
- Quote builder with line items and counter-offer loops
- Deal Room: shared thread, document store, milestone checklist
- AI Negotiation Coach integration (private, not shared between parties)
- Deal state machine (see [Deal Workflow](08-deal-workflow.md))

### 3.8 Partner Integration Service
- Trade Finance Referral: post-deal API handoff to factoring partner
- Gracera Verified Logistics: real-time freight quote API from partner forwarders
- ERP Integrations: REST API for Coupa, Odoo, and SAP Ariba (Phase 4)
- Social OAuth: LinkedIn, trade association SSO for social proof signals

### 3.9 Subscription & Billing Service
- Tiered plans (Free / Pro / Enterprise)
- Online payment (Stripe) and offline payment (wire transfer, admin confirmation queue)
- PDF invoice generation
- Subscription renewal, downgrade/upgrade flows

---

## 4. Data Flow — AI Match Trigger

```
Supplier publishes / updates profile
         │
         ▼
Profile Service saves profile → publishes event to Redis stream
         │
         ▼
Matching Agent consumes event
  → Reads supplier profile from DB
  → Queries Elasticsearch for candidate buyer profiles (hard filters)
  → Queries pgvector (read replica) for semantically similar buyers (vector supplement)
  → Calls Claude API: score and rank candidates across 6 dimensions
  → Generates match rationale per pair (in buyer's preferred language)
         │
         ▼
Results written to matches table in PostgreSQL
         │
         ▼
Notification Service reads new matches
  → Sends in-app notification
  → Sends email digest (daily or real-time, per user prefs)
```

## 4b. Data Flow — RAG Profile Auto-Population

```
Supplier uploads catalog PDF (or brochure, price sheet)
         │
         ▼
Profile Service → Oracle Cloud Object Storage → RAG Engine ingestion queue
         │
         ▼
RAG Engine:
  → OCR if image-based
  → Chunking and embedding
  → Retrieval: "What are the product categories, MOQ, certifications?"
  → Claude API generates structured field extraction
         │
         ▼
Extracted fields pre-fill the supplier profile form
  → Supplier reviews and confirms (not auto-saved without review)
  → Completeness score updated
```

## 4c. Data Flow — Buyer-Led Supplier Invitation

```
Buyer posts sourcing request
         │
         ▼
Prospecting Agent runs:
  → Pulls candidate suppliers from: Elasticsearch (on-platform), public trade directories (off-platform)
  → Filters for category, geography, certification match
  → Ranks by match potential
         │
         ▼
For off-platform candidates:
  → Generates personalized invitation email:
    "A [industry] procurement team is sourcing [product]. An RFQ may be waiting."
  → Email sent; click creates unclaimed profile or registration flow
```

---

## 5. Security Architecture

- All traffic over TLS 1.3
- JWT-based auth with short expiry + refresh tokens
- Row-level security in PostgreSQL (tenantId isolation)
- Profile contact details hidden until both parties accept introduction
- Buyer price targets encrypted at rest; never exposed via API
- Field-level AES-256-GCM encryption for sensitive fields
- See [Security & Trust](12-security-and-trust.md)

---

## 6. SEO & AEO Architecture

- **Programmatic SEO:** 50,000+ public pages across a three-tier URL taxonomy (category hub → country spoke → certification leaf). Next.js ISR — pages are statically served and revalidated on profile change events, not on a fixed interval. See [Go-to-Market §4.1](14-go-to-market.md) for full URL structure, page template, generation thresholds, and unclaimed placeholder behavior.
- **Schema.org markup:** Every combination page and supplier profile includes JSON-LD for `ItemList`, `Organization`, `FAQPage`, `BreadcrumbList`, and `Dataset` (aggregate stats on hub pages). MOQs, certifications, lead times, and HS codes are in both structured data and visible prose — readable by all crawlers.
- **AEO Agent:** Runs on profile verification; generates factual Q&A pairs and a one-paragraph profile summary. Kept factually specific ("MOQ: 500 units. ISO 9001 since 2018.") — no marketing language. Q&A pairs are injected as `FAQPage` JSON-LD into each supplier's public profile page.
- **No login wall on public pages:** All public supplier pages, combination pages, and community forum threads are fully accessible without authentication — AI training pipelines, Perplexity, and Google crawlers see the full content.
- **Sitemap & indexing:** Dynamic sitemap refreshed daily with `lastmod` timestamps; submitted to Google Search Console and Bing Webmaster Tools. Combinations below the generation threshold are `noindex`-tagged until they meet the ≥3 verified supplier threshold.
- **Content freshness:** Profile update timestamps surfaced in structured data; ISR revalidation on material profile change ensures AI systems always see current data.

---

## 7. Scalability Considerations

- Profile Service and AI Agents are stateless → horizontal scaling
- Elasticsearch cluster scales read replicas for search load
- Redis stream for AI match jobs enables backpressure and retry
- pgvector runs on a **dedicated PostgreSQL read replica** to isolate HNSW index memory pressure from the transactional write DB. At 100K × 1536-dim vectors, the HNSW index consumes ~7.5GB RAM — sized separately from the primary instance. If vector search latency degrades beyond acceptable thresholds at 1M+ profiles, the migration path to a dedicated vector DB (Pinecone) is straightforward: same embedding model, same query interface concept.
- Phase 1–3: single Oracle Cloud Free Tier A1 instance (4 OCPU, 24 GB RAM) is sufficient for early-stage load; scale vertically to paid OCI compute as traffic grows
- Multi-region deployments (US + Asia-Pacific, < 200ms p95) via additional OCI regions in Phase 4+

---

[Back to README](../README.md)
