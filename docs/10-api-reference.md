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
Accept an introduction. If both parties have accepted, a Deal is created automatically.

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
