# Operations Runbook

On-call playbook, incident response procedures, SLAs by subscription tier, escalation paths, monitoring setup, and deployment procedures for the Gracera platform.

---

## 1. On-Call Structure

### Phase 1–2 (Lean Team)

During early phases, the founding team carries on-call responsibilities:

| Role | Responsibility | Contact |
|------|--------------|---------|
| Primary on-call | First responder for all severity 1–2 incidents | Rotating weekly between engineers |
| Secondary on-call | Backup if primary is unreachable; also handles trust/safety escalations | |

On-call rotation managed via a shared calendar. PagerDuty (or equivalent) configured for alerting.

### Phase 3+ (Growing Team)

Separate on-call rotations for:
- **Platform on-call** (infrastructure, API, matching engine)
- **Trust & Safety on-call** (dispute escalations, fraud alerts, account suspensions)

---

## 2. Monitoring & Alerting

### 2.1 Metrics Stack

| Layer | Tool | What it watches |
|-------|------|----------------|
| Infrastructure | OCI Monitoring | CPU, RAM, disk I/O on the A1 instance |
| Application | Sentry | Error rates, unhandled exceptions (Next.js + Python AI service) |
| Uptime | Better Uptime (or UptimeRobot) | Health check endpoints every 60 seconds |
| Database | pg_stat_activity (Postgres) | Long-running queries, connection pool saturation |
| AI service | Custom metrics endpoint | Match queue depth, inference latency, token usage |
| Email | SendGrid Activity Feed | Bounce rate, delivery rate, spam complaints |
| Logs | Loki + Grafana (Phase 2) | Structured log aggregation |

### 2.2 Health Check Endpoints

| Endpoint | Service | Expected response |
|----------|---------|------------------|
| `GET /api/health` | Next.js | `{"status": "ok", "db": "ok", "redis": "ok", "es": "ok"}` |
| `GET http://localhost:8000/health` | AI service (FastAPI) | `{"status": "ok", "model": "claude-sonnet-4-6"}` |
| `GET http://localhost:9200/_cluster/health` | Elasticsearch | `{"status": "green"}` or `"yellow"` |

### 2.3 Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| API error rate (5xx) | > 1% over 5 min | > 5% over 5 min | Page primary on-call |
| API p99 latency | > 2s | > 5s | Page primary on-call |
| AI service inference latency | > 5s p99 | > 15s p99 | Page primary on-call |
| Match queue depth (Redis Streams) | > 200 items | > 500 items | Page primary on-call |
| OCI RAM usage | > 80% | > 90% | Page primary on-call; scale or evict |
| Postgres connection pool | > 70% utilized | > 90% utilized | Page primary on-call |
| Elasticsearch health | Yellow | Red | Page primary on-call |
| Uptime check failure | — | 2 consecutive failures | Page primary on-call immediately |
| SendGrid bounce rate | > 3% | > 8% | Alert, investigate suppression list |
| Cert expiry job failure | — | Missed run | Alert trust team |

---

## 3. Incident Response

### 3.1 Severity Levels

| Severity | Definition | Response time | Examples |
|----------|-----------|--------------|---------|
| **S1 — Critical** | Platform down or data breach | < 15 minutes | All users cannot log in; auth bypass; data exposure |
| **S2 — High** | Core feature broken for significant portion of users | < 1 hour | Matching engine down; all emails failing; payment processing broken |
| **S3 — Medium** | Non-critical feature broken or degraded; workaround exists | < 4 hours | Single vertical matching degraded; digest emails delayed; Wire transfer queue not loading |
| **S4 — Low** | Minor UI bug, cosmetic issue, or edge case | < 2 business days | Display formatting error; non-critical data missing |

These levels map to the security incident response levels in [docs/12-security-and-trust.md §8](12-security-and-trust.md).

### 3.2 Incident Response Flow

```
Alert triggered (PagerDuty / monitoring tool)
        │
Primary on-call acknowledges within SLA
        │
        ▼
Assess severity level (S1–S4)
        │
        ├── S1: Declare major incident → create #incident-YYYY-MM-DD in Slack
        │       → Notify secondary on-call + team leads immediately
        │       → Post status page update within 15 minutes
        │
        ▼
Investigate: identify root cause
        │
        ├── Mitigation applied (rollback / feature flag / hotfix)
        │
        ▼
Monitor: confirm issue resolved
        │
        ▼
Incident closed
        │
        ▼
Post-mortem (required for S1 and S2 within 5 business days)
```

### 3.3 Status Page

Gracera maintains a public status page (e.g., `status.gracera.com` via Instatus or BetterStack Status). Updated during all S1 and S2 incidents.

Status components:
- Platform (web app)
- AI Matching Engine
- Messaging
- Email Notifications
- Admin Panel

**Communication cadence during S1:**
- Initial post: within 15 minutes of declaring incident
- Updates: every 30 minutes until resolved
- Resolution post: final status with brief explanation

---

## 4. SLAs by Subscription Tier

### 4.1 Platform Uptime SLA

| Tier | Uptime commitment | Compensation |
|------|------------------|-------------|
| Free | Best effort (no SLA) | None |
| Pro | 99.5% monthly uptime | Pro-rated credit on next invoice |
| Enterprise | 99.9% monthly uptime | Pro-rated credit + priority incident response |

**99.9% uptime = max 43.8 minutes downtime/month.** On Oracle Cloud Free Tier A1, this is achievable with the Coolify-managed container setup and Traefik health checks for automated recovery.

**Measurement:** Uptime measured from the external uptime check endpoint. Scheduled maintenance windows (announced 48 hours in advance) excluded from SLA calculation.

**Credit calculation:** For every 1 hour of unscheduled downtime beyond SLA allowance, credit = 1 day of subscription value. Credits applied to next invoice; not refundable as cash.

### 4.2 Response SLAs for Support Requests

| Tier | First response | Resolution target |
|------|--------------|-----------------|
| Free | 5 business days | Best effort |
| Pro | 1 business day | 3 business days for non-technical; 5 days for technical |
| Enterprise | 4 business hours | 1 business day for non-technical; 2 days for technical |

Support channels:
- **Free/Pro:** Support ticket via `/support` in-app form; email to `support@gracera.com`
- **Enterprise:** All of above + dedicated account manager with direct Slack/email

### 4.3 Feature Response SLAs

| User action | SLA | Tier |
|------------|-----|------|
| First match after profile publish | < 1 hour | All |
| Email verification resend | < 5 minutes | All |
| Wire transfer confirmation | 1 business day | All |
| Business registration verification (manual) | 2 business days | All |
| KYB completion | 5 business days | Enterprise |
| Dispute team response | 5 business days (recommendation) | All |
| White-glove onboarding session booking | 3 business days | Pro/Enterprise |

---

## 5. Deployment Procedures

See also [docs/19-tech-stack-dev-setup.md §12](19-tech-stack-dev-setup.md) for infrastructure overview.

### 5.1 Normal Deployment (Automated)

Merging to `main` triggers the GitHub Actions deploy pipeline:

```yaml
# .github/workflows/deploy-staging.yml
1. Run unit tests
2. Run integration tests (against test DB)
3. Run E2E smoke tests (subset of Playwright specs tagged @smoke)
4. If all pass: trigger Coolify webhook → redeploy Next.js + AI service containers
5. Post-deploy: run migrations (pnpm --filter db migrate)
6. Post-deploy: health check (curl /api/health — expect 200)
7. If health check fails: Coolify auto-rollback to previous container image
```

**Expected deploy time:** 3–5 minutes from merge to live.

### 5.2 Hotfix Deployment (S1/S2)

1. Create a hotfix branch from `main` (not a feature branch)
2. Apply minimal targeted fix
3. Create PR with `[HOTFIX]` prefix in title
4. Single reviewer approval sufficient for S1 (speed > process)
5. Merge to `main` → deploy pipeline runs automatically
6. Verify health check passes
7. Monitor error rates for 15 minutes post-deploy

### 5.3 Rollback

Coolify retains the previous container image. To manually rollback:

```bash
# Via Coolify API — roll back to previous image
curl -X POST "https://<coolify-host>/api/v1/deploy/rollback" \
  -H "Authorization: Bearer <coolify-api-key>" \
  -d '{"uuid": "<app-uuid>"}'
```

Or via Coolify UI: Applications → Select app → Deployments → "Rollback to this version" on the previous successful deployment.

**Database rollback note:** Application rollbacks do not roll back database migrations. If a migration must be reversed, write an explicit down-migration and deploy it separately. Never run `pnpm --filter db reset` against production.

### 5.4 Maintenance Windows

Scheduled maintenance (e.g., major migrations, Elasticsearch re-indexing) follows this process:

1. Post on status page with ≥ 48 hours notice
2. Send email notification to Enterprise users (Pro users get in-app banner)
3. Preferred window: Saturday 10pm–Sunday 2am UTC (lowest traffic)
4. Maximum unannounced maintenance window: 30 minutes (for emergency patches)

---

## 6. Database Operations

### 6.1 Backup Schedule

| Database | Backup frequency | Retention | Backup tool |
|----------|-----------------|---------|------------|
| PostgreSQL (primary) | Every 6 hours | 30 days | `pg_dump` to OCI Object Storage |
| PostgreSQL (pgvector replica) | Daily | 14 days | `pg_dump` |
| Elasticsearch | Daily snapshot | 7 days | Elasticsearch snapshot API to OCI |

Backups are stored in a separate OCI bucket (`gracera-backups`) with versioning enabled.

### 6.2 Restore Procedure (PostgreSQL)

```bash
# 1. Stop the application (prevent new writes)
# → Via Coolify: stop the Next.js and AI service containers

# 2. Download the backup from OCI Object Storage
aws s3 cp s3://gracera-backups/postgres/gracera_YYYY-MM-DD_HH.dump ./restore.dump \
  --endpoint-url https://<namespace>.compat.objectstorage.<region>.oraclecloud.com

# 3. Restore
pg_restore --no-owner --role=gracera -d gracera_prod ./restore.dump

# 4. Restart the application
# → Via Coolify: start containers

# 5. Run any pending migrations
pnpm --filter db migrate

# 6. Verify health check
curl https://gracera.com/api/health
```

### 6.3 Restore Testing

Backup restore is tested **monthly** in a staging environment to verify recoverability. The test result (success/fail, time taken) is logged in the ops notes.

---

## 7. Key Background Jobs

The following background jobs run on schedule and must be monitored:

| Job | Schedule | What it does | Failure impact |
|-----|----------|-------------|---------------|
| `cert-expiry-check` | Daily at 00:00 UTC | Sends cert expiry alerts; marks expired certs | Suppliers miss expiry warnings |
| `availability-reset` | Weekly on Monday 06:00 UTC | Nudges and resets stale availability signals | Stale "Fully Booked" signals degrade match quality |
| `match-digest` | Daily at configured times | Sends daily match digest emails to users | Users miss new matches |
| `subscription-renewal` | Daily at 02:00 UTC | Charges Stripe for renewing subscriptions | Revenue impact; users incorrectly downgraded |
| `wire-transfer-reminder` | Daily at 09:00 UTC | Reminds users with pending wire transfers | Wire transfers age without user action |
| `es-consistency-check` | Weekly Saturday 03:00 UTC | Verifies Elasticsearch index matches PostgreSQL | Silent data divergence in search/matching |
| `sanctions-rescan` | Weekly | Rescans active accounts against updated sanctions lists | Compliance exposure |

**Job failure alerting:** All background jobs emit a success/failure event to the monitoring system on completion. Any failure triggers an alert to the on-call engineer.

---

## 8. Capacity Planning

### 8.1 OCI A1 Resource Limits

See [docs/19-tech-stack-dev-setup.md §16](19-tech-stack-dev-setup.md) for detailed allocation. Summary: the 4 OCPU / 24 GB RAM A1 instance is tight at 100K profiles — the HNSW index for pgvector is the first scaling bottleneck.

**Scaling triggers:**
- pgvector replica RAM > 80% sustained for > 24 hours → evaluate moving to dedicated pgvector DB (Pinecone) or upgrading OCI shape
- Elasticsearch heap OOM errors → increase ES heap allocation (up from 6 GB) or migrate to managed Elasticsearch (Elastic Cloud)
- API p99 latency > 3s sustained → add Next.js horizontal scaling (second container) or add OCI compute

### 8.2 AI Inference Cost Monitoring

Match scoring is the primary AI cost driver. Monthly cost estimate:

| Phase | Daily active users | Matches/day | Est. tokens/match | Monthly AI cost |
|-------|-------------------|------------|------------------|----------------|
| Phase 1 | 500 | 5,000 | 2,000 | ~$300 |
| Phase 2 | 5,000 | 50,000 | 1,500 (caching) | ~$1,500 |
| Phase 3 | 15,000 | 150,000 | 1,200 (caching) | ~$4,000 |

Prompt caching (Phase 2) is expected to reduce token usage per match by ~40% by caching the system prompt and profile context blocks.

Alert if monthly AI spend exceeds 120% of budget → review caching efficiency, consider moving batch (non-real-time) matches for Free tier users to a lighter scoring model.

---

## 9. Security Incident Response

See [docs/12-security-and-trust.md §8](12-security-and-trust.md) for severity levels and response times.

**Data breach protocol:**
1. Isolate affected systems immediately (take the service offline if necessary)
2. Notify `super_admin` and legal counsel within 1 hour
3. Assess scope: how many users affected, what data categories
4. **GDPR breach notification:** If EU user data is involved, notify the lead supervisory authority within **72 hours** of becoming aware of the breach (Article 33 GDPR)
5. **CCPA breach notification:** Notify affected California users "in the most expedient time possible" (no fixed timeline, but typically within 30 days)
6. Notify affected users after regulatory notification is filed
7. Post-mortem and remediation plan within 5 business days

**Security email:** `security@gracera.com` (PGP key published on website; see [docs/12-security-and-trust.md](12-security-and-trust.md)).

---

## 10. Post-Mortem Template

Required for all S1 and S2 incidents. Filed within 5 business days in the internal ops notes:

```
## Incident Post-Mortem — [Title]

**Date:** YYYY-MM-DD
**Severity:** S1 / S2
**Duration:** HH:MM (detection → resolution)
**Affected systems:**
**Impact:** [N] users affected; [describe user-facing impact]

### Timeline
- HH:MM — Alert triggered
- HH:MM — On-call acknowledged
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Incident resolved

### Root Cause

### Contributing Factors

### What Went Well

### What Went Wrong

### Action Items
| Action | Owner | Due |
|--------|-------|-----|
| ...    | ...   | ... |
```

Post-mortems are blameless. The goal is to improve the system, not to assign fault.

---

[Back to README](../README.md)
