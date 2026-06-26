# Tech Stack & Development Setup

Reference for engineers setting up a local environment and understanding how the services fit together. For architecture diagrams and design rationale, see [docs/03-system-architecture.md](03-system-architecture.md).

---

## 1. Tech Stack Reference

| Layer | Technology | Version target | Notes |
|-------|-----------|---------------|-------|
| Frontend & API | Next.js (React) | 14.x (App Router) | SSR, ISR, API routes, shared types |
| API gateway logic | Next.js API routes + Express middleware | — | Auth, rate limiting, request routing |
| AI / RAG service | Python | 3.11+ | Separate service; handles Claude API calls, LangChain, embeddings |
| Primary database | PostgreSQL | 16.x | Profiles, users, deals, matches |
| Vector search | pgvector extension | 0.7.x | `vector(1536)` columns, HNSW index |
| Full-text search | Elasticsearch | 8.x | Multi-language tokenisation (CJK, Arabic) |
| Cache / queues | Redis | 7.x | Sessions, match job queue (Redis Streams), FX rate cache |
| Object storage | Oracle Cloud Object Storage (prod) / MinIO (local) | — | S3-compatible API; same SDK for both |
| AI inference | Claude API (Anthropic) | claude-sonnet-4-6 | Matching, RAG, AI-Brain, coaching cards |
| Embeddings | Claude API / `text-embedding-3-large` | — | 1536-dim vectors |
| Email | SendGrid | — | Transactional; match digest; supplier invitations |
| Auth | JWT (`jose`) + OAuth2 | — | 15-min access tokens, 30-day refresh; Google + LinkedIn SSO |
| E-signature | DocuSign / HelloSign | — | Phase 3; deal contracts |
| Third-party inspection | QIMA API | — | Phase 3; bookable from Deal Room |
| Payments | Stripe (online) + manual wire queue | — | Phase 5 |
| Hosting (prod) | Oracle Cloud Free Tier — A1 ARM (4 OCPU, 24 GB RAM) | — | Always Free compute |
| Deployment | Coolify | — | Self-hosted on OCI; manages containers, Traefik, SSL |
| Reverse proxy | Traefik | — | Managed by Coolify |
| CI/CD | GitHub Actions | — | PR checks, staging deploy, nightly test suite |
| Language (frontend/backend) | TypeScript | 5.x | Strict mode; shared types between Next.js and Express |
| Language (AI service) | Python | 3.11+ | FastAPI for HTTP; LangChain for RAG pipeline |
| Package manager (JS) | pnpm | 8.x | Workspace monorepo |
| Package manager (Python) | uv | — | Fast; `pyproject.toml` |
| Containerisation | Docker + Docker Compose | — | Local dev and CI |

---

## 2. Repository Structure

```
gracera_marketplace/
  apps/
    web/                  # Next.js app (frontend + API routes)
    ai-service/           # Python FastAPI service (AI agents, RAG engine)
  packages/
    db/                   # Shared DB client, migrations (Drizzle ORM)
    types/                # Shared TypeScript types across apps
    config/               # Shared ESLint, Prettier, TypeScript configs
  docs/                   # Product and architecture specs (01–19)
  scripts/                # Seed scripts, migration runners, one-off tools
  docker/
    docker-compose.yml    # Local dev: Postgres, pgvector, Elasticsearch, Redis, MinIO
    docker-compose.ci.yml # CI overrides (no volume mounts, faster startup)
  .github/
    workflows/
      ci.yml              # PR checks
      deploy-staging.yml  # On merge to main
      nightly.yml         # Nightly test suite
```

> **Note:** This repository is currently docs-only. The directory structure above is the target layout for when development begins.

---

## 3. Prerequisites

Install these before running anything:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.x LTS | [nvm](https://github.com/nvm-sh/nvm): `nvm install 20` |
| pnpm | 8.x | `npm install -g pnpm@8` |
| Python | 3.11+ | [pyenv](https://github.com/pyenv/pyenv): `pyenv install 3.11` |
| uv | latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Docker Desktop | latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Git | 2.x | Pre-installed on macOS; `brew install git` |
| Playwright browsers | — | Installed during setup (see §6) |

**macOS-specific:** Install Xcode Command Line Tools if you haven't already:
```bash
xcode-select --install
```

---

## 4. Initial Setup

### 4.1 Clone and install dependencies

```bash
git clone https://github.com/lowkai-crypto/gracera_marketplace.git
cd gracera_marketplace

# Install all JS/TS dependencies (all workspaces)
pnpm install

# Install Python dependencies for the AI service
cd apps/ai-service
uv sync
cd ../..
```

### 4.2 Start local infrastructure (Docker)

```bash
# Start Postgres + pgvector, Elasticsearch, Redis, MinIO
docker compose -f docker/docker-compose.yml up -d

# Verify all containers are healthy
docker compose -f docker/docker-compose.yml ps
```

Expected output — all services should show `healthy`:

```
NAME                    STATUS          PORTS
gracera-postgres        healthy         0.0.0.0:5432->5432/tcp
gracera-elasticsearch   healthy         0.0.0.0:9200->9200/tcp
gracera-redis           healthy         0.0.0.0:6379->6379/tcp
gracera-minio           healthy         0.0.0.0:9000->9000/tcp
                                        0.0.0.0:9001->9001/tcp (console)
```

### 4.3 Environment variables

Copy the example env file and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/ai-service/.env.example apps/ai-service/.env
```

See §5 for the full variable reference.

### 4.4 Database setup

```bash
# Run migrations (creates all tables, indexes, pgvector extension)
pnpm --filter db migrate

# Seed development data (use cases from docs/17 — see §7)
pnpm --filter db seed:dev
```

### 4.5 Elasticsearch index setup

```bash
# Create index mappings and configure language analysers
pnpm --filter web run es:setup
```

### 4.6 Install Playwright browsers

```bash
pnpm --filter web run playwright install --with-deps
```

---

## 5. Environment Variables

### `apps/web/.env.local`

```bash
# ── Database ──────────────────────────────────────────────────────
DATABASE_URL=postgresql://gracera:gracera@localhost:5432/gracera_dev
DATABASE_URL_REPLICA=postgresql://gracera:gracera@localhost:5433/gracera_dev
# Read replica port 5433 is a second Postgres container in docker-compose
# In production this is the pgvector-dedicated read replica on OCI

# ── Redis ─────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Elasticsearch ─────────────────────────────────────────────────
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_SUPPLIERS=suppliers_dev
ELASTICSEARCH_INDEX_BUYERS=buyers_dev

# ── Object Storage ────────────────────────────────────────────────
# Local dev: MinIO (S3-compatible, same SDK as Oracle Cloud Object Storage)
OBJECT_STORAGE_ENDPOINT=http://localhost:9000
OBJECT_STORAGE_ACCESS_KEY=minioadmin
OBJECT_STORAGE_SECRET_KEY=minioadmin
OBJECT_STORAGE_BUCKET=gracera-dev
OBJECT_STORAGE_REGION=us-east-1           # Placeholder for MinIO; use ap-singapore-1 in prod

# ── AI Service (internal) ─────────────────────────────────────────
AI_SERVICE_URL=http://localhost:8000       # FastAPI service
AI_SERVICE_SECRET=dev-internal-secret     # Shared secret for internal calls

# ── Auth ──────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=dev-access-secret-change-in-prod
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-prod
NEXTAUTH_SECRET=dev-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# ── OAuth ─────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# ── Email ─────────────────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@gracera.com
# Leave blank in local dev to print emails to console instead of sending

# ── Feature flags ─────────────────────────────────────────────────
GRACERA_ENV=development                   # development | ci | staging | production
NEXT_PUBLIC_GRACERA_ENV=development

# ── Misc ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `apps/ai-service/.env`

```bash
# ── Anthropic ─────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_EMBEDDING_MODEL=text-embedding-3-large   # OpenAI fallback if needed

# ── OpenAI (embeddings fallback) ─────────────────────────────────
OPENAI_API_KEY=sk-xxx                     # Optional; only needed if using OpenAI embeddings

# ── Database (AI service reads profiles for matching) ─────────────
DATABASE_URL=postgresql://gracera:gracera@localhost:5432/gracera_dev
DATABASE_URL_REPLICA=postgresql://gracera:gracera@localhost:5433/gracera_dev

# ── Redis ─────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Object Storage (reads uploaded catalogs for RAG) ──────────────
OBJECT_STORAGE_ENDPOINT=http://localhost:9000
OBJECT_STORAGE_ACCESS_KEY=minioadmin
OBJECT_STORAGE_SECRET_KEY=minioadmin
OBJECT_STORAGE_BUCKET=gracera-dev

# ── Internal ──────────────────────────────────────────────────────
AI_SERVICE_SECRET=dev-internal-secret
AI_SERVICE_PORT=8000
GRACERA_ENV=development
```

### Getting API keys for local development

| Service | How to get a key | Notes |
|---------|-----------------|-------|
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | Required for matching, RAG, AI-Brain |
| Google OAuth | [console.cloud.google.com](https://console.cloud.google.com) — OAuth 2.0 credentials | Authorized redirect: `http://localhost:3000/api/auth/callback/google` |
| LinkedIn OAuth | [linkedin.com/developers](https://www.linkedin.com/developers/) | Authorized redirect: `http://localhost:3000/api/auth/callback/linkedin` |
| SendGrid | [app.sendgrid.com](https://app.sendgrid.com) | Optional for local dev — leave blank to print emails to console |
| OpenAI | [platform.openai.com](https://platform.openai.com) | Optional; only if using OpenAI for embeddings |

---

## 6. Running the Application

### Start all services

```bash
# Terminal 1 — Next.js web app
pnpm --filter web dev
# → http://localhost:3000

# Terminal 2 — Python AI service
cd apps/ai-service
uv run uvicorn main:app --reload --port 8000
# → http://localhost:8000
# → API docs at http://localhost:8000/docs
```

### Or use the combined dev script

```bash
# Starts both Next.js and the Python AI service via concurrently
pnpm dev
```

### Verify everything is running

```bash
# Next.js health check
curl http://localhost:3000/api/health

# AI service health check
curl http://localhost:8000/health

# Elasticsearch
curl http://localhost:9200/_cluster/health

# MinIO console
open http://localhost:9001
# Login: minioadmin / minioadmin
```

---

## 7. Database: Migrations & Seeds

Gracera uses **Drizzle ORM** for schema management. Migrations live in `packages/db/migrations/`.

### Common commands

```bash
# Generate a new migration from schema changes
pnpm --filter db generate

# Apply all pending migrations
pnpm --filter db migrate

# Push schema changes directly to DB (dev only — bypasses migration history)
pnpm --filter db push

# Open Drizzle Studio (visual DB browser)
pnpm --filter db studio
# → http://localhost:4983

# Seed development data (all 12 use case fixtures from docs/17)
pnpm --filter db seed:dev

# Seed a specific use case fixture only
pnpm --filter db seed:fixture --fixture=f01-supplier

# Reset database (drop all tables, re-migrate, re-seed)
pnpm --filter db reset
```

### Seed data

`seed:dev` creates deterministic fixture data for all 12 use cases:

| Fixture | What it creates |
|---------|----------------|
| `f01-supplier` | Kim Ji-won's Jangdok Foods supplier profile (Food, KR) |
| `f02-buyer` | Marcus Webb's Lone Star Specialty Foods buyer + sourcing request (Food, US) |
| `e01-supplier` | Xincheng Electronics supplier profile (Electronics, CN) |
| `e02-buyer` | Steuerwerk GmbH buyer + sourcing request (Electronics, DE) |
| `a01-supplier` | EcoThread Garments supplier profile (Apparel, BD) |
| `a02-buyer` | Verdant Studio buyer + sourcing request (Apparel, GB) |
| `i01-supplier` | Precision One Metalworks supplier profile (Industrial, TW) |
| `i02-buyer` | Kowalski Industrial Systems buyer + sourcing request (Industrial, CA) |
| `h01-supplier` | Lumos Cosmetics supplier profile (Health & Beauty, KR) |
| `h02-buyer` | Pur Ritual buyer + sourcing request (Health & Beauty, FR) |
| `c01-supplier` | Chemova Industries supplier profile (Chemicals, IN) |
| `c02-buyer` | BioClean Solutions buyer + sourcing request (Chemicals, NL) |

Seed data is idempotent — running `seed:dev` twice is safe.

### Writing a migration

```bash
# 1. Edit the schema in packages/db/schema.ts
# 2. Generate the migration file
pnpm --filter db generate

# 3. Review the generated SQL in packages/db/migrations/
# 4. Apply it
pnpm --filter db migrate

# 5. Commit both schema.ts and the migration file together
git add packages/db/schema.ts packages/db/migrations/
git commit -m "Add <field> to <table>"
```

**Never** edit an existing migration file after it has been applied. Create a new migration instead.

---

## 8. Elasticsearch

### Local setup

Elasticsearch runs in Docker (`docker-compose.yml`). The setup script creates all index mappings:

```bash
pnpm --filter web run es:setup
```

This creates two indices:
- `suppliers_dev` — supplier profiles with language-aware text fields (English, CJK, Arabic analysers)
- `buyers_dev` — buyer profiles and sourcing requests

### Re-index from scratch

If the index gets out of sync with the database:

```bash
# Drop and re-create indices, then re-index all profiles from PostgreSQL
pnpm --filter web run es:reindex
```

### Useful Elasticsearch queries during development

```bash
# Check supplier index health
curl "http://localhost:9200/suppliers_dev/_count"

# Search with a test query
curl -X POST "http://localhost:9200/suppliers_dev/_search" \
  -H "Content-Type: application/json" \
  -d '{"query": {"match": {"categories": "sauces"}}}'

# View index mapping
curl "http://localhost:9200/suppliers_dev/_mapping"
```

---

## 9. pgvector

pgvector is installed as a PostgreSQL extension. The Docker image (`pgvector/pgvector:pg16`) includes it.

The migration that enables it:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This runs automatically when you apply migrations (`pnpm --filter db migrate`).

### Key schema details

```sql
-- HNSW index on supplier embeddings (created by migration)
CREATE INDEX ON supplier_profiles
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Cosine similarity query (used by matching engine)
SELECT id, (embedding <=> $1) AS distance
FROM supplier_profiles
WHERE profile_status = 'active'
ORDER BY embedding <=> $1
LIMIT 50;
```

### Generating embeddings locally

The AI service generates embeddings when a profile is published. In local dev, this calls the real Claude API (or OpenAI), so you need a valid `ANTHROPIC_API_KEY`.

To generate embeddings for all seeded fixtures:

```bash
cd apps/ai-service
uv run python scripts/embed_fixtures.py
```

---

## 10. Object Storage (MinIO locally / Oracle Cloud in production)

The app uses the AWS S3 SDK for all object storage operations — it works identically against MinIO (local) and Oracle Cloud Object Storage (production) because OCI supports the S3-compatible API.

### Local MinIO setup

MinIO starts automatically with `docker compose up`. Access the console at [http://localhost:9001](http://localhost:9001) (minioadmin / minioadmin).

The seed script creates the `gracera-dev` bucket automatically. To create it manually:

```bash
# Using the MinIO CLI (mc)
docker exec gracera-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec gracera-minio mc mb local/gracera-dev
```

### Storage structure

```
gracera-dev/
  catalogs/           # Uploaded supplier catalogs (input to RAG pipeline)
  certs/              # Uploaded certification PDFs
  product-images/     # Supplier product line images
  logos/              # Company logos and cover images
  deal-docs/          # Deal Room attachments
  invoices/           # Generated subscription invoices
```

### Switching to Oracle Cloud Object Storage in production

No code changes needed — only env var changes:

```bash
# Production .env
OBJECT_STORAGE_ENDPOINT=https://<namespace>.compat.objectstorage.<region>.oraclecloud.com
OBJECT_STORAGE_ACCESS_KEY=<OCI access key>
OBJECT_STORAGE_SECRET_KEY=<OCI secret key>
OBJECT_STORAGE_BUCKET=gracera-prod
OBJECT_STORAGE_REGION=ap-singapore-1
```

---

## 11. Running Tests

Full documentation in [docs/18-qa-test-plan.md](18-qa-test-plan.md). Quick reference:

```bash
# Unit tests
pnpm test:unit

# Integration tests (requires Docker services running)
pnpm test:integration

# E2E tests — all specs (CI suite, excludes @nightly)
pnpm test:e2e

# E2E tests — single spec file
pnpm --filter web exec playwright test tests/e2e/specs/food/uc-f01-supplier.spec.ts

# E2E tests — nightly suite (includes 1h SLA tests — slow)
pnpm test:e2e:nightly

# All tests (unit + integration + E2E)
pnpm test

# Watch mode (unit tests only)
pnpm test:unit --watch

# Show Playwright test report
pnpm --filter web exec playwright show-report
```

### Seeding the test database

Integration and E2E tests use a separate `gracera_test` database. It is seeded automatically before each test run:

```bash
# Manually reset and re-seed the test DB
DATABASE_URL=postgresql://gracera:gracera@localhost:5432/gracera_test \
  pnpm --filter db reset
```

---

## 12. Deployment (Coolify on Oracle Cloud)

### Infrastructure overview

```
Oracle Cloud Free Tier — A1 ARM instance (4 OCPU, 24 GB RAM)
  └── Coolify (self-hosted)
        ├── Next.js app (Docker container)
        ├── Python AI service (Docker container)
        ├── PostgreSQL 16 + pgvector (managed by Coolify)
        ├── Elasticsearch 8 (Docker container)
        ├── Redis 7 (Docker container)
        └── Traefik (reverse proxy + SSL — managed by Coolify)

Oracle Cloud Object Storage (separate managed service)
  └── S3-compatible API; Always Free 20 GB
```

### First-time server setup

1. **Provision the OCI A1 instance** via OCI Console (Always Free tier)
2. **Install Coolify** on the instance:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. **Open Coolify dashboard** at `http://<instance-ip>:8000`
4. **Add your GitHub repository** as a source in Coolify
5. **Create applications** in Coolify (one per service: Next.js, AI service)
6. **Set environment variables** in Coolify per service (same variables as §5, with production values)
7. **Configure Traefik domains** in Coolify — assign `gracera.com` to the Next.js app, `api.gracera.com/ai` to the AI service

### Deploying

Deployment is automatic on merge to `main` via GitHub Actions:

```yaml
# .github/workflows/deploy-staging.yml (abbreviated)
- name: Trigger Coolify deploy
  run: |
    curl -X POST "${{ secrets.COOLIFY_WEBHOOK_URL }}" \
      -H "Authorization: Bearer ${{ secrets.COOLIFY_API_KEY }}"
```

To manually trigger a deploy from the CLI:

```bash
# Trigger via Coolify API
curl -X POST "https://<coolify-host>/api/v1/deploy" \
  -H "Authorization: Bearer <coolify-api-key>" \
  -d '{"uuid": "<app-uuid>"}'
```

### Database migrations in production

Migrations run automatically as part of the deployment pipeline:

```yaml
# In the Coolify post-deploy hook (set in Coolify UI)
pnpm --filter db migrate
```

Never run `pnpm --filter db reset` against production.

### SSL certificates

Coolify + Traefik manage SSL automatically via Let's Encrypt. No manual certificate management needed.

---

## 13. Docker Compose Reference

### `docker/docker-compose.yml` (local dev)

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: gracera-postgres
    environment:
      POSTGRES_USER: gracera
      POSTGRES_PASSWORD: gracera
      POSTGRES_DB: gracera_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gracera"]
      interval: 5s
      timeout: 5s
      retries: 5

  postgres-replica:
    image: pgvector/pgvector:pg16
    container_name: gracera-postgres-replica
    environment:
      POSTGRES_USER: gracera
      POSTGRES_PASSWORD: gracera
      POSTGRES_DB: gracera_dev
    ports:
      - "5433:5432"
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
    # Simulates the pgvector read replica used in production
    # In local dev this is just a second Postgres instance (no replication)

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.0
    container_name: gracera-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -s http://localhost:9200/_cluster/health | grep -q '\"status\":\"green\"\\|\"status\":\"yellow\"'"]
      interval: 10s
      timeout: 10s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: gracera-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: gracera-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  postgres_replica_data:
  es_data:
  minio_data:
```

---

## 14. Common Development Tasks

### Add a new database field

```bash
# 1. Edit packages/db/schema.ts
# 2. Generate migration
pnpm --filter db generate
# 3. Apply
pnpm --filter db migrate
# 4. Update any affected TypeScript types in packages/types/
# 5. Update the relevant spec doc (docs/05, 06, or 09)
```

### Add a new API endpoint

```bash
# Create the route handler
touch apps/web/app/api/<resource>/route.ts

# Write an integration test immediately
touch tests/integration/<resource>.test.ts
```

### Add a new Playwright spec

```bash
# Follow the naming convention from docs/18
touch tests/e2e/specs/<vertical>/uc-<id>-<role>.spec.ts

# Run it in headed mode to watch
pnpm --filter web exec playwright test \
  tests/e2e/specs/<vertical>/uc-<id>-<role>.spec.ts \
  --headed
```

### Add a new Elasticsearch field

```bash
# 1. Update the index mapping in apps/web/src/lib/elasticsearch/mappings.ts
# 2. Run setup (updates mapping on existing index)
pnpm --filter web run es:setup
# 3. Re-index if the field needs to be populated from existing data
pnpm --filter web run es:reindex
```

### Trigger the matching engine locally

```bash
# Trigger a match run for a specific supplier profile
curl -X POST http://localhost:8000/match/supplier \
  -H "Content-Type: application/json" \
  -H "X-Internal-Secret: dev-internal-secret" \
  -d '{"supplier_profile_id": "<uuid>"}'

# Trigger a match run for a specific sourcing request
curl -X POST http://localhost:8000/match/buyer \
  -H "Content-Type: application/json" \
  -H "X-Internal-Secret: dev-internal-secret" \
  -d '{"sourcing_request_id": "<uuid>"}'
```

### Trigger a background job manually

```bash
# Cert expiry check
curl -X POST http://localhost:3000/api/test/jobs/cert-expiry \
  -H "X-Test-Secret: dev-internal-secret"

# Availability auto-reset
curl -X POST http://localhost:3000/api/test/jobs/availability-reset \
  -H "X-Test-Secret: dev-internal-secret"
```

These endpoints are only available when `GRACERA_ENV=development` or `GRACERA_ENV=ci`.

### Inspect the Redis match queue

```bash
docker exec -it gracera-redis redis-cli

# List all streams
KEYS *

# Inspect the match job stream
XRANGE match:jobs - + COUNT 10

# Check queue length
XLEN match:jobs
```

---

## 15. Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| `pnpm install` fails | Node version mismatch | Run `nvm use 20` |
| Postgres connection refused | Docker not running | `docker compose -f docker/docker-compose.yml up -d` |
| `pgvector extension not found` | Wrong Postgres image | Ensure image is `pgvector/pgvector:pg16`, not plain `postgres:16` |
| Elasticsearch returns 503 | Still starting up | Wait 30s after `docker compose up`; ES is slow to start |
| Elasticsearch `max virtual memory areas` error | Linux kernel limit | `sudo sysctl -w vm.max_map_count=262144` |
| MinIO bucket not found | Seed script not run | `pnpm --filter db seed:dev` creates the bucket |
| Matching engine returns 0 results | Embeddings not generated | Run `embed_fixtures.py`; check `ANTHROPIC_API_KEY` is set |
| Playwright test fails on `data-testid` not found | UI element missing testid | Add `data-testid` attribute to the component |
| RAG pipeline returns empty fields | Catalog PDF is image-based (scanned) | RAG includes OCR; check AI service logs for OCR errors |
| `JWT_ACCESS_SECRET` error on login | Env var not set | Confirm `.env.local` exists and has the variable |
| OAuth redirect_uri mismatch | Callback URL misconfigured | Add `http://localhost:3000/api/auth/callback/google` to your Google OAuth app |

---

## 16. Resource Consumption on Oracle Cloud Free Tier

The Always Free A1 instance (4 OCPU, 24 GB RAM) runs all production services. Approximate allocation:

| Service | OCPU | RAM |
|---------|------|-----|
| Next.js app | 0.5 | 1 GB |
| Python AI service | 1.0 | 2 GB |
| PostgreSQL (primary) | 0.5 | 4 GB |
| PostgreSQL (pgvector replica) | 0.5 | 8 GB (HNSW index) |
| Elasticsearch | 1.0 | 6 GB |
| Redis | 0.25 | 1 GB |
| Coolify + Traefik | 0.25 | 1 GB |
| **Total** | **4.0** | **23 GB** |

This is tight at 100K profiles — the HNSW index grows with profile count. Monitoring:
- Memory pressure on the pgvector replica is the first bottleneck
- Elasticsearch heap (`ES_JAVA_OPTS`) tuned at 6 GB; adjust if OOM errors appear
- At Phase 3+ scale (100K+ profiles), evaluate moving to a paid OCI compute shape or migrating pgvector to a dedicated vector DB (Pinecone)

---

[Back to README](../README.md)
