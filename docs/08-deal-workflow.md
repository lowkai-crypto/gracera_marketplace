# Deal Workflow

Once two parties are matched and connected, Gracera provides a structured workflow to move from introduction to closed deal.

---

## 1. Deal Lifecycle Overview

```
[Match Introduction]
        │
        ▼
[Introductions Accepted by Both]
        │
        ▼
[Message Thread Opens]
        │
        ├─── Informal negotiation in messages
        │
        ▼
[RFQ Issued by Buyer]
        │
        ▼
[Quote Submitted by Supplier]
        │
        ├─── Counter-offer (optional, loops)
        │
        ▼
[Quote Accepted]
        │
        ▼
[Deal Room: Terms & Documents]
        │
        ▼
[Deal Closed — Both Parties Confirm]
        │
        ▼
[Post-Deal Review]
```

---

## 2. Stage Definitions

### Stage 0 — Match Introduction

- AI Agent surfaces a match to both parties (or one party)
- Each party sees a match card with score, rationale, and the other party's public profile
- **Actions available:**
  - Accept introduction → moves to Stage 1
  - Pass / Not interested → removed from matches; negative feedback logged

### Stage 1 — Message Thread

- A private, platform-hosted message thread opens between the two parties
- Both parties can view each other's full profile at this stage
- Contact details (email, phone) remain hidden until buyer and supplier mutually choose to share
- Parties can exchange documents, product specs, and samples in this thread
- **Actions available:**
  - Issue RFQ (Buyer) → moves to Stage 2
  - Archive thread → marks deal as abandoned

### Stage 2 — RFQ

Buyer creates a structured Request for Quotation:

| RFQ Field | Type | Notes |
|-----------|------|-------|
| `product_service_description` | text | What is being quoted |
| `quantity` | integer + unit | |
| `delivery_location` | text | Port, city, address |
| `required_delivery_date` | date | |
| `required_certifications` | string[] | Any additional QC/compliance asks |
| `preferred_incoterms` | enum | |
| `preferred_payment_terms` | enum | |
| `sample_required` | boolean | |
| `additional_notes` | text | |
| `rfq_valid_until` | date | Expiry date for quote response |

Supplier is notified of the RFQ. Supplier can:
- Submit a Quote → Stage 3
- Request clarification (replies in message thread)
- Decline RFQ → deal archived

### Stage 3 — Quote

Supplier submits a structured Quote in response to the RFQ:

| Quote Field | Type | Notes |
|-------------|------|-------|
| `line_items` | LineItem[] | Product/service, quantity, unit price |
| `currency` | enum | |
| `incoterms` | enum | |
| `lead_time_days` | integer | Production + shipping |
| `payment_terms` | enum | |
| `validity_date` | date | Quote expires after this date |
| `notes` | text | |
| `sample_price` | float | Optional; 0 if free |
| `attachments` | URL[] | Spec sheets, price lists |

**LineItem sub-schema:**

| Field | Type |
|-------|------|
| `description` | string |
| `quantity` | integer |
| `unit` | string |
| `unit_price` | float |
| `total_price` | float (computed) |

Buyer can:
- Accept Quote → Stage 4
- Counter-offer (modifies terms, sends back to supplier) → loops at Stage 3
- Decline → deal archived

### Stage 4 — Deal Room

Both parties have agreed on the quote. Deal Room is a shared space for finalizing the deal:

- **Documents:** Pro-forma invoice, packing list, NDA, purchase order — upload and sign-off
- **Checklist:** Both parties confirm each milestone (e.g., "Sample approved", "Order confirmed", "Payment sent", "Shipment booked")
- **Status tracking:** Deal moves through configurable milestones

**Default deal milestones:**

| Milestone | Confirmed by |
|-----------|-------------|
| Quote accepted | Buyer |
| Pro-forma invoice issued | Supplier |
| Deposit received | Supplier |
| Production started | Supplier |
| Sample approved (if applicable) | Buyer |
| Production completed | Supplier |
| Shipment booked | Supplier |
| Documents shared | Supplier |
| Goods received | Buyer |
| Final payment sent | Buyer |
| Deal closed | Both |

### Stage 5 — Post-Deal Review

After both parties confirm "Deal Closed":
- Both parties are invited to leave a review of the transaction
- Review is visible on both profiles
- Deal outcome feeds back into AI matching as a strong positive signal

---

## 3. Deal Status States

```
PENDING_ACCEPTANCE
      │
      ▼
MESSAGING
      │
      ├──→ ABANDONED
      │
      ▼
RFQ_ISSUED
      │
      ├──→ ABANDONED
      │
      ▼
QUOTE_SUBMITTED
      │
      ├──→ COUNTER_OFFER (loops back to QUOTE_SUBMITTED)
      ├──→ ABANDONED
      │
      ▼
DEAL_ROOM
      │
      ├──→ ABANDONED
      │
      ▼
CLOSED
```

---

## 4. Notifications

| Event | Notify |
|-------|--------|
| New match surfaced | Both parties (in-app + email digest) |
| Introduction accepted by other party | Notified party |
| New message received | Recipient |
| RFQ issued | Supplier |
| Quote submitted | Buyer |
| Counter-offer received | Other party |
| Deal milestone confirmed | Other party |
| Deal closed | Both parties |
| Review left | Other party |

---

[Back to README](../README.md)
