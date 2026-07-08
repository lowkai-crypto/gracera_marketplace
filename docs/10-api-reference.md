# API Reference

All endpoints use REST + JSON. Base URL: `https://api.gracera.com/v1`

Authentication: Bearer token (JWT) in `Authorization` header.

---

## Authentication

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "...",
  "role": "supplier"  // or "buyer" or "both"
}
```

**Response 201:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "supplier",
  "access_token": "jwt...",
  "refresh_token": "jwt..."
}
```

---

### POST /auth/login
```json
{ "email": "...", "password": "..." }
```
**Response 200:** Same as register response.

---

### POST /auth/refresh
```json
{ "refresh_token": "jwt..." }
```
**Response 200:** `{ "access_token": "jwt..." }`

---

## Supplier Profiles

### GET /supplier-profiles/{id}
Returns public supplier profile.

### GET /supplier-profiles/me
Returns the authenticated user's own supplier profile, including contact
fields (unlike the public `/{id}` lookup above). 404 if the user doesn't
have one yet.

### POST /supplier-profiles
Create supplier profile (authenticated, supplier role).

**Request body:** Fields from [Supplier Profile Spec](05-supplier-profile-spec.md).

### PATCH /supplier-profiles/{id}
Partial update. Only the owner can update.

### DELETE /supplier-profiles/{id}
Soft-deletes (sets status = deleted).

---

## Buyer Profiles

### GET /buyer-profiles/{id}
Returns public buyer profile. Contact details omitted unless match accepted.

### GET /buyer-profiles/me
Returns the authenticated user's own buyer profile, including contact
fields. 404 if the user doesn't have one yet.

### POST /buyer-profiles
Create buyer profile.

### PATCH /buyer-profiles/{id}
Partial update.

---

## Sourcing Requests

### GET /sourcing-requests?buyer_profile_id={id}&status=open
List sourcing requests. Publicly viewable (no contact info exposed).

### POST /sourcing-requests
Create a sourcing request.

**Request body:** Fields from [Buyer Profile Spec](06-buyer-profile-spec.md) §2.

### PATCH /sourcing-requests/{id}
Update (triggers re-match if material fields change).

### DELETE /sourcing-requests/{id}
Sets status = closed.

---

## Matches

### GET /matches?profile_type=supplier&profile_id={id}
Returns matches for the authenticated user's profile. Sorted by `final_score` desc.

**Response 200:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "score": 87.4,
      "quality": "Strong Match",
      "summary": "Pacific Rim is sourcing in your category...",
      "counterpart_profile": { ... },
      "supplier_status": "pending",
      "buyer_status": "accepted",
      "created_at": "2026-05-25T..."
    }
  ],
  "total": 12
}
```

### POST /matches/{id}/accept
Accept an introduction. If both parties have accepted, a Deal is created automatically — this
side effect ships with the Deals feature, not with Matches v0; until then, the response includes
`bothAccepted: true` and no `deals` row exists yet.

### POST /matches/{id}/reject
Reject with optional reason:
```json
{ "reason": "wrong_category" }  // wrong_category | wrong_volume | already_connected | other
```

---

## Deals

### GET /deals?user_id={id}&stage=rfq_issued
List deals for authenticated user.

### GET /deals/{id}
Full deal detail including messages, RFQs, and quotes.

### POST /deals/{id}/messages
Send a message in the deal thread.
```json
{ "body": "...", "attachments": ["s3://..."] }
```

---

## RFQs

### POST /deals/{deal_id}/rfqs
Issue an RFQ (buyer only).

**Request body:** Fields from [Deal Workflow](08-deal-workflow.md) §2 Stage 2.

### GET /deals/{deal_id}/rfqs/{rfq_id}
Get a specific RFQ.

### POST /rfqs/{rfq_id}/decline
Supplier declines the RFQ.

---

## Quotes

### POST /rfqs/{rfq_id}/quotes
Submit a quote (supplier only).

**Request body:** Fields from [Deal Workflow](08-deal-workflow.md) §2 Stage 3.

### POST /quotes/{id}/accept
Buyer accepts a quote. Moves deal to DEAL_ROOM stage.

### POST /quotes/{id}/counter
Buyer counters with modified terms:
```json
{
  "notes": "Can you do Net 60?",
  "payment_terms": "net_60"
}
```

### POST /quotes/{id}/decline
Buyer declines.

---

## Reviews

### POST /deals/{deal_id}/reviews
Submit a review for the counterpart on a closed deal (authenticated).

```json
{ "rating": 5, "body": "..." }
```

Hidden (`visible = false`) until both parties have submitted a review for the same deal.

### GET /reviews?profile_id={id}
Public. Returns visible reviews for a supplier or buyer profile.

---

## Certifications

### POST /certifications
Attach a certification to the authenticated user's supplier profile. Upload the file via `/uploads/presign` first, then pass the resulting `object_url`.

```json
{
  "supplierProfileId": "uuid",
  "name": "ISO 9001",
  "issuingBody": "...",
  "certificateNumber": "...",
  "expiryDate": "2027-01-01",
  "documentUrl": "https://cdn.gracera.com/..."
}
```

### GET /certifications?supplier_profile_id={id}
Public. Returns certifications for a supplier profile, including `verified` and `authenticity_status`.

### PATCH /certifications/{id}
Owner only.

### DELETE /certifications/{id}

---

## Contacts

Additional commercial/technical/finance routing contacts (docs/05 §1.8, docs/06 §1.4). Owner-only for write; contact `email`/`phone` are hidden from public reads until an introduction is accepted, matching the primary contact's visibility rule.

### GET /supplier-profiles/{id}/contacts
### POST /supplier-profiles/{id}/contacts
### PATCH /supplier-profiles/{id}/contacts/{contactId}
### DELETE /supplier-profiles/{id}/contacts/{contactId}

### GET /buyer-profiles/{id}/contacts
### POST /buyer-profiles/{id}/contacts
### PATCH /buyer-profiles/{id}/contacts/{contactId}
### DELETE /buyer-profiles/{id}/contacts/{contactId}

Max 3 additional contacts per profile (docs/13 M1.1), beyond the profile's own primary contact fields.

---

## Disputes

See [Deal Workflow](08-deal-workflow.md) §7 for the full user-facing flow and [Admin Ops](20-admin-ops-spec.md) §4 for the trust-team side.

### POST /deals/{deal_id}/disputes
File a dispute against a deal (either party, authenticated).

```json
{
  "category": "non_delivery",
  "description": "...",
  "evidenceUrls": [{ "filename": "...", "url": "..." }]
}
```

`category` is one of: `non_delivery`, `wrong_specification`, `quality_issue`, `payment_refused`, `certification_mismatch`, `other`.

### GET /deals/{deal_id}/disputes
Both parties to the deal can view.

### GET /disputes/{id}
Both parties, plus admin (see Admin section below for the trust-team review actions).

---

## Group RFQs

MOQ pooling across multiple buyers (docs/08 §3).

### POST /group-rfqs
Lead buyer creates a group RFQ against a supplier.

```json
{ "supplierProfileId": "uuid", "targetQuantity": 5000 }
```

### GET /group-rfqs?supplier_profile_id={id}&status=forming
Browse forming pools.

### POST /group-rfqs/{id}/join
Co-buyer allocates a quantity.

```json
{ "allocationQuantity": 500 }
```

### POST /group-rfqs/{id}/withdraw
Co-buyer withdraws their allocation.

---

## Broadcasts

Supplier trade announcements to a targeted buyer segment (docs/13 M3.3). Every broadcast is reviewed before it sends — see [Admin Ops](20-admin-ops-spec.md) §8.2.

### POST /broadcasts
```json
{
  "supplierProfileId": "uuid",
  "headline": "...",
  "body": "...",
  "targetSegment": { "categories": [...], "countries": ["US", "CA"] }
}
```
**Response 201:** the broadcast with `reviewStatus: "pending"`. It does not send until an admin approves it.

### GET /broadcasts?supplier_profile_id={id}
Send history with `reviewStatus`, `sentAt`, `recipientCount`.

---

## Referrals

Partner handoffs surfaced at Deal Room entry (docs/08; docs/15 §4). All three share one shape.

### POST /deals/{id}/referrals/trade-finance
### POST /deals/{id}/referrals/logistics
### POST /deals/{id}/referrals/buyer-protection

**Response 200:**
```json
{ "id": "uuid", "referralType": "trade_finance", "redirectUrl": "https://partner.example.com/..." }
```

---

## Search

### GET /search/suppliers
```
?q=electronics+components
&category=electronics/pcb
&country=CN
&certifications=ISO9001,RoHS
&moq_max=1000
&page=1&per_page=20
```

**Response 200:**
```json
{
  "results": [ { "supplier_profile": {...}, "relevance_score": 0.94 } ],
  "total": 142,
  "page": 1,
  "per_page": 20
}
```

### GET /search/buyers
Same structure. Filters: `category`, `country`, `buyer_type`, `volume_range`.

---

## File Uploads

### POST /uploads/presign
Get a presigned S3 URL for direct upload.

```json
{ "filename": "cert.pdf", "content_type": "application/pdf", "context": "certification" }
```

**Response 200:**
```json
{
  "upload_url": "https://s3.amazonaws.com/...",
  "object_url": "https://cdn.gracera.com/..."
}
```

Client uploads directly to `upload_url`. Then pass `object_url` to any profile field.

---

## AI-Brain

Conversational advisor (docs/04 §7). Pro/Enterprise only — gated by an active `subscriptions` row for the caller's active role.

### POST /ai-brain/conversations
Start a new conversation.
```json
{ "roleContext": "supplier", "mode": "chat" }
```
`mode` is `chat` or `growth_advisor`.

### POST /ai-brain/conversations/{id}/messages
```json
{ "body": "Why am I not matching with German buyers?" }
```
**Response 200:** the assistant's reply, streamed via SSE.

### GET /ai-brain/conversations?role_context=supplier
List the caller's conversations for that role.

---

## Insights

Business Intelligence Brief (docs/04 §4.2).

### GET /insights/{profileId}
Returns completeness gaps, category percentile comparison, and (once generated) a Growth Strategy Engine export link.

---

## Price Compass

Market rate estimates (docs/13 M2.3).

### GET /price-compass?category_id={id}&hs_code={code}
**Response 200:**
```json
{ "priceRangeUsd": { "p25": 1.10, "p50": 1.35, "p75": 1.60 }, "sampleSize": 42 }
```
`sampleSize` below a minimum threshold returns `null` ranges rather than an unreliable estimate off too few historical quotes.

---

## Admin

All endpoints below require an `admin_role_assignments` row for the caller matching the audience noted (docs/20 §1), plus `users.mfa_enabled = true`. See [Portal Navigation](28-portal-navigation.md) Admin context for the sidebar this maps to, and [Admin Ops](20-admin-ops-spec.md) for full workflow detail.

### Dashboard — `super_admin`

`GET /admin/dashboard/health` — active users, match queue depth, AI service latency, error rate.

### Verification Queue — `trust_team`

`GET /admin/verification-queue`
`POST /admin/verification-queue/{id}/approve`
`POST /admin/verification-queue/{id}/reject`

### Dispute Queue — `trust_team`

`GET /admin/disputes?status=filed`
`POST /admin/disputes/{id}/assign`
`POST /admin/disputes/{id}/recommend` — `{ "recommendation": "..." }`
`POST /admin/disputes/{id}/resolve` — `{ "resolutionNotes": "..." }`
`GET /admin/disputes/{id}/evidence-export` — returns a ZIP per docs/20 §4.

### Wire Transfer Queue — `finance_ops`

`GET /admin/wire-transfers?status=unmatched`
`POST /admin/wire-transfers` — manual entry: `{ "paymentReference": "...", "amountReceived": 500, "currency": "USD", "receivedDate": "2026-07-08" }`
`POST /admin/wire-transfers/{id}/reconcile`

### Match Override — `customer_success`, `trust_team`

`POST /admin/matches/inject` — `{ "supplierProfileId": "...", "buyerSourcingRequestId": "...", "rationale": "..." }`
`POST /admin/match-suppressions` — `{ "supplierProfileId": "...", "buyerProfileId": "...", "reason": "..." }`
`PATCH /admin/profiles/{id}/match-hold` — `{ "matchHold": true, "expiresAt": "2026-08-01" }`

### Accounts — `customer_success`

`POST /admin/users/{id}/impersonate` — issues a read-only impersonation token; no mutating request can be authorized with it.
`POST /admin/users/{id}/suspend` — `{ "suspensionType": "soft_suspend", "reason": "..." }`
`PATCH /admin/subscriptions/{id}` — tier/expiry/credit overrides (docs/20 §7.3).

### Content Moderation — `content_mod`

`GET /admin/flags?status=open`
`POST /admin/flags/{id}/dismiss`
`POST /admin/flags/{id}/warn`
`POST /admin/flags/{id}/remove`
`POST /admin/flags/{id}/escalate`
`POST /admin/broadcasts/{id}/approve`
`POST /admin/broadcasts/{id}/reject` — `{ "reason": "..." }`

### Platform Metrics — `data_analyst`, `super_admin`

`GET /admin/metrics/supply-demand`
`GET /admin/metrics/matching`
`GET /admin/metrics/deal-funnel`
`GET /admin/metrics/revenue`
`GET /admin/metrics/trust-safety`

### Role & Feature Management — `super_admin`

`GET /admin/roles`
`POST /admin/roles` — `{ "slug": "...", "name": "...", "description": "..." }`
`PATCH /admin/roles/{id}`
`DELETE /admin/roles/{id}` — 409 if `is_system = true` or any `user_roles` still reference it.
`POST /admin/roles/{id}/features` — `{ "featureId": "...", "sortOrder": 1 }`
`DELETE /admin/roles/{id}/features/{featureId}`

### Staff Accounts — `super_admin`

`POST /admin/staff/{userId}/roles` — `{ "adminRole": "trust_team" }`; 422 if the target user's `mfa_enabled` is false.
`DELETE /admin/staff/{userId}/roles/{adminRole}`

### Audit Log — `super_admin`

`GET /admin/audit-log?entity_type=&actor_id=`

---

## Error Format

All errors return:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "moq must be a positive integer",
    "field": "moq"
  }
}
```

Standard HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 422 (business rule violation), 429 (rate limit), 500 (server error).

---

[Back to README](../README.md)
