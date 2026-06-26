# QA Process & Test Plan

This document defines the quality assurance process, testing strategy, and test plan for the Gracera Marketplace. It is written for the engineering team and references the use cases in [docs/17-use-cases.md](17-use-cases.md) as the primary source of test scenarios.

---

## 1. Testing Philosophy

Gracera is a trust-critical platform. A buyer who receives a fraudulent match, a supplier whose certification is incorrectly expired, or a deal that stalls due to a routing bug — these are not just UX problems. They erode the fundamental promise of the platform.

Testing priorities, in order:

1. **Trust & safety flows** — fraud flags, cert verification, dispute resolution, sanctions screening
2. **Core matching pipeline** — the right suppliers surface for the right buyers; filters work correctly
3. **Activation flows** — a new supplier and buyer each reach their first match within SLA
4. **Deal workflow** — RFQ → Quote → Counter → Agreement without data loss or state bugs
5. **AI agent interactions** — AI-Brain responses are contextually accurate; coaching cards surface at the right moments
6. **Everything else** — UI polish, edge case UX, performance under normal load

---

## 2. Testing Pyramid

```
        ┌──────────────┐
        │   E2E (Playwright)   │  ~15% of tests — full user journeys from UC-F01 to UC-C02
        ├──────────────────────┤
        │    Integration        │  ~35% — API contracts, DB state, background jobs
        ├──────────────────────┤
        │      Unit             │  ~50% — pure functions: scoring, matching weights, formatters
        └──────────────────────┘
```

The E2E layer is intentionally smaller than the integration layer. Full browser tests are slow and brittle; they are reserved for the flows that cross multiple services (matching pipeline, deal state machine, cert verification jobs). Business logic that can be tested at the API level should be.

---

## 3. Tools & Frameworks

| Layer | Tool | Purpose |
|-------|------|---------|
| E2E | [Playwright](https://playwright.dev) | Full browser automation; use cases from docs/17 |
| Integration | Jest + Supertest | API contract tests; background job tests |
| Unit | Jest | Pure functions: scoring algorithm, weight calculator, formatters |
| API mocking | [MSW (Mock Service Worker)](https://mswjs.io) | Mock Claude API, TÜV/Bureau Veritas/Control Union APIs in integration tests |
| Visual regression | Playwright screenshots | Match card, coaching card, cert badge rendering |
| Performance | k6 | Matching pipeline SLA; activation SLA under concurrent load |
| Security | OWASP ZAP (baseline scan) | Automated scan on staging before each release |
| Test data | Custom seed scripts (`/scripts/seed-*.ts`) | Deterministic fixtures for each use case |

---

## 4. Test Environments

| Environment | Purpose | Data | Deployed by |
|-------------|---------|------|------------|
| `local` | Developer machine | Seeded fixtures; no real APIs | Developer |
| `ci` | GitHub Actions on every PR | Seeded fixtures; all external APIs mocked | CI pipeline |
| `staging` | Full stack on Oracle Cloud | Anonymised production-like data; real API integrations (except payment) | Coolify on merge to `main` |
| `production` | Live | Real data | Coolify on tagged release |

**API stubs in CI:**
- Claude API → MSW stub returning deterministic match rationale JSON
- TÜV / Bureau Veritas / Control Union cert APIs → VCR cassettes (recorded responses)
- QIMA / SGS inspection booking → MSW stub
- DeepL → MSW stub returning a static translated string

**Never run destructive tests against `production`.** Smoke tests only on production (read-only assertions against known seeded supplier profiles).

---

## 5. Test Coverage by Phase

Phase gating prevents tests for unbuilt features from failing CI. Use the `@skip` convention with a phase comment.

```typescript
// Playwright example
test.skip('AI Price Compass shows market range on quote', async () => {
  // Phase 2
})

// Jest example
it.skip('Broadcast Campaign sends to matched buyer segment', () => {
  // Phase 3
})
```

### Phase 1 — Core (Months 1–4)

Full test coverage required before Phase 1 ships.

| Area | Coverage target |
|------|----------------|
| Registration & email verification | 100% |
| Supplier activation flow (UC-F01, UC-E01, UC-A01, UC-I01, UC-H01, UC-C01) | 100% main flows; ≥ 50% alternate flows |
| Buyer activation flow (UC-F02, UC-E02, UC-A02, UC-I02, UC-H02, UC-C02) | 100% main flows; ≥ 50% alternate flows |
| RAG catalog upload → field pre-fill | 100% |
| Completeness gate (publish blocked < 60%) | 100% |
| Real-time matching (< 60s SLA) | 100% |
| Certification upload and status | 100% |
| Programmatic SEO pages (render, noindex threshold, schema.org) | 100% |
| Basic messaging between matched parties | 100% |
| Subscription tier gates (Free / Pro feature access) | 100% |
| Admin impersonation | 100% |
| Fraud / trust flag submission | 100% |

### Phase 2 — AI Agent MVP (Months 4–7)

| Area | Coverage target |
|------|----------------|
| Real-time matching on profile update | 100% |
| AI match rationale text (non-empty, references cert) | 100% |
| AI Price Compass (market range estimate) | 100% |
| Availability signals and filter | 100% |
| Cert expiry monitoring and buyer notifications | 100% |
| Decision-Maker Coaching Card rendering | 100% |

### Phase 3 — Deal Workflow (Months 7–10)

| Area | Coverage target |
|------|----------------|
| RFQ → Quote → Counter-offer → Agreement | 100% |
| Multi-supplier RFQ | 100% |
| E-signature (DocuSign/HelloSign integration) | 100% |
| Dispute flow (all dispute types) | 100% |
| Third-party inspection booking (QIMA) | 100% |
| Group buying (MOQ pooling) | 100% |
| Repeat order / reorder flow | 100% |

### Phase 4 — International + Ecosystem (Months 10–14)

| Area | Coverage target |
|------|----------------|
| Trade policy alerts (HS chapter monitoring) | 100% |
| ITAR / sanctions screening | 100% |
| Multi-language UI | ≥ 80% (smoke tests per language) |
| HS code search and alignment | 100% |

---

## 6. E2E Test Suite Structure (Playwright)

### Directory layout

```
tests/
  e2e/
    fixtures/
      seed.ts          # Master fixture builder
      food/
        f01-supplier.ts  # Kim Ji-won seed data
        f02-buyer.ts     # Marcus Webb seed data
      electronics/
        e01-supplier.ts
        e02-buyer.ts
      apparel/
        a01-supplier.ts
        a02-buyer.ts
      industrial/
        i01-supplier.ts
        i02-buyer.ts
      health-beauty/
        h01-supplier.ts
        h02-buyer.ts
      chemicals/
        c01-supplier.ts
        c02-buyer.ts
    pages/
      RegistrationPage.ts   # Page Object Models
      ProfileWizardPage.ts
      MatchDashboardPage.ts
      DealRoomPage.ts
      DisputePage.ts
      AdminPage.ts
    specs/
      food/
        uc-f01-supplier.spec.ts
        uc-f02-buyer.spec.ts
        uc-f01-f02-integration.spec.ts  # Cross-party scenarios (CS-*)
      electronics/
        uc-e01-supplier.spec.ts
        uc-e02-buyer.spec.ts
        uc-e01-e02-integration.spec.ts
      apparel/
        uc-a01-supplier.spec.ts
        uc-a02-buyer.spec.ts
        uc-a01-a02-integration.spec.ts
      industrial/
        uc-i01-supplier.spec.ts
        uc-i02-buyer.spec.ts
        uc-i01-i02-integration.spec.ts
      health-beauty/
        uc-h01-supplier.spec.ts
        uc-h02-buyer.spec.ts
        uc-h01-h02-integration.spec.ts
      chemicals/
        uc-c01-supplier.spec.ts
        uc-c02-buyer.spec.ts
        uc-c01-c02-integration.spec.ts
      trust/
        fraud-reporting.spec.ts         # CS-2 in UC-F01
        cert-expiry.spec.ts             # AF-7 in UC-F01, CS-2 in UC-H02
        dispute-resolution.spec.ts      # CS-1 in UC-F02, UC-A02, UC-I01
        subcontracting-discovery.spec.ts  # CS-2 in UC-A01
      admin/
        impersonation.spec.ts
        trust-team-queue.spec.ts
```

### Naming convention

```
uc-{vertical_code}{role}.spec.ts
  vertical_code: f=food, e=electronics, a=apparel, i=industrial, h=health, c=chemicals
  role: 01=supplier, 02=buyer

uc-{vertical_code}01-{vertical_code}02-integration.spec.ts
  Cross-party scenarios (CS-*) involving both supplier and buyer actors
```

### Test data IDs

All DOM elements that Playwright interacts with must have `data-testid` attributes. Do not use CSS class selectors or text content selectors in Playwright tests — they break on UI changes.

```typescript
// Correct
await page.locator('[data-testid="publish-profile-btn"]').click()
await expect(page.locator('[data-testid="match-card"]')).toHaveCount(3)

// Incorrect — brittle
await page.locator('button.publish-btn').click()
await page.locator('text=3 matches found').waitFor()
```

Required `data-testid` attributes (partial list — engineering to maintain this as a living standard):

| Element | `data-testid` |
|---------|--------------|
| Publish profile button | `publish-profile-btn` |
| Completeness score display | `completeness-score` |
| Match card (each) | `match-card` |
| Match card cert badge | `match-card-cert-badge` |
| Match card availability badge | `match-card-availability-badge` |
| Coaching card overlay | `coaching-card` |
| Compose message box | `message-compose` |
| Catalog upload dropzone | `catalog-upload-dropzone` |
| RAG processing indicator | `rag-processing-indicator` |
| Deal Room message thread | `deal-room-thread` |
| Dispute submit button | `dispute-submit-btn` |
| Cert status badge | `cert-status-badge` |
| Profile completeness nudge | `completeness-nudge` |
| Live match counter | `live-match-counter` |
| Availability status selector | `availability-status-select` |
| Report supplier button | `report-supplier-btn` |
| Trust flag status | `trust-flag-status` |

### Page Object Model example

```typescript
// tests/e2e/pages/ProfileWizardPage.ts
export class ProfileWizardPage {
  constructor(private page: Page) {}

  async uploadCatalog(filePath: string) {
    await this.page.locator('[data-testid="catalog-upload-dropzone"]')
      .setInputFiles(filePath)
    await this.page.locator('[data-testid="rag-processing-indicator"]')
      .waitFor({ state: 'hidden', timeout: 120_000 })
  }

  async getCompletenessScore(): Promise<number> {
    const text = await this.page
      .locator('[data-testid="completeness-score"]').textContent()
    return parseInt(text ?? '0')
  }

  async publish() {
    await this.page.locator('[data-testid="publish-profile-btn"]').click()
  }

  async expectPublishBlocked() {
    await expect(
      this.page.locator('[data-testid="publish-profile-btn"]')
    ).toBeDisabled()
  }
}
```

### Spec file structure example

```typescript
// tests/e2e/specs/food/uc-f01-supplier.spec.ts
import { test, expect } from '@playwright/test'
import { ProfileWizardPage } from '../../pages/ProfileWizardPage'
import { MatchDashboardPage } from '../../pages/MatchDashboardPage'
import { seedF01Preconditions } from '../../fixtures/food/f01-supplier'

test.describe('UC-F01 — Food Supplier Activation (Kim Ji-won)', () => {

  test.beforeEach(async ({ request }) => {
    await seedF01Preconditions(request)
    // Seeds: 1 open buyer sourcing request (Food/Sauces, US, FSSC 22000 preferred)
    // Seeds: static Korean catalog PDF fixture at /fixtures/catalogs/korean-hotsauce.pdf
  })

  test('Main Flow — catalog upload pre-fills ≥ 5 profile fields', async ({ page }) => {
    const wizard = new ProfileWizardPage(page)
    await page.goto('/register')
    // ... registration steps
    await wizard.uploadCatalog('fixtures/catalogs/korean-hotsauce.pdf')
    // Assert ≥ 5 fields populated
    const filledFields = await page.locator('[data-testid="wizard-field"][data-filled="true"]').count()
    expect(filledFields).toBeGreaterThanOrEqual(5)
  })

  test('Main Flow — publish blocked below 60% completeness', async ({ page }) => {
    const wizard = new ProfileWizardPage(page)
    // Fill profile to only 45% completeness
    await wizard.expectPublishBlocked()
  })

  test('Main Flow — first match card renders within 60s of publish', async ({ page }) => {
    const wizard = new ProfileWizardPage(page)
    const matches = new MatchDashboardPage(page)
    // Fill to ≥ 60%, publish
    await wizard.publish()
    // Assert match card within 60s
    await expect(
      page.locator('[data-testid="match-card"]').first()
    ).toBeVisible({ timeout: 60_000 })
  })

  test('AF-1 — publish blocked when completeness < 60%', async ({ page }) => {
    const wizard = new ProfileWizardPage(page)
    await wizard.expectPublishBlocked()
    await expect(
      page.locator('[data-testid="completeness-nudge"]')
    ).toBeVisible()
  })

  test('AF-4 — expired certificate shows Expired badge, excluded from filters', async ({ page, request }) => {
    // Seed a cert fixture with expiry_date = yesterday
    await request.post('/api/test/seed/cert-expired', {
      data: { profile_id: 'kim-jiwon', cert_name: 'FSSC 22000' }
    })
    await page.goto('/suppliers/kim-jiwon')
    await expect(
      page.locator('[data-testid="cert-status-badge"][data-cert="FSSC 22000"]')
    ).toHaveText('Expired')
  })

  test.skip('CS-1 — cert expiry mid-introduction notifies buyer in Deal Room', async () => {
    // Requires both supplier and buyer active; see uc-f01-f02-integration.spec.ts
  })
})
```

---

## 7. Fixture Strategy

### Principle: deterministic, isolated, minimal

Each test owns its data. Tests do not share state or depend on execution order. After each test, seeded data is rolled back (database transaction rollback or per-test teardown).

### Fixture types

| Type | How | When used |
|------|-----|----------|
| **Profile fixtures** | POST to `/api/test/seed/profile` | Any test needing a supplier or buyer |
| **Cert fixtures** | POST to `/api/test/seed/cert` | Tests touching certification matching or expiry |
| **Match fixtures** | POST to `/api/test/seed/match` | Tests starting mid-funnel (e.g. deal flow tests) |
| **Deal fixtures** | POST to `/api/test/seed/deal` | Tests starting in Deal Room |
| **Dispute fixtures** | POST to `/api/test/seed/dispute` | Tests for dispute resolution flows |
| **Catalog PDFs** | Static files in `tests/fixtures/catalogs/` | RAG upload tests |
| **Certificate PDFs** | Static files in `tests/fixtures/certs/` | Cert upload + verification tests |

### Seeding API

The application exposes a `/api/test/seed/*` endpoint family that is:
- Available only when `NODE_ENV=test` or `GRACERA_ENV=ci`
- Blocked in staging and production via middleware
- Idempotent: calling the same seed twice returns the same fixture ID

```typescript
// tests/e2e/fixtures/food/f01-supplier.ts
export async function seedF01Preconditions(request: APIRequestContext) {
  // 1. Seed a buyer sourcing request
  await request.post('/api/test/seed/sourcing-request', {
    data: {
      fixture_id: 'f02-marcus-sourcing-request-01',
      category: 'food/sauces-condiments',
      country: 'US',
      required_certifications: ['FSSC 22000'],
      preferred_certifications: ['Halal'],
      order_frequency: 'Monthly',
      status: 'open'
    }
  })
  // Returns 409 if fixture_id already exists — idempotent
}

export async function teardownF01(request: APIRequestContext) {
  await request.delete('/api/test/seed/fixture/f02-marcus-sourcing-request-01')
}
```

### Static file fixtures

Catalog PDFs and certificate PDFs used in tests must be:
- Synthetic documents — never real supplier or buyer documents
- Stored in `tests/fixtures/` and committed to the repository
- Small enough to not bloat the repo (< 500KB per file; use compressed PDFs)
- Named consistently: `[vertical]-[type]-[language].pdf` (e.g. `food-catalog-korean.pdf`)

---

## 8. SLA Assertions

The activation SLAs defined in docs/01 are design constraints. They must be enforced in tests, not just tracked as metrics.

| SLA | Test type | Timeout | Assertion |
|-----|-----------|---------|-----------|
| First match card after supplier publish | E2E (Playwright) | 60,000 ms | `expect(matchCard).toBeVisible({ timeout: 60_000 })` |
| First 5 match cards after buyer sourcing request publish | E2E (Playwright) | 3,600,000 ms | `expect(matchCards).toHaveCount(5, { timeout: 3_600_000 })` |
| RAG field pre-fill after catalog upload | E2E (Playwright) | 120,000 ms | `expect(filledFields).toBeGreaterThanOrEqual(5)` |
| Cert `DigitallyVerified` after API verification | Integration (Jest) | 30,000 ms | `expect(cert.authenticity_status).toBe('DigitallyVerified')` |
| Availability auto-reset after 14-day gap | Integration (Jest) | N/A | Trigger job manually; assert field change |
| Safety net email after 72h no introduction | Integration (Jest) | N/A | Trigger job; assert email queued |
| Profile re-match after product line edit | Integration (Jest) | 300,000 ms | Assert new `matches` records created within 5 min |

**Note on long SLAs in E2E:** The 1-hour buyer matching SLA (3,600,000 ms) cannot run on every PR — it would make CI unusable. Strategy:
- Run the 60s supplier matching SLA on every PR
- Run the 1-hour buyer SLA in a nightly CI run only
- Tag it: `@nightly` — excluded from the default Playwright project, included in the `nightly` project

```typescript
// playwright.config.ts
projects: [
  { name: 'ci', testIgnore: /.*\.nightly\.spec\.ts/ },
  { name: 'nightly', testMatch: /.*\.nightly\.spec\.ts/ }
]
```

---

## 9. Background Job Testing

Several platform behaviours are triggered by scheduled jobs, not user actions. These must have dedicated integration tests that trigger the job synchronously via an admin endpoint.

| Job | Trigger endpoint | What to assert |
|-----|-----------------|---------------|
| Cert expiry check | `POST /api/test/jobs/cert-expiry` | Certs with `expiry_date < today` have `authenticity_status = 'Expired'`; buyer notifications created |
| Availability auto-reset | `POST /api/test/jobs/availability-reset` | Suppliers with `availability_updated_at < 14 days ago` have `availability_status = 'LimitedAvailability'` |
| No-introduction safety net | `POST /api/test/jobs/safety-net-check` | Suppliers with published profile and 0 introductions after 72h have an email notification queued |
| No-match buyer safety net | `POST /api/test/jobs/buyer-safety-net` | Buyers with published sourcing request and 0 matches after 24h have Prospecting Agent job created |
| Match re-run on profile edit | `POST /api/test/jobs/match-rerun/:profile_id` | New `matches` records created for updated profile |

---

## 10. Trust & Safety Test Scenarios

These cross-cutting tests are not tied to a single use case. They cover the trust model defined in docs/12.

| Scenario | Source | Test file |
|----------|--------|----------|
| Trading company impersonation report | UC-F01 CS-2 | `trust/fraud-reporting.spec.ts` |
| Cert expiry mid-introduction notification | UC-F01 AF-7 | `trust/cert-expiry.spec.ts` |
| Suspended profile excluded from match results | UC-F01 CS-2 | `trust/fraud-reporting.spec.ts` |
| Subcontracting dispute escalates to trust team | UC-A01 CS-2 | `trust/subcontracting-discovery.spec.ts` |
| OFAC compliance hold on introduction | UC-C01 AF-8 | `trust/sanctions-screening.spec.ts` |
| Trust note visible on supplier profile after resolution | UC-A01 CS-2 | `trust/trust-notes.spec.ts` |
| Buyer cert expiry notification (active Deal Room) | UC-H02 CS-2 | `trust/cert-expiry.spec.ts` |
| First article dispute escalation (no 48h delay) | UC-I01 CS-1 | `trust/dispute-resolution.spec.ts` |
| Undisclosed subcontracting bypasses cooling-off | UC-A01 CS-2 | `trust/dispute-resolution.spec.ts` |

---

## 11. Security Testing

Run OWASP ZAP baseline scan against the staging environment on every release. Block releases where any HIGH-severity finding is unresolved.

Additional manual security checks required before Phase 1 launch:

| Check | Description |
|-------|-------------|
| Buyer price/budget never exposed to supplier | Assert `target_unit_price_usd` and `budget_range` are absent from any API response returned to a supplier-role session |
| Contact details hidden before introduction | Assert supplier email/phone are null in match card API response before introduction status = `accepted` |
| Seed endpoint blocked in staging/production | Assert `POST /api/test/seed/*` returns 403 when `GRACERA_ENV != 'ci'` |
| Admin impersonation requires audit log | Assert every admin impersonation action creates an `audit_log` record |
| File upload type validation | Assert non-PDF, non-image uploads to cert upload endpoint return 415 |
| Brute-force rate limiting on login | Assert > 10 failed login attempts in 60s results in 429 |
| SSRF protection on URL fields (logo, website) | Assert `localhost`, `10.x.x.x`, `172.16.x.x` URLs are rejected in profile URL fields |

---

## 12. Performance Testing (k6)

Run k6 performance tests against the staging environment before each Phase release.

### Matching pipeline under load

```
Scenario: 50 concurrent supplier registrations, each triggering a match run
  → Assert: p95 match run completion < 60s
  → Assert: no errors (HTTP 5xx) during the run
  → Assert: database connection pool not exhausted
```

### Activation flow under load

```
Scenario: 20 concurrent new supplier activations (catalog upload → publish → first match)
  → Assert: p95 full activation flow < 3 minutes
  → Assert: RAG processing p95 < 90s
```

### Search and filter

```
Scenario: 200 concurrent search requests with various filter combinations
  → Assert: p95 search response < 500ms
  → Assert: p99 < 2s
```

### Programmatic SEO pages

```
Scenario: 100 concurrent requests to /suppliers/[category]/[country] pages
  → Assert: p95 TTFB < 200ms (ISR cache hit)
  → Assert: p95 TTFB < 3s (ISR cache miss / revalidation)
```

---

## 13. Bug Classification & Severity

| Severity | Definition | SLA to fix | Examples |
|----------|-----------|-----------|---------|
| **P0 — Critical** | Platform unusable; data loss; security breach | Fix within 4 hours; hotfix to production | Buyer price data exposed to supplier; authentication bypass; matching engine returning zero results for all users |
| **P1 — High** | Core flow broken for a user type; SLA violation | Fix within 24 hours | Supplier cannot publish profile; first match not surfacing within 60s; cert verification API returning wrong status |
| **P2 — Medium** | Feature partially broken; workaround exists | Fix in next sprint | Coaching card not rendering; completeness score miscalculated; wrong unit in match card |
| **P3 — Low** | Cosmetic; minor UX issue | Fix when capacity allows | Button misalignment; tooltip text wrong; minor copy error |

### Bug report template

```
**Severity:** P0 / P1 / P2 / P3
**Use case affected:** UC-F01 AF-7 (or "Not in use case scope")
**Environment:** local / ci / staging
**Steps to reproduce:**
1. ...
2. ...
**Expected behaviour:** (reference the system response column in the use case)
**Actual behaviour:**
**Screenshot/log:**
```

---

## 14. CI/CD Pipeline

### On every PR (≤ 10 minutes target)

```yaml
steps:
  - Unit tests (Jest)             # ~2 min
  - Integration tests (Jest)      # ~4 min
  - E2E smoke tests (Playwright)  # ~4 min — main flows only, no nightly SLA tests
  - OWASP ZAP baseline scan       # parallel; non-blocking on P2/P3 findings only
```

### On merge to `main`

```yaml
steps:
  - Full E2E suite (Playwright)   # all specs except @nightly
  - Performance smoke (k6)        # 30s load test; assert no P0/P1 errors
  - Deploy to staging (Coolify)
```

### Nightly (02:00 UTC)

```yaml
steps:
  - Nightly E2E (Playwright)      # includes @nightly SLA tests (1h buyer match SLA)
  - Full k6 performance suite     # all load scenarios
  - Security scan (ZAP full)
  - Notify on failure → Slack #qa-alerts
```

### Pre-release gate (before tagging a production release)

All of the following must be green:
- [ ] Full E2E suite passes on staging
- [ ] No P0 or P1 open bugs in the current milestone
- [ ] Performance tests pass (all SLAs met at p95)
- [ ] OWASP ZAP: zero HIGH-severity findings
- [ ] Manual security checklist completed (see §11)
- [ ] Phase coverage target met (see §5) for the phase being released

---

## 15. Definition of Done

A feature is done when:

1. Unit tests written and passing for all pure functions introduced
2. Integration tests written for all new API endpoints and background jobs
3. E2E test(s) written for the main flow of any new user-facing feature; mapped to a use case from docs/17 where one exists
4. All new DOM elements that Playwright interacts with have `data-testid` attributes
5. Phase-skipped tests (`@skip // Phase N`) written as stubs for features not yet built, so the test scaffold exists when the feature is built
6. No P0 or P1 bugs introduced (verified by the CI suite)
7. Performance impact assessed: if the feature touches the matching pipeline or a high-traffic page, a k6 script is updated or written
8. Security checklist items relevant to the feature are verified

---

## 16. Test Metrics & Reporting

Track weekly in the engineering sync:

| Metric | Target |
|--------|--------|
| E2E pass rate (CI) | ≥ 98% |
| E2E pass rate (nightly) | ≥ 95% |
| Main flow coverage (UC-F01 to UC-C02) | 100% by Phase 1 launch |
| Alternate flow coverage | ≥ 60% by Phase 1 launch; ≥ 80% by Phase 2 |
| Complex scenario coverage (CS-*) | ≥ 50% by Phase 2; 100% by Phase 3 |
| P0/P1 bugs open | 0 at release |
| Mean time to detect (MTTD) | < 24 hours for P0/P1 |
| Mean time to resolve (MTTR) | P0: < 4h; P1: < 24h |

---

## Appendix A: Use Case → Test File Mapping

| Use Case | Main spec file | Integration spec | Complex scenario spec |
|----------|---------------|-----------------|----------------------|
| UC-F01 | `food/uc-f01-supplier.spec.ts` | `food/uc-f01-matching.spec.ts` | `food/uc-f01-f02-integration.spec.ts` |
| UC-F02 | `food/uc-f02-buyer.spec.ts` | `food/uc-f02-matching.spec.ts` | `food/uc-f01-f02-integration.spec.ts` |
| UC-E01 | `electronics/uc-e01-supplier.spec.ts` | `electronics/uc-e01-matching.spec.ts` | `electronics/uc-e01-e02-integration.spec.ts` |
| UC-E02 | `electronics/uc-e02-buyer.spec.ts` | `electronics/uc-e02-matching.spec.ts` | `electronics/uc-e01-e02-integration.spec.ts` |
| UC-A01 | `apparel/uc-a01-supplier.spec.ts` | `apparel/uc-a01-matching.spec.ts` | `apparel/uc-a01-a02-integration.spec.ts` |
| UC-A02 | `apparel/uc-a02-buyer.spec.ts` | `apparel/uc-a02-matching.spec.ts` | `apparel/uc-a01-a02-integration.spec.ts` |
| UC-I01 | `industrial/uc-i01-supplier.spec.ts` | `industrial/uc-i01-matching.spec.ts` | `industrial/uc-i01-i02-integration.spec.ts` |
| UC-I02 | `industrial/uc-i02-buyer.spec.ts` | `industrial/uc-i02-matching.spec.ts` | `industrial/uc-i01-i02-integration.spec.ts` |
| UC-H01 | `health-beauty/uc-h01-supplier.spec.ts` | `health-beauty/uc-h01-matching.spec.ts` | `health-beauty/uc-h01-h02-integration.spec.ts` |
| UC-H02 | `health-beauty/uc-h02-buyer.spec.ts` | `health-beauty/uc-h02-matching.spec.ts` | `health-beauty/uc-h01-h02-integration.spec.ts` |
| UC-C01 | `chemicals/uc-c01-supplier.spec.ts` | `chemicals/uc-c01-matching.spec.ts` | `chemicals/uc-c01-c02-integration.spec.ts` |
| UC-C02 | `chemicals/uc-c02-buyer.spec.ts` | `chemicals/uc-c02-matching.spec.ts` | `chemicals/uc-c01-c02-integration.spec.ts` |

---

[Back to README](../README.md)
