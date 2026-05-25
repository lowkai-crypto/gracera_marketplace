# System Architecture

---

## 1. Architecture Overview

Gracera is a web-based B2B marketplace with a multi-tier architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│   Web App (React / Next.js)   |   Mobile Web (responsive)       │
└───────────────────┬─────────────────────────────────────────────┘
                    │ HTTPS / REST + WebSocket
┌───────────────────▼─────────────────────────────────────────────┐
│                      API Gateway (Node.js / FastAPI)            │
│   Auth  |  Rate Limiting  |  Request Routing  |  Versioning     │
└──────┬──────────┬──────────────────┬───────────────────┬────────┘
       │          │                  │                   │
┌──────▼──┐  ┌────▼────┐  ┌─────────▼──────┐   ┌───────▼───────┐
│ User    │  │ Profile │  │  Search &      │   │  AI Matching  │
│ Service │  │ Service │  │  Discovery Svc │   │  Agent        │
└──────┬──┘  └────┬────┘  └─────────┬──────┘   └───────┬───────┘
       │          │                  │                   │
┌──────▼──────────▼──────────────────▼───────────────────▼───────┐
│                        Data Layer                               │
│  PostgreSQL (profiles, users, deals)                            │
│  Elasticsearch (full-text search, faceted filters)             │
│  Redis (session cache, real-time match queue)                  │
│  Object Storage / S3 (documents, images)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js (React) | SSR for SEO, shared component library |
| API Gateway | Node.js + Express or FastAPI (Python) | TBD based on team preference |
| Profile Service | Python / FastAPI | Heavy data processing, AI pipeline integration |
| Search Service | Elasticsearch | Rich faceted search, multi-language tokenizers |
| AI Agent | Python + Claude API (Anthropic) | LLM-based matching, rationale generation |
| Primary DB | PostgreSQL | Relational — users, deals, profiles |
| Cache | Redis | Session store, match queue, real-time events |
| Object Storage | AWS S3 (or compatible) | Certifications, product images, deal docs |
| Email | SendGrid | Transactional email, match digest |
| Auth | Auth0 or Supabase Auth | OAuth2, JWT, SSO support |
| Hosting | AWS / GCP | Multi-region for international latency |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## 3. Key Services

### 3.1 User Service
- Registration, login, and session management
- Role management: Supplier, Buyer, Admin
- Business verification (email + business registration)
- Account settings and notification preferences

### 3.2 Profile Service
- Supplier profile CRUD (see [Supplier Profile Spec](05-supplier-profile-spec.md))
- Buyer profile / sourcing request CRUD (see [Buyer Profile Spec](06-buyer-profile-spec.md))
- Profile completeness scoring (drives match quality)
- Versioning and change history

### 3.3 Search & Discovery Service
- Elasticsearch index for supplier and buyer profiles
- Full-text search with language-aware tokenization
- Faceted filtering: category, geography, certifications, MOQ, etc.
- Keyword suggestion and autocomplete

### 3.4 AI Matching Agent
- Triggered by: profile publish, profile update, new sourcing request
- Reads structured profile data from Profile Service
- Calls Claude API to generate semantic match scores and rationale
- Writes ranked match results to Redis queue; consumed by notification service
- See [AI Agent Design](04-ai-agent-design.md) for full spec

### 3.5 Messaging Service
- Secure in-platform inbox between matched parties
- Thread management per match introduction
- File attachment support (docs, samples, specs)
- Real-time delivery via WebSocket

### 3.6 Deal Service
- RFQ creation and response tracking
- Quote builder with line items and terms
- Deal room: shared thread, status, and document store
- Deal stage state machine (see [Deal Workflow](08-deal-workflow.md))

---

## 4. Data Flow — AI Match Trigger

```
Supplier publishes profile
         │
         ▼
Profile Service saves profile → publishes event to Redis stream
         │
         ▼
AI Matching Agent consumes event
  → Reads supplier profile from DB
  → Queries Elasticsearch for candidate buyer profiles
  → Calls Claude API: score and rank candidates
  → Generates match rationale per pair
         │
         ▼
Results written to match_results table in PostgreSQL
         │
         ▼
Notification Service reads new matches
  → Sends in-app notification to supplier ("3 new buyer matches")
  → Sends email digest (daily or real-time, per user prefs)
```

---

## 5. Security Architecture

- All traffic over TLS 1.3
- JWT-based auth with short expiry + refresh tokens
- Row-level security in PostgreSQL (users only see their own data by default)
- Profile contact details hidden until both parties accept introduction
- See [Security & Trust](12-security-and-trust.md)

---

## 6. Scalability Considerations

- Profile Service and AI Agent are stateless → horizontal scaling
- Elasticsearch cluster scales read replicas for search load
- Redis stream for AI match jobs enables backpressure and retry
- Multi-region deployments for US and Asia-Pacific latency targets (< 200ms p95)

---

[Back to README](../README.md)
