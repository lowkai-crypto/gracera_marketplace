# Use Cases

Twelve end-to-end scenarios covering one supplier and one buyer for each of Gracera's six priority verticals. Each use case is written at the **intent level**: actor actions describe *what the user wants to accomplish*; system responses describe *what the platform must return or do*. This level of abstraction is stable across UI changes and maps directly to Playwright test structure.

**How to read these for test automation:**
- Each Main Flow row → one or more Playwright actions + `expect()` assertion
- Alternate Flows → separate `test.describe` / `test()` blocks (negative and edge cases)
- Preconditions → `beforeEach` seed data and fixtures
- Test Notes → fixture schema and timing SLA assertions

---

## Use Case Index

| ID | Vertical | Persona | Scenario summary |
|----|----------|---------|-----------------|
| [UC-F01](#uc-f01) | Food & Beverage | Supplier | Korean hot sauce factory, first US export match |
| [UC-F02](#uc-f02) | Food & Beverage | Buyer | US specialty food distributor sourcing Korean condiments |
| [UC-E01](#uc-e01) | Electronics & Components | Supplier | Shenzhen PCBA factory targeting European ODM buyers |
| [UC-E02](#uc-e02) | Electronics & Components | Buyer | German automation company sourcing custom PCBAs |
| [UC-A01](#uc-a01) | Apparel & Textiles | Supplier | Bangladesh sustainable garment factory, UK/EU brands |
| [UC-A02](#uc-a02) | Apparel & Textiles | Buyer | UK e-commerce brand sourcing sustainable private-label activewear |
| [UC-I01](#uc-i01) | Industrial Parts & Manufacturing | Supplier | Taiwan CNC machining shop targeting North American OEMs |
| [UC-I02](#uc-i02) | Industrial Parts & Manufacturing | Buyer | Canadian equipment manufacturer sourcing precision housings |
| [UC-H01](#uc-h01) | Health, Beauty & Personal Care | Supplier | South Korean cosmetics ODM factory targeting European indie brands |
| [UC-H02](#uc-h02) | Health, Beauty & Personal Care | Buyer | French indie skincare brand sourcing Korean-formula serums |
| [UC-C01](#uc-c01) | Chemicals & Raw Materials | Supplier | Indian surfactant manufacturer targeting EU cleaning products sector |
| [UC-C02](#uc-c02) | Chemicals & Raw Materials | Buyer | Dutch cleaning products company sourcing bio-based surfactants |

---

## UC-F01

### Food & Beverage — Supplier: Kim Ji-won, Gochang, South Korea

**Context**

Kim Ji-won is the export sales director at Jangdok Foods, a 35-person hot sauce and fermented condiment factory in Gochang, South Korea. The factory holds FSSC 22000 and Korea Halal Authority (KMF) certification. Kim has been selling domestically for 8 years and recently started exporting to Japan, but has no presence in North America. Her English is functional but limited; she prefers to review documents in Korean. A trade association newsletter mentioned Gracera and she registers to explore it.

**Preconditions**

- No prior Gracera account
- Factory holds FSSC 22000 (valid, expiry 18 months away) and KMF Halal (valid)
- At least 1 open buyer sourcing request exists in Food & Beverage / Sauces & Condiments targeting suppliers in South Korea or East Asia, with FSSC 22000 preferred
- Platform UI available in Korean (Phase 4 feature; use English for Phase 1 test)

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Registers with business email; selects role "Supplier"; selects primary category "Food & Beverage > Sauces, Condiments & Seasonings" | Account created; email verification link sent; onboarding wizard launches |
| 2 | Verifies email | Account active; wizard proceeds to catalog upload prompt (not blank profile form) |
| 3 | Uploads Korean-language product catalog PDF (12 pages, includes product specs, certifications, and company overview) | RAG pipeline processes document; within 90 seconds, ≥ 7 profile fields are pre-filled: `company_name`, `company_description`, `product_lines` (≥ 1), `certifications` (FSSC 22000 detected), `country`, `production_capacity_monthly`, `moq` (on product line) |
| 4 | Reviews pre-filled fields in wizard; corrects `moq` (catalog listed retail MOQ, not B2B MOQ); adds `target_geographies` (US, Canada, Australia); adds `ideal_customer_description` | Completeness score updates live; reaches 68% after edits |
| 5 | Uploads FSSC 22000 certificate PDF and KMF Halal certificate PDF | Both certificates queued for verification; displayed as "Uploaded — Pending Review" on profile; `authenticity_status = 'Uploaded'` |
| 6 | Wizard shows benchmark nudge: *"You're in the bottom 35% for profile completeness in Sauces & Condiments. Adding your export market history would move you to the top 50%."* Kim adds 2 notable export customers and active markets (Japan, Taiwan) | Completeness reaches 74%; benchmark nudge updates to top 45% |
| 7 | Submits profile for publish | System validates completeness ≥ 60% (pass); `profile_status` set to `active`; real-time match run triggered |
| 8 | Views match results dashboard | ≥ 1 match card rendered within 60 seconds; each card shows: buyer country, buyer type (Distributor / Retailer), sourcing volume range, required certifications met/not met |
| 9 | Opens highest-ranked match card | Decision-Maker Coaching Card shown: buyer's `primary_contact_role` displayed (e.g. "Procurement Manager"), suggested opening angle ("Lead with your Halal certification — this buyer sources for Muslim-majority retail markets") |
| 10 | Composes and sends first introduction message | Message delivered to buyer's inbox; Kim's dashboard shows "Introduction sent — awaiting response"; buyer notified |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Profile completeness < 60% when Kim attempts to publish | Publish button disabled; wizard highlights the 3 highest-weight unfilled sections with specific field names |
| AF-2 | No matches found within 60 seconds of publish | Closest 3 partial matches shown with gap explanation: e.g. *"Adding FDA registration unlocks 14 more buyers sourcing for the US market"* |
| AF-3 | 72 hours pass since first match surfaced; no introduction accepted by buyer | Safety net email sent to Kim with specific benchmark gap list comparing her profile to top-performing suppliers in Sauces & Condiments |
| AF-4 | Kim uploads an expired FSSC 22000 certificate | System detects expiry date in document; displays warning: "This certificate expired on [date]. Upload the renewed version to activate certification matching." Certificate saved but not applied to matching filters |
| AF-5 | Kim attempts to register a duplicate account with the same business registration number | Registration blocked; prompt to log in to existing account or contact support |
| AF-6 | RAG misreads the Korean-language catalog and extracts `category = "Vinegar"` instead of "Hot Sauce & Chili Paste" — Kim doesn't notice before publishing | Matching engine surfaces buyers sourcing vinegar rather than hot sauce; Kim receives 0 relevant matches in 72 hours; safety net fires with a gap list that includes a category mismatch warning: *"Your top category tag is 'Vinegar' — is that correct? Most of your matched buyers are sourcing hot sauce."* Kim corrects the category; match run re-triggered |
| AF-7 | Kim's FSSC 22000 certificate, which was valid at publish, expires 3 weeks later while an introduction with a US buyer is pending | Platform detects expiry; cert status changes to `Expired`; buyer receives notification: *"A certification on this supplier's profile has expired. Verify with the supplier before proceeding."*; Kim receives urgent renewal alert; match is not withdrawn but shown with expired cert warning on both sides |
| AF-8 | Another Korean company registers on Gracera with the name "Jangdok Food Co." (near-identical to Kim's "Jangdok Foods") and uploads similar product photos | Trust team flagged for review via automated name-similarity check; both profiles shown as "Pending Verification" until trust team confirms each is a distinct legal entity; Kim notified of the potential impersonation |

---

**Complex Multi-Step Scenarios**

### CS-1: Certificate Expires Mid-Introduction

**Trigger:** Kim's FSSC 22000 expires 3 weeks after she publishes. A US buyer (Marcus) has already accepted the introduction and is in active messaging with Kim in the Deal Room.

**Sequence:**
1. Platform certifications job runs nightly; detects FSSC 22000 `expiry_date` has passed
2. `certifications.authenticity_status` updated to `Expired`; cert removed from active matching filters
3. Marcus's Deal Room view shows a warning banner: *"Supplier's FSSC 22000 certification expired on [date]. Confirm current certification status before proceeding."*
4. Kim receives an urgent notification: *"Your FSSC 22000 has expired. Buyers you're currently in contact with have been notified. Upload your renewal certificate to restore your certification status."*
5. Kim contacts her certification body; obtains a 30-day extension letter; uploads the letter as a supporting document (not a formal cert renewal)
6. Trust team reviews the extension letter; manually sets `authenticity_status = 'TrustTeamVerified'` with an expiry date of the extension period
7. Marcus receives a follow-up notification: *"Jangdok Foods has uploaded a certification extension letter, verified by Gracera's trust team. The certification is active until [extension date]."*
8. Marcus decides to continue; places a trial order with a contract clause requiring renewed FSSC 22000 before the extension period ends
9. Kim uploads the renewed certificate 3 weeks later; `authenticity_status` returns to `DigitallyVerified`

**Expected resolution:** Deal progresses without cancellation; both parties have a transparent record of the certification gap and resolution. Extension letter is a non-standard document type — trust team review is required, not automatic.

**Test assertions:**
- Nightly job changes `authenticity_status` to `Expired` when `expiry_date < today`
- Active Deal Room with expired cert renders warning banner (non-blocking)
- Uploading an extension letter creates a `supporting_documents` record, not a `certifications` record
- Trust team manual override can set `authenticity_status = 'TrustTeamVerified'` with a custom expiry

---

### CS-2: Trading Company Impersonating a Manufacturer

**Trigger:** A Hong Kong-based trading company registers on Gracera as a "Manufacturer," uploads photos of a Korean factory that is not their own, and gets matched to the same US food buyers as Kim.

**Sequence:**
1. Trading company registers; sets `supplier_type = ['Manufacturer']`; uploads factory photos and a product catalog that is a rebranded version of a public catalog
2. Match engine surfaces the trading company to Marcus and 2 other US food buyers; trading company outranks Kim due to higher completeness score (they filled in all fields)
3. Marcus opens the trading company profile; notices the factory address is in Hong Kong but the catalog photos show a Gochang, South Korea facility — the same address on Kim's profile
4. Marcus flags the profile via "Report this supplier" → selects "Possible misrepresentation — factory photos appear to belong to another supplier"
5. Trust team receives the flag; compares photos with Kim's profile; confirms photo duplication
6. Trading company profile `profile_status` set to `'suspended'`; removed from all active matches
7. Marcus notified: *"The supplier you reported has been reviewed and suspended. Your sourcing request remains active."*
8. Kim is not directly notified (trust team handles it) but the trading company disappears from her competitor landscape
9. Trust team emails trading company: "Re-register as a Trading Company with your own photos and documentation."

**Expected resolution:** Fraudulent supplier removed; affected buyers notified; legitimate supplier (Kim) not disadvantaged. Report flow is accessible and acts within 48 hours.

**Test assertions:**
- "Report this supplier" button accessible on any supplier profile card after introduction accepted
- Report submission creates a `trust_flags` record with `flag_type = 'misrepresentation'`, `reported_by = user_id`, `status = 'open'`
- Admin can set `profile_status = 'suspended'`; suspended profile returns 0 results in match queries
- Buyer who filed the report receives notification when `trust_flags.status` changes to `'resolved'`

---

**Postconditions**

- `supplier_profiles.profile_status = 'active'`
- `supplier_profiles.completeness_score ≥ 0.60`
- ≥ 1 record in `certifications` table with `profile_id` = Kim's supplier profile, `authenticity_status = 'Uploaded'`
- ≥ 1 record in `matches` table linking Kim's supplier profile to a buyer sourcing request
- Coaching card interaction event logged

---

**Test Notes**

- **Fixture required:** Buyer in Food & Beverage / Sauces & Condiments, `country = 'US'`, `preferred_certifications` includes `FSSC 22000`, `order_frequency = 'Monthly'`, `status = 'open'`
- **Fixture required:** Sample catalog PDF (Korean-language, ≥ 5 pages) with extractable product data — use a static test fixture, not a live document
- **SLA assertion:** Match card rendered within 60,000 ms of profile `status` changing to `active`
- **RAG assertion:** After catalog upload, ≥ 5 `supplier_profiles` fields are non-empty that were empty before upload
- **Completeness gate assertion:** Publish API returns `422` when `completeness_score < 0.60`
- **CS-1 nightly job:** Run in test via `POST /admin/jobs/cert-expiry-check` trigger; assert `authenticity_status` changes for certs with past `expiry_date`
- **CS-2 report flow:** `POST /reports/supplier` with `flag_type = 'misrepresentation'`; assert `trust_flags` record created; assert admin suspension sets `profile_status = 'suspended'` and removes profile from match results

---

---

## UC-F02

### Food & Beverage — Buyer: Marcus Webb, Austin, Texas, USA

**Context**

Marcus Webb is the procurement manager at Lone Star Specialty Foods, a regional specialty food distributor supplying independent grocery chains and Asian-concept restaurant groups across Texas and the Southwest. The company imports 40–60 SKUs per year, primarily from Japan and Korea. Marcus is evaluating Gracera after a failed trade show sourcing trip — he spent three days at a food expo and came home with business cards but no qualified suppliers. His key need: Korean hot sauce and gochujang paste, FSSC 22000 certified, Halal preferred, 500–1,000 cases/month, FOB Busan.

**Preconditions**

- No prior Gracera account
- At least 1 active supplier profile exists in Food & Beverage / Sauces & Condiments, `country = 'KR'`, with FSSC 22000 certification, `profile_status = 'active'`
- Platform is not behind a login wall for sourcing request browsing (public pages exist, but posting requires login)

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Finds Gracera via a programmatic SEO page: `/suppliers/sauces-condiments/south-korea/fssc-22000-certified`; reads page showing verified Korean condiment suppliers | Public page rendered with ≥ 3 supplier cards; "Post a sourcing request to reach all of them" CTA prominent |
| 2 | Clicks CTA; registers with business email; selects role "Buyer" | Account created; email verification sent; onboarding proceeds to sourcing request builder (not blank buyer profile first) |
| 3 | Verifies email; lands in sourcing request builder with category pre-selected (Food & Beverage / Sauces, Condiments & Seasonings) from the SEO page context | Category template pre-fills: typical certifications (FSSC 22000, Halal), standard incoterms (FOB, CIF), common units (cases, kg) |
| 4 | System shows certification auto-suggest: *"Buyers importing food ingredients to the US typically require FDA facility registration and FSSC 22000. Halal certification is recommended for Muslim-majority retail channels."* Marcus checks FSSC 22000 and Halal; leaves FDA optional | Auto-suggested certs added to `required_certifications` field; completeness score updates |
| 5 | Fills product details: `product_name = "Korean hot sauce and gochujang paste"`, `quantity_required = 600`, `quantity_unit = "cases"`, `order_frequency = "Monthly"`, `preferred_incoterms = ["FOB"]`, `preferred_supplier_countries = ["KR"]` | Fields saved; completeness tracking updates |
| 6 | Writes `ideal_supplier_description` (200 words describing ideal factory: FSSC 22000, Halal, 5+ years exporting, willing to trial 300 cases before full contract) | Completeness score reaches 72% |
| 7 | System shows live match preview: *"Your current request matches 8 suppliers. Adding 'minimum 5 years export experience' narrows to 5 higher-quality matches."* Marcus keeps broader setting | Live count displayed; Marcus sees the trade-off and chooses breadth |
| 8 | Publishes sourcing request | `sourcing_requests.status = 'open'`; match run triggered; request visible to matched suppliers |
| 9 | Views first 5 match results within 1 hour | Match cards shown with: supplier name, location, certifications held, product lines, completeness score, response time commitment |
| 10 | Opens top match (Jangdok Foods); reviews profile including FSSC 22000 and Halal badges, product images, pricing range, export market history | Full supplier profile page rendered; "Request Introduction" button available |
| 11 | Requests introduction to Jangdok Foods | Introduction request sent; both parties notified; messaging unlocked pending mutual acceptance |
| 12 | Jangdok Foods accepts introduction | Contact details revealed to both parties; Deal Room created; Marcus and Kim can now message directly |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Marcus publishes sourcing request; no matches found within 24 hours | Prospecting Agent fires automatically; Marcus sees: *"We're reaching out to 3 additional suppliers in South Korea who aren't yet on Gracera."* Supplier invitation emails sent |
| AF-2 | Marcus sets `required_certifications` to both FSSC 22000 and US FDA registration; no suppliers hold both | Platform shows 0 matches with explanation: *"No suppliers currently hold both FSSC 22000 and FDA facility registration in Sauces & Condiments. Removing FDA registration reveals 8 matches."* One-click to relax the filter |
| AF-3 | Marcus tries to view a supplier's contact details without accepting an introduction | Contact details hidden; "Request Introduction to view contact" prompt shown |
| AF-4 | Marcus closes the browser mid-way through filling the sourcing request | Draft auto-saved; on next login, "Continue your draft sourcing request" banner shown |
| AF-5 | Marcus's `required_certifications` includes a cert no supplier in the category holds | Matching engine returns 0; platform suggests the nearest available certification alternative in the category |
| AF-6 | A matched supplier accepts the introduction but then does not respond to any messages for 7 days | At 72 hours of silence, Marcus sees a "Nudge supplier" option; platform sends a polite reminder on Marcus's behalf; at 7 days, platform surfaces: *"This supplier hasn't responded. Here are 3 other active suppliers from your match list."* |
| AF-7 | One matched supplier has a completed deal history with a 4.1/5 rating; the sole negative review states "short-shipped by 12% on first order, resolved after 3 weeks" | Review is visible to Marcus on the supplier's profile before he requests an introduction; review text, rating, and resolution note all rendered; Marcus can make an informed decision |
| AF-8 | Marcus assumes all suppliers will quote DDP (delivered to his warehouse in Austin); the accepted supplier quotes FOB Busan — Marcus's landed cost turns out to be 22% higher than budgeted after adding freight, insurance, and import duty | During the RFQ phase, AI Price Compass (Phase 2) surfaces an estimated landed cost breakdown; platform prompts Marcus to confirm preferred incoterm before sending RFQ; mismatch flagged: *"Supplier quoted FOB. Your preferred incoterm is DDP. Confirm with supplier or adjust your budget estimate."* |

---

**Complex Multi-Step Scenarios**

### CS-1: Trial Order Short-Shipped — Dispute Filed

**Trigger:** Marcus places a 500-case trial order with Jangdok Foods. The shipment arrives and Marcus counts 441 cases — 11.8% short.

**Sequence:**
1. Deal reaches `Goods Shipped` milestone; supplier marks shipment dispatched with AWB number
2. Marcus receives shipment; logs into Deal Room; marks `Goods Received`; attaches a photo of the packing list showing 441 cases
3. Marcus initiates dispute: selects `Dispute type: Short shipment`; enters claimed quantity (500) vs received quantity (441); uploads packing list photo as evidence
4. Platform sets deal status to `Disputed`; both parties notified; a 48-hour cooling-off period begins during which both parties are encouraged to resolve directly
5. Kim acknowledges the shortage within 24 hours; claims it was a warehouse packing error; offers to ship the remaining 59 cases at no cost with the next order or issue a credit note
6. Marcus accepts the credit note resolution; both parties mark dispute as `Resolved — Agreed`
7. Platform closes the dispute; `deals.status` returns to `Active`; dispute record retained for trust team audit trail
8. After deal closes, Marcus's first review is posted: 4/5 stars; note: *"Short-shipped on first order but resolved quickly and professionally."*
9. Review held until Kim also submits her review of Marcus (double-blind); both released simultaneously

**Expected resolution:** Dispute resolved without trust team mediation. Review system creates accountability without requiring a perfect first transaction.

**Test assertions:**
- `disputes` record created with `type = 'short_shipment'`, `status = 'open'`
- Deal `status = 'Disputed'` blocks progression to `Completed` until dispute resolved or escalated
- 48-hour cooling-off period enforced: escalation option not available until `created_at + 48h`
- `reviews` record has `visible = false` until both parties submit; toggled to `true` simultaneously

---

### CS-2: Halal Requirement Was an Assumption — Mid-Process Correction

**Trigger:** Marcus checked "Halal required" based on his assumption that his restaurant clients needed it. After 3 introduction acceptances, one of his restaurant clients clarifies they don't actually require Halal-certified product.

**Sequence:**
1. Marcus has 3 active introductions with Korean suppliers, all Halal-certified, based on his sourcing request
2. Marcus updates his sourcing request: removes Halal from `required_certifications`; moves it to `preferred_certifications`
3. Match engine re-runs on updated request; 7 additional Korean suppliers (non-Halal) now surface
4. Marcus's 3 existing introductions are unaffected — they remain open
5. Marcus sends a message to his existing 3 suppliers: *"Update: Halal is now preferred but not required for this order. Happy to continue with all of you."*
6. Marcus now has 3 established introductions plus 7 new potential matches; he sends 2 additional introduction requests to the highest-ranked new matches
7. Marcus now has 5 concurrent introduction threads; manages them from the matches dashboard

**Expected resolution:** Sourcing request is editable mid-process without breaking existing introductions. Re-running match on an updated request expands the result set correctly.

**Test assertions:**
- Editing `required_certifications` on a published sourcing request triggers a new match run within 5 minutes
- Existing `matches` records with accepted introductions are not deleted or reset when sourcing request is edited
- New match run creates additional `matches` records for suppliers previously excluded by the removed cert filter
- Buyer can hold up to 5 concurrent open introduction threads per sourcing request (configurable limit)

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.profile_status = 'active'`
- ≥ 1 record in `matches` table
- If UC-F01 supplier fixture is present: `matches` record links Marcus's sourcing request to Jangdok Foods
- `deals` record created (status `Introduction`) if both parties accept

---

**Test Notes**

- **Fixture required:** Active supplier in Food & Beverage / Sauces & Condiments, `country = 'KR'`, FSSC 22000 + Halal certs, `profile_status = 'active'`, completeness ≥ 70%
- **SEO page fixture:** `/suppliers/sauces-condiments/south-korea/fssc-22000-certified` must render with ≥ 3 supplier cards (can use seeded data)
- **SLA assertion:** First 5 match cards rendered within 3,600,000 ms (1 hour) of sourcing request publish
- **Privacy assertion:** Supplier email field is `null` / hidden in match card API response before introduction accepted
- **Draft persistence assertion:** Incomplete sourcing request saved on navigation away; restored on next session
- **CS-1 dispute flow:** `POST /deals/:id/disputes` creates `disputes` record; assert deal `status = 'Disputed'`; assert escalation unavailable before 48h window; assert `reviews.visible` toggled only after both parties submit
- **CS-2 re-match:** `PATCH /sourcing-requests/:id` with updated `required_certifications`; assert new match run triggered; assert existing accepted introductions unaffected

---

---

## UC-E01

### Electronics & Components — Supplier: Chen Wei, Shenzhen, China

**Context**

Chen Wei is the general manager of Xincheng Electronics, a 120-person PCB assembly (PCBA) contract manufacturer in Shenzhen's Longhua district. The factory holds ISO 9001:2015, IPC-A-610 Class II/III certification, and RoHS compliance. Xincheng currently serves domestic Chinese OEMs and two mid-size European clients they acquired through a trade show referral. Chen wants to systematically grow the European customer base — specifically targeting industrial automation, medical device (non-implantable), and IoT product companies with annual PCBA spend of $200K–$2M. He has used Alibaba but finds the buyer quality poor. His English is strong; business development is handled by his export manager, Liu Yang.

**Preconditions**

- No prior Gracera account
- Factory has ISO 9001 and IPC-A-610 certificates (both valid, uploaded as PDFs)
- At least 1 open buyer sourcing request in Electronics / PCB & PCBA, `preferred_supplier_countries` includes `CN`, requiring ISO 9001

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Liu Yang registers on Chen's behalf; selects "Supplier"; primary category "Electronics & Components > PCB & PCBA" | Account created; wizard launches with catalog upload prompt |
| 2 | Uploads Xincheng capability statement PDF (includes process capabilities, certifications, equipment list, sample photos) | RAG pipeline extracts: `company_name`, `company_description`, `certifications` (ISO 9001, IPC-A-610 detected), `production_capacity_monthly`, `categories`, `target_geographies` (partially) |
| 3 | Reviews pre-filled data; adds missing fields: `custom_manufacturing = true`, `target_customer_types = [OEM, "E-commerce Seller"]` corrected to `[OEM, "Direct Consumer Brand"]`, `preferred_deal_types = ["Annual contract", "Trial order"]`, `ideal_customer_description` (200 words: industrial automation/IoT focus, $200K–$2M annual spend, CE/UL compliance a plus) | Completeness reaches 71% |
| 4 | Uploads ISO 9001 and IPC-A-610 certificate PDFs | Certificates queued; ISO 9001 issuing body (TÜV Rheinland) is on the digital verification list — platform queries TÜV API; within 2 minutes, `authenticity_status` updates to `DigitallyVerified` |
| 5 | Adds 3 product lines: SMT Assembly (up to 8-layer, 0201 components), THT Assembly, and PCB Fabrication; fills MOQ, lead times, price ranges for each | Product line completeness contributes to overall score; reaches 78% |
| 6 | Sets `availability_status = 'Available'`; `response_time_hours = 24` | Availability badge shown on profile; boosts rank in searches filtered by "Available Now" |
| 7 | Publishes profile | `profile_status = 'active'`; match run triggered |
| 8 | Views match results | ≥ 1 match card within 60 seconds; European buyers in Electronics / PCB & PCBA shown |
| 9 | Reviews top match: a German industrial automation buyer sourcing custom SMT assemblies | Match card shows buyer's sourcing volume, required certs, destination country; IPC-A-610 Class III flag highlighted as a match point |
| 10 | Opens coaching card; sends introduction message tailored to the buyer's IPC-A-610 Class III requirement | Message sent; introduction pending buyer acceptance |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | TÜV API is unavailable during certificate verification | `authenticity_status` remains `Uploaded`; verification retried automatically every 4 hours; Liu Yang notified when status updates |
| AF-2 | Liu Yang attempts to publish with `availability_status` not set | Profile publishes without availability signal; availability badge absent; nudge shown: "Set your availability status to appear in 'Available Now' filters" |
| AF-3 | A buyer sourcing request requires UL certification, which Xincheng doesn't hold | Match excluded from results requiring UL; match may still appear in results where UL is preferred but not required, with a gap flag |
| AF-4 | Liu Yang adds a fourth product line after initial publish | Profile re-scored; new match run triggered automatically; new matches appear within 60 seconds |
| AF-5 | Availability status not updated within 14 days | Status auto-resets to `LimitedAvailability`; Liu Yang receives a weekly availability update reminder email |
| AF-6 | A matched European buyer requests a third-party factory audit before placing an order; the audit reveals that Xincheng subcontracts wave soldering to a third-party shop not covered by their ISO 9001 scope | Audit report uploaded to Deal Room by buyer; trust team notified; Xincheng given 30 days to either extend ISO 9001 scope to cover the subcontractor or disclose the subcontracting arrangement openly on their profile; buyer holds the deal pending resolution |
| AF-7 | A matched buyer asks Xincheng to sign an NDA before sharing Gerber files for a new product; Liu Yang has never handled an NDA and doesn't know what to do | Platform surfaces: *"This buyer has requested an NDA. Gracera offers a standard mutual NDA template — review and sign in the Deal Room, or upload your own."*; Liu Yang uses the platform NDA template; both parties sign via e-signature (Phase 3 feature) |
| AF-8 | Liu Yang accidentally tags the profile under "Consumer Electronics" in addition to "PCB & PCBA", attracting consumer electronics resellers and drop-shippers who are not target customers | Xincheng receives 12 introduction requests in 3 days from resellers asking for retail pricing and small quantities; Liu Yang removes the Consumer Electronics tag; new match run excludes the irrelevant buyer type; existing unwanted introduction requests can be declined with a reason code ("Not our target customer") |

---

**Complex Multi-Step Scenarios**

### CS-1: Component Shortage Extends Lead Time Mid-RFQ

**Trigger:** Xincheng receives an RFQ from Tobias for a custom SMT assembly. During the quoting process, a key IC component (STM32 MCU) goes on allocation — lead time jumps from 8 weeks to 22 weeks from their distributor.

**Sequence:**
1. Tobias sends an RFQ; Xincheng is preparing a quote
2. During quote preparation, Liu Yang discovers the MCU is on allocation; lead time for the quoted assembly balloons from 6 to 22 weeks
3. Liu Yang submits the quote with an asterisk: *"Lead time is 22 weeks due to STM32 allocation. We can reduce to 8 weeks if you can supply the MCU directly (consignment arrangement)."*
4. Tobias reviews the quote in the Deal Room; AI-Brain coaching: *"This is a component availability issue, not a factory capacity issue. A consignment arrangement (you supply the MCU, they assemble) is standard in industrial electronics. Alternatively, ask if they can substitute an STM32-compatible MCU."*
5. Tobias responds: asks about MCU substitution options
6. Liu Yang provides 3 alternative MCU part numbers that are pin-compatible; attaches comparison datasheet
7. Tobias reviews with his engineering team; approves one alternative; updates the RFQ
8. Quote resubmitted with revised lead time of 7 weeks using the alternative MCU
9. Deal proceeds to contract

**Expected resolution:** Quote counter-offer flow accommodates attachments and conditional terms. AI-Brain coaching is context-specific to the deal stage and industry.

**Test assertions:**
- Quote submission accepts a `notes` field with conditional terms; rendered distinctly from the main quote table
- Counter-offer creates a new `quotes` version record; prior version retained in Deal Room history
- File attachments (datasheet PDF) accepted in Deal Room messages; stored in Oracle Cloud Object Storage; accessible to both parties
- AI-Brain response in Deal Room context includes the deal's current stage and quote data in the prompt context

---

### CS-2: Existing Customer Conflict — Competitor Appears as a Match

**Trigger:** Xincheng's largest existing customer (an EU industrial automation company) asks Xincheng to not manufacture for any direct competitors. A direct competitor then appears as a Gracera match for Xincheng.

**Sequence:**
1. Xincheng has an active deal with CustomerA (EU industrial automation company) that includes an informal exclusivity request (verbal, not contractual)
2. CompetitorB (also EU industrial automation) appears as a strong match on Gracera; Gracera sends Xincheng an introduction notification
3. Liu Yang is unsure whether to accept the introduction; asks AI-Brain: *"We have an existing customer who asked us not to supply their competitors. Do we have to comply? They never put it in a contract."*
4. AI-Brain responds: *"Without a written exclusivity clause in your contract, you are not legally obligated to decline. However, your existing customer relationship may be at risk. Options: (1) Accept the introduction and disclose to CustomerA that you work with multiple clients; (2) Decline and use this as leverage to negotiate a formal exclusivity fee with CustomerA; (3) Accept but segment production lines to prevent IP cross-contamination. This is a business decision, not a platform rule."*
5. Liu Yang declines the introduction with reason code: "Conflict with existing customer arrangement"
6. CompetitorB's introduction is declined; Gracera surfaces the next-best match for CompetitorB from other suppliers
7. Liu Yang contacts CustomerA and proposes formalising the exclusivity arrangement with a fee; CustomerA agrees to add a written exclusivity clause worth $15K/year

**Expected resolution:** Platform does not adjudicate exclusivity decisions — it provides tools (decline with reason, AI-Brain guidance) and lets the supplier decide. Declined introduction is logged; CompetitorB is not penalised.

**Test assertions:**
- Introduction can be declined with a `reason_code`; valid codes include `'conflict_of_interest'`, `'not_target_customer'`, `'capacity_unavailable'`, `'other'`
- Declined introduction sets `matches.status = 'declined'`; buyer (CompetitorB) notified with: *"This supplier is not available for new introductions at this time."*
- AI-Brain query in Deal Room context returns a response; response does not constitute legal advice (disclaimer appended)
- Declined introduction does not count against supplier's response rate metric

---

**Postconditions**

- `supplier_profiles.profile_status = 'active'`
- `certifications` table: ISO 9001 record with `authenticity_status = 'DigitallyVerified'` (if TÜV API available), IPC-A-610 with `authenticity_status = 'Uploaded'`
- `availability_status = 'Available'`
- ≥ 1 match record in `matches` table

---

**Test Notes**

- **Fixture required:** Open buyer sourcing request, Electronics / PCB & PCBA, `preferred_supplier_countries = ['CN']`, `required_certifications` includes `ISO 9001`
- **TÜV API mock:** Integration test uses a mock; E2E test uses a stubbed endpoint returning `DigitallyVerified`
- **Availability reset assertion:** Simulate 15-day gap since `availability_updated_at`; verify `availability_status` changes to `LimitedAvailability` in next scheduled job run
- **Product line assertion:** Each `product_lines` entry has `moq`, `lead_time_days`, and `sample_available` fields populated
- **CS-1 quote versioning:** Each quote submission creates a new `quotes` record with `version` incremented; previous version `status = 'superseded'`
- **CS-2 decline codes:** `PATCH /matches/:id/decline` with `reason_code`; assert `matches.status = 'declined'`; assert buyer notification sent; assert supplier response rate metric excludes declined introductions

---

---

## UC-E02

### Electronics & Components — Buyer: Tobias Braun, Munich, Germany

**Context**

Tobias Braun is the CPO (Chief Procurement Officer) at Steuerwerk GmbH, a 45-person industrial automation company in Munich that designs and sells custom control panels for factory floor applications. They outsource PCBA manufacturing — currently using a single supplier in the Czech Republic whose lead times have grown from 6 to 14 weeks. Tobias needs a second qualified PCBA source: SMT assembly, 6-layer boards, 0402 components, IPC-A-610 Class II minimum, RoHS compliant, CE declaration support. Annual volume ~$400K. He heard about Gracera from a procurement community forum.

**Preconditions**

- No prior Gracera account
- At least 1 active supplier profile in Electronics / PCB & PCBA with ISO 9001, IPC-A-610, RoHS compliance, `profile_status = 'active'`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Registers; selects "Buyer"; primary industry "Electronics & Components" | Account created; email verified; sourcing request builder launches |
| 2 | Selects category "Electronics & Components > PCB & PCBA"; category template pre-fills: standard certifications (ISO 9001, IPC-A-610, RoHS), standard incoterms (DAP, DDP), common units (panels, units) | Template applied; Tobias reviews and adjusts |
| 3 | Certification auto-suggest fires: *"Buyers importing electronic assemblies to Germany typically require RoHS compliance and a CE Declaration of Conformity support letter."* Tobias adds both | `required_certifications` updated |
| 4 | Fills product requirements: 6-layer SMT, 0402 minimum component size, IPC-A-610 Class II min, lead time ≤ 6 weeks; sets `quantity_required = 500`, `quantity_unit = "panels"`, `order_frequency = "Quarterly"`, `estimated_annual_volume = 2000` | Fields saved |
| 5 | Writes `ideal_supplier_description` (250 words: established PCBA house, 10+ years, ≥ 50 employees, experience with industrial control electronics, willing to provide first-article inspection report) | Completeness score reaches 76% |
| 6 | Views live match preview: *"Your request matches 11 suppliers. Requiring IPC-A-610 Class III (instead of Class II) narrows to 4."* Tobias stays with Class II | Trade-off understood; 11 matches retained |
| 7 | Publishes sourcing request | `status = 'open'`; match run triggered |
| 8 | First 5 match cards rendered within 1 hour | Cards show: supplier country, size, key certs, product line summary, availability status, response time |
| 9 | Tobias filters by "Available Now" | Results filtered to suppliers with `availability_status = 'Available'`; 3 of 5 qualify |
| 10 | Opens Xincheng Electronics match card; views TÜV-verified ISO 9001 badge, IPC-A-610 Class III (exceeds his requirement), RoHS compliance | "DigitallyVerified" badge displayed on ISO 9001; match rationale text: *"Xincheng holds IPC-A-610 Class III, which exceeds your Class II requirement, and has documented CE declaration experience."* |
| 11 | Views Xincheng's payment track record | No completed deals yet on platform (Xincheng is new); "New Supplier" badge shown with note: "No on-platform deal history yet" |
| 12 | Requests introduction to Xincheng | Introduction request sent; both parties notified |
| 13 | Introduction accepted by Xincheng | Contact details revealed; Deal Room created; Tobias can send RFQ |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Tobias sets `max_lead_time_days = 30`; most matching suppliers have 35–45 day lead times | Matching engine relaxes soft filter; suppliers shown with lead time displayed; badge: *"Lead time exceeds your target — confirm before proceeding"* |
| AF-2 | No introductions accepted by any supplier within 24 hours | Tobias notified; Prospecting Agent identifies 2 additional off-platform PCB factories meeting criteria; invitation emails sent; Tobias sees status update |
| AF-3 | Tobias wants to send the same RFQ to multiple suppliers | Multi-supplier RFQ flow: up to 5 suppliers selected; single RFQ sent to all; responses collected in side-by-side comparison view (Phase 3 feature) |
| AF-4 | A matched supplier's RoHS compliance certification expires mid-sourcing-process | Tobias and affected supplier both notified; match card shows "Certification Expired" warning; supplier prompted to upload renewal |
| AF-5 | Tobias's company email domain fails business registration lookup | Verification flagged; Tobias prompted to upload a business registration document; account access continues at "Basic" level until document reviewed |
| AF-6 | Tobias receives a quote where the price is 35% below the other quotes — suspiciously low | Match card for this supplier shows 0 completed deals, 0 reviews, profile created 2 days ago; AI-Brain coaching: *"This quote is significantly below market rate. This can indicate a new supplier building their book, a trading company (not manufacturer) pricing aggressively, or a bait-and-switch. Request a factory audit photo and their last 3 customer references before proceeding."* |
| AF-7 | Tobias discovers mid-evaluation that a matched supplier's IPC-A-610 Class III certification applies to their incoming inspection process, not their production process — a critical distinction | Tobias asks in the Deal Room; supplier confirms the misunderstanding; Tobias flags the profile description as misleading via "Report inaccuracy"; trust team reviews; supplier updates profile to clarify scope; Tobias's sourcing request re-matched |
| AF-8 | Tobias needs an NPI (new product introduction) run of 50 units before committing to a 500-unit production order; the matched supplier's MOQ is 500 units | Tobias raises this in the Deal Room; supplier offers an NPI pricing tier ($X/unit for ≤100 pcs, non-recurring engineering fee of $800) outside the standard product line MOQ; terms negotiated via counter-offer flow |

---

**Complex Multi-Step Scenarios**

### CS-1: Approved Supplier Doubles Lead Time After Order Placement

**Trigger:** Tobias evaluates 3 suppliers, selects Xincheng, signs a PO for 500 PCBAs at 6-week lead time. Four weeks into production, Liu Yang notifies Tobias that a machine breakdown has pushed the delivery to 14 weeks.

**Sequence:**
1. Deal at `Active — In Production` milestone; Tobias has a product launch scheduled around the 6-week delivery
2. Liu Yang posts a Deal Room message: *"Due to reflow oven breakdown, our delivery is delayed by 8 weeks. New ETA: [date]. We apologise and will prioritise your order once repaired."*
3. Tobias escalates to Gracera dispute flow: `Dispute type: Delivery delay`; claims the delay will cause a missed product launch and requests a partial refund or expedite fee
4. 48-hour cooling-off: Tobias and Liu Yang negotiate directly; Liu Yang offers to expedite via a partner factory (also ISO 9001) for no additional cost
5. Tobias asks: which partner factory? Is it covered by Xincheng's ISO 9001 scope?
6. Liu Yang confirms the partner factory has its own ISO 9001 cert; shares the certificate; uploads it to the Deal Room
7. Tobias reviews; accepts the expedite via partner factory; marks dispute as `Resolved — Agreed`
8. Tobias notes the subcontracting arrangement for future reference; adds a clause to his next order requiring advance notification of any subcontracting

**Expected resolution:** Dispute resolved without Gracera mediation. Deal Room provides the communication thread and document trail that makes resolution possible without email chains.

**Test assertions:**
- `disputes` record created with `type = 'delivery_delay'`; cooling-off period blocks escalation before 48h
- Dispute resolution note saved when both parties mark `Resolved — Agreed`
- File uploaded to Deal Room during dispute retained in `deal_documents` table linked to the dispute record
- Resolved dispute does not negatively affect supplier's star rating unless buyer submits a review explicitly

---

### CS-2: Post-Approval Supplier Capacity Change — Tobias Needs a Backup

**Trigger:** Xincheng becomes fully booked after Tobias's first order completes successfully. Lead times are quoted at 18 weeks for the next order. Tobias needs a backup supplier for business continuity.

**Sequence:**
1. Tobias returns to Gracera for his second order; Xincheng is now `FullyBooked` with `next_available_date` 18 weeks away
2. Tobias's product launch schedule requires 8-week lead time; Xincheng won't work for this order
3. Tobias reopens his original sourcing request (was `Closed`); re-activates it with updated parameters: `availability_required = true`, `max_lead_time_days = 60`
4. Match engine re-runs; excludes FullyBooked suppliers; surfaces 4 new matches
5. Tobias has existing deal history with Xincheng (Verified Deal Network); the history is visible to new matched suppliers as a trust signal: *"This buyer has 1 completed deal on-platform — electronics PCBA, Q4 order."*
6. Two new suppliers respond quickly, seeing Tobias's verified buyer history; one offers to match Xincheng's pricing to win the account
7. Tobias places the second order with Supplier B while keeping Xincheng as his primary long-term supplier for future capacity
8. Xincheng is notified that Tobias opened a new sourcing request; platform does not reveal which supplier won — only that the buyer is active

**Expected resolution:** Gracera supports dual-sourcing strategy. Verified deal history functions as a buyer trust signal. Re-opening a closed sourcing request is a first-class flow.

**Test assertions:**
- `sourcing_requests.status` can transition from `Closed` back to `Open` via re-activate action
- Match engine excludes suppliers with `availability_status = 'FullyBooked'` when `availability_required = true` filter is applied
- Buyer's completed deal count and category are visible to new matched suppliers on the buyer's profile card (anonymised deal detail — no supplier names revealed)
- Existing supplier (Xincheng) does not receive notification of which specific supplier won a subsequent order

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles` record with `primary_contact_role = 'cpo'`
- ≥ 1 match record in `matches` table
- If UC-E01 supplier fixture present: introduction request record created

---

**Test Notes**

- **Fixture required:** Active PCBA supplier, `country = 'CN'`, ISO 9001 + IPC-A-610 + RoHS, `availability_status = 'Available'`, `response_time_hours ≤ 48`
- **Filter assertion:** "Available Now" filter returns only suppliers where `availability_status = 'Available'`; suppliers with `LimitedAvailability` excluded
- **Match rationale assertion:** Match card renders a non-empty rationale string referencing at least one matched certification
- **Multi-supplier RFQ:** Phase 3; mark as `@skip` in Phase 1/2 test suite with `// Phase 3` comment
- **CS-1 dispute delivery delay:** `POST /deals/:id/disputes` with `type = 'delivery_delay'`; assert cooling-off enforced; assert deal documents linked to dispute record
- **CS-2 sourcing request reactivation:** `PATCH /sourcing-requests/:id` with `status = 'open'`; assert new match run triggered; assert FullyBooked suppliers excluded when filter applied

---

---

## UC-A01

### Apparel & Textiles — Supplier: Farhan Hossain, Dhaka, Bangladesh

**Context**

Farhan Hossain is the export sales manager at EcoThread Garments, a 280-person woven garment factory in Ashulia, Dhaka. The factory holds GOTS (Global Organic Textile Standard) certification, OEKO-TEX Standard 100, and a WRAP platinum rating. They specialise in women's activewear and athleisure in organic cotton and recycled polyester blends, with MOQ of 300 pieces per style. Farhan has been exporting to the US for 6 years but wants to break into the UK and EU sustainable fashion market — specifically direct-to-consumer brands that do private label. He joined Gracera after an existing UK customer mentioned they found their previous Bangladesh supplier there.

**Preconditions**

- No prior Gracera account
- EcoThread holds GOTS (valid), OEKO-TEX Standard 100 (valid), WRAP Platinum (valid)
- At least 1 open buyer sourcing request in Apparel / Sportswear & Activewear or Apparel / Women's Clothing, `preferred_supplier_countries` includes `BD`, with GOTS or OEKO-TEX required, `private_label_needed = true`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Farhan registers; selects "Supplier"; selects categories "Apparel & Textiles > Sportswear & Activewear" and "Apparel & Textiles > Women's Clothing" | Account created; wizard launches; catalog upload prompt shown |
| 2 | Uploads EcoThread's lookbook PDF and capability overview (includes fabric compositions, cert logos, size range, lead time table) | RAG extracts: `company_name`, `company_description`, `certifications` (GOTS, OEKO-TEX, WRAP detected), `private_label = true`, `custom_manufacturing = true`, `target_geographies` (partially — US detected) |
| 3 | Corrects `target_geographies` to add UK, Germany, France, Netherlands, Sweden; fills `ideal_customer_description` (200 words: sustainable DTC brands, 300–2,000 pcs/style, annual 5,000–30,000 pcs) | Completeness updates |
| 4 | Uploads GOTS, OEKO-TEX, and WRAP certificate files | GOTS issuing body (Control Union) has API integration — `authenticity_status` updates to `DigitallyVerified` within 2 minutes; OEKO-TEX and WRAP queued for trust team review |
| 5 | Adds 2 product lines: "Women's Activewear (Woven)" and "Athleisure Tops & Bottoms"; fills MOQ (300 pcs/style), lead time (65–75 days), price range ($8–$18 FOB/piece) | Product line section complete |
| 6 | Adds notable customers: 2 US brands (without full names — marks as "Confidential, available on request") | Platform accepts confidential notation; shows "References available on request" badge on profile |
| 7 | Publishes profile | `profile_status = 'active'`; completeness = 77%; match run triggered |
| 8 | Match results show 3 UK and EU buyers | Match cards include private label flag, buyer type (DTC brand), sourcing volume, certifications required |
| 9 | AI-Brain coaching card for top UK match: *"Sophie Laurent is the founder with full authority. She's looking for a long-term production partner, not a spot order. Lead with your GOTS certification and capacity for brand exclusivity — don't quote price in your first message."* | Card shown before compose box |
| 10 | Sends tailored first message referencing GOTS certification and exclusivity capability | Message sent; introduction pending |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Farhan uploads a GOTS certificate that expired 3 months ago | System detects past expiry date; certificate saved as `Expired`; excluded from GOTS matching filters; warning displayed; Farhan prompted to upload renewal |
| AF-2 | Buyer's sourcing request requires BSCI audit, which EcoThread doesn't hold | Match shown with gap flag: *"Buyer requires BSCI audit — not currently on your profile"*; shown as partial match with lower score |
| AF-3 | 72 hours pass, no introductions accepted | Safety net fires: benchmark comparison shows top Activewear suppliers in BD have on average 4.2 certifications vs EcoThread's 3; suggestion to add GRS (Global Recycled Standard) to unlock recycled-polyester buyers |
| AF-4 | Farhan attempts to add a 6th product category (beyond the allowed 5) | UI prevents selection; tooltip: "Maximum 5 categories per supplier profile" |
| AF-5 | Farhan updates MOQ mid-campaign (reduces from 300 to 200 pcs/style) | Profile re-scored; match run re-triggered; new buyers meeting lower MOQ threshold now surface |
| AF-6 | Farhan's GOTS certificate is due for renewal; the certification body's audit is scheduled but the renewed certificate won't be issued for 10 weeks; two matched buyers ask for an updated certificate | Platform shows "GOTS — Renewal in Progress" status (trust team verified via Control Union audit confirmation letter); buyers see the in-progress status with an estimated renewal date; matching continues using the existing cert until it expires |
| AF-7 | A "buyer" contacts Farhan via the platform but turns out to be a sourcing agent who misrepresented themselves as a brand; they ask highly specific questions about minimum prices and factory capacity that suggest competitor intelligence gathering | Farhan reports the profile via "Report this buyer"; trust team reviews; buying company profile shows no business registration, no completed deals, and generic company description — classic intelligence-gathering profile; profile suspended; Farhan's information not shared further |
| AF-8 | A matched UK buyer requests colorway exclusivity on a specific organic cotton blend for a season; Farhan's factory policy is exclusivity is available only for orders ≥ 5,000 pcs/style per season; the buyer's order is 800 pcs/style | Farhan uses the counter-offer flow to propose a "limited exclusivity" arrangement: exclusive for 90 days within UK market only, for orders ≥ 2,000 pcs/style — a negotiated middle ground; offer made via structured counter-offer in Deal Room |

---

**Complex Multi-Step Scenarios**

### CS-1: Sample Delayed — Factory Deprioritises Small Order

**Trigger:** Sophie requests 3 samples per style (9 samples total). EcoThread acknowledges the request on day 1 but sends no samples for 4 weeks. A larger existing customer's bulk order took priority.

**Sequence:**
1. Sample request logged in Deal Room; Farhan confirms sample dispatch within 2 weeks
2. Week 2 passes; no dispatch confirmation; Sophie sends a follow-up message
3. Farhan apologises; explains a bulk order from an existing customer absorbed all sample-making capacity; new estimated dispatch: 2 more weeks
4. Sophie is frustrated; she has a product launch timeline; she considers withdrawing
5. Platform surfaces: *"You have 3 other matched suppliers in Apparel / Sportswear & Activewear who haven't been contacted yet. Would you like to request samples from them as a backup?"*
6. Sophie requests samples from a second supplier (backup) while keeping EcoThread engaged
7. EcoThread dispatches samples at week 4; Sophie receives them at week 5
8. Sophie also receives samples from the backup supplier at week 5
9. Sophie compares both sample sets; EcoThread's fabric quality is superior; she chooses EcoThread but negotiates a contractual sample turnaround SLA for future orders (14 days guaranteed) as a condition of her first order

**Expected resolution:** Platform actively suggests alternatives when a deal is stalling. Buyer is not trapped in a single introduction. Negotiated SLA becomes a Deal Room milestone.

**Test assertions:**
- If Deal Room has no supplier activity for 7 days after a milestone is logged, platform triggers a "stalled deal" notification to buyer
- Buyer can initiate a new introduction from the same sourcing request while another introduction is active (parallel introductions permitted up to the concurrency limit)
- Deal Room milestone can include custom text fields for negotiated terms (sample SLA, contractual commitments)

---

### CS-2: Subcontracting Discovery — Order Sent to a Different Factory

**Trigger:** Sophie places her first production order with EcoThread. 5 weeks into the 8-week lead time, she asks for a factory visit (she's visiting Dhaka for another supplier). Farhan's response reveals the order was subcontracted to a secondary factory in Narayanganj without Sophie's knowledge.

**Sequence:**
1. Sophie messages Farhan: *"I'm visiting Dhaka on [date] — can I visit the factory to see my order in production?"*
2. Farhan's response mentions the Narayanganj factory address — Sophie doesn't recognise it; it's not EcoThread's registered address in her deal paperwork
3. Sophie asks directly: *"Is my order being made at a different factory?"*
4. Farhan confirms: due to capacity, her order was subcontracted to a trusted partner factory in Narayanganj; the partner is also GOTS-certified
5. Sophie files a dispute: `Dispute type: Undisclosed subcontracting`; uploads her original contract which does not authorise subcontracting
6. Platform escalates to trust team (undisclosed subcontracting is a Level 2 trust violation — more serious than a standard buyer-seller dispute)
7. Trust team contacts Farhan; Farhan provides the Narayanganj factory's GOTS certificate and audit records
8. Trust team determines: subcontract factory is legitimate and certified, but Sophie was not informed as required; finding: `procedural violation, no fraud`
9. Resolution: Sophie may (a) accept the goods from the Narayanganj factory with a 5% discount Farhan agrees to, or (b) cancel and receive a full refund with Farhan absorbing the cost
10. Sophie accepts option (a); EcoThread's profile receives a trust note: *"Supplier must obtain buyer consent before subcontracting per platform policy."*

**Expected resolution:** Platform policy on subcontracting is enforced; supplier faces a consequence proportional to the violation; buyer has a genuine choice. Trust notes are visible on supplier profiles to future buyers.

**Test assertions:**
- `disputes` record with `type = 'undisclosed_subcontracting'` escalates to trust team automatically (not subject to the 48h cooling-off self-resolution window)
- Trust team can add a `trust_note` to a supplier profile; note visible to buyers viewing the profile after the case is resolved
- Supplier's trust score or badge downgraded after a Level 2 violation (trust team action, not automated)
- Buyer cancellation with full refund creates a `refund_request` record; deal marked `Cancelled — Supplier Fault`

---

**Postconditions**

- `supplier_profiles.profile_status = 'active'`, `private_label = true`, `custom_manufacturing = true`
- GOTS cert: `authenticity_status = 'DigitallyVerified'`; OEKO-TEX + WRAP: `authenticity_status = 'Uploaded'`
- `target_geographies` includes at least UK and one EU country
- ≥ 1 match record in `matches` table

---

**Test Notes**

- **Fixture required:** Buyer sourcing request, Apparel / Sportswear & Activewear, `country = 'GB'`, `private_label_needed = true`, `required_certifications` includes `GOTS`, `max_moq ≥ 300`
- **Control Union API mock:** Returns `DigitallyVerified`; test stub; real integration test in CI with VCR cassette
- **Expired cert assertion:** Certificate with `expiry_date` in the past renders with "Expired" badge; excluded from cert-filtered match queries
- **MOQ re-match assertion:** Updating `moq` on a product line triggers a new match run within 5 minutes
- **CS-1 stalled deal:** Simulate 7-day gap with no Deal Room activity after a milestone; assert `stalled_deal` notification sent to buyer
- **CS-2 subcontracting dispute:** `disputes.type = 'undisclosed_subcontracting'` bypasses cooling-off; assert trust team queue item created immediately; assert `trust_notes` table record created after resolution

---

---

## UC-A02

### Apparel & Textiles — Buyer: Sophie Laurent, London, United Kingdom

**Context**

Sophie Laurent is the founder and sole full-time employee of Verdant Studio, a sustainable activewear brand she launched 18 months ago via her own DTC website. She currently sells 800–1,200 units/month and is ready to invest in her first private-label production run — moving off a UK print-on-demand service and into woven garments with her own label. She needs: organic cotton or recycled polyester activewear (leggings, sports bras, shorts), GOTS or OEKO-TEX certified, 300 pcs/style minimum, FOB or DDP to UK, samples within 3 weeks. Budget: £18–£30 per finished piece landed. She found Gracera via a sustainable fashion founder community on Slack.

**Preconditions**

- No prior Gracera account
- At least 1 active supplier profile in Apparel / Sportswear & Activewear with GOTS or OEKO-TEX cert, `private_label = true`, `moq ≤ 500 pcs`, `country = 'BD'` or `'IN'` or `'TR'`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Registers; selects "Buyer"; primary industry "Apparel & Textiles" | Account created; sourcing request builder launches |
| 2 | Selects category "Apparel & Textiles > Sportswear & Activewear"; template pre-fills: typical certs (GOTS, OEKO-TEX, BSCI), standard incoterms (FOB, DDP), common units (pieces/styles) | Template applied |
| 3 | Certification auto-suggest: *"Buyers importing apparel to the UK under UKCA requirements should ensure suppliers can provide a declaration of conformity for any garments with functional textile claims."* Sophie notes this; adds GOTS as required | `required_certifications` updated |
| 4 | Fills core fields: `product_name = "Women's activewear — leggings, sports bras, shorts"`, `quantity_required = 300`, `quantity_unit = "pieces per style"`, `order_frequency = "Quarterly"`, `private_label_needed = true`, `sample_required = true`, `sample_quantity = 3`, `max_moq = 500` | Fields saved |
| 5 | Writes `ideal_supplier_description` (150 words: sustainability-first factory, open to small DTC brands, willing to work with new brand on tech pack development, English-speaking team) | Completeness 68% |
| 6 | Live match preview: *"Your request matches 6 suppliers. 4 offer tech pack development support."* Sophie adds a note about tech pack support to her description | Count stays at 6; description improves match scoring |
| 7 | Publishes sourcing request | `status = 'open'`; match run triggered |
| 8 | First 5 matches shown within 1 hour | Cards show supplier country, GOTS/OEKO-TEX badge, MOQ, sample lead time, DTC experience indicator |
| 9 | Decision-Maker Coaching Card shown on opening EcoThread match: *"Farhan Hossain is EcoThread's Export Sales Manager. He owns the account. He handles UK brand inquiries personally. Ask about their experience with DTC brand clients and whether they can accommodate tech pack development — this factory is known for working with first-time private label brands."* | Card rendered with role + coaching angle |
| 10 | Sophie sends message asking about DTC experience and tech pack support | Message delivered; introduction pending acceptance |
| 11 | Introduction accepted | Contact details revealed; Deal Room opened; Sophie sends sample request |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Sophie sets `max_moq = 200`; no suppliers hold GOTS + MOQ ≤ 200 | 0 matches; explanation: *"No GOTS-certified activewear suppliers currently offer MOQ ≤ 200 pcs. Raising to 300 pcs reveals 4 matches."* One-click to adjust |
| AF-2 | 24 hours pass with no supplier matches | Prospecting Agent auto-fires; 3 off-platform sustainable activewear factories identified; invitation emails sent; Sophie notified: *"We're reaching out to 3 additional factories on your behalf"* |
| AF-3 | Sophie wants to evaluate multiple suppliers simultaneously | She requests introductions to 3 suppliers; all 3 receive introduction requests; Deal Room created per accepted introduction; Sophie can compare in parallel |
| AF-4 | Sophie receives a quote but can't evaluate whether £24/piece DDP is market rate | AI Price Compass activated (Phase 2): shows range for similar GOTS activewear, MOQ 300, DDP UK — e.g. £19–£28; Sophie's quote is within range |
| AF-5 | Sophie's sourcing request expires (she set `expires_at = 60 days`); she still hasn't placed an order | Sourcing request moves to `Closed`; Sophie notified; option to reopen with updated parameters |
| AF-6 | Sophie receives samples but the fabric weight is 220 gsm instead of the 280 gsm she specified; the supplier claims the TDS said "±15% tolerance" | Sophie uploads a photo of the sample label and her original specification; files a dispute: `Dispute type: Sample does not match specification`; supplier acknowledges the discrepancy; agrees to remake samples at correct weight at no charge; dispute resolved |
| AF-7 | Sophie opens a match card for a supplier with a GOTS badge; on closer inspection the badge shows "Uploaded" not "DigitallyVerified"; the certificate was manually uploaded 14 months ago and has not been reviewed by the trust team | Platform displays `authenticity_status = 'Uploaded'` badge in amber (not the green DigitallyVerified badge); tooltip: *"Certificate uploaded by supplier — not yet verified by Gracera. Request the certificate number and verify directly with Control Union before proceeding."* |
| AF-8 | After Sophie places her order, she discovers a second UK supplier offering the same fabric at 18% lower cost | Sophie has a binding order with EcoThread; she cannot cancel without penalty; AI-Brain coaching: *"A lower quote after placing an order is common. Evaluate total cost including: sample costs already paid, relationship value, and risk of switching to an unknown supplier. The price difference on 300 pcs is [calculated amount] — compare to the cost of delay and re-sampling."* |

---

**Complex Multi-Step Scenarios**

### CS-1: Bulk Production Fails QC — Partial Rejection

**Trigger:** Sophie approves samples and places a 900-piece order (3 styles × 300 pcs). When goods arrive in London, she inspects a sample of 90 pieces across styles and finds 27 pieces (30%) have a defective seam finish — stitches pulling at the hem.

**Sequence:**
1. Sophie receives the shipment; inspects 10% sample; documents 30% defect rate with photos
2. Sophie initiates dispute: `Dispute type: Quality — defective goods`; uploads 12 photos; attaches her inspection report; specifies: 270 of 900 pieces estimated defective (extrapolating from sample)
3. Farhan reviews the photos; acknowledges the seam issue; disputes the 30% extrapolation — wants a 100% inspection before agreeing on defect count
4. Platform cooling-off: both parties agree to a third-party pre-shipment inspection on the remaining uninspected goods (buyer-initiated; cost shared 50/50 per platform recommendation)
5. QIMA inspection ordered directly from Deal Room (Phase 3 integration); inspection completed within 5 business days
6. QIMA report: 19% defect rate across full batch (171 of 900 pieces)
7. Both parties accept the QIMA finding; Farhan agrees to: replace 171 pieces in the next production run at no charge, and refund 171 × unit cost as a credit on Sophie's next order
8. Sophie accepts; dispute marked `Resolved — Third Party Verified`
9. Review posted: 3/5 stars; note: *"Quality issue on first bulk order — 19% defect rate. Resolved professionally with third-party inspection and replacement agreed."*

**Expected resolution:** Third-party inspection is a first-class resolution tool available in the Deal Room. QIMA integration surfaces at the dispute stage, not only at the RFQ stage.

**Test assertions:**
- `disputes.type = 'quality_defective'` allows attachment upload; inspection request can be created from the dispute screen (Phase 3)
- Third-party inspection creates a `deal_milestones` record: `type = 'third_party_inspection'`, `provider = 'QIMA'`, `status = 'ordered'`
- Dispute resolution with `resolution_type = 'third_party_verified'` records the inspection report URL
- Review with 3-star rating posts after deal completes; not suppressed by dispute resolution

---

### CS-2: MOQ Raised After Sample Approval

**Trigger:** Sophie approves samples and is ready to place her order. Farhan messages her with unexpected news: EcoThread's minimum for the next production slot has been raised from 300 to 500 pcs/style due to factory scheduling changes.

**Sequence:**
1. Sophie approved the sample; was planning to order 300 pcs/style (3 styles = 900 pcs total)
2. Farhan raises the new minimum: 500 pcs/style; total would be 1,500 pcs — Sophie's budget is for 900 pcs
3. Sophie is frustrated; she cannot afford 1,500 pcs at this stage; she asks AI-Brain for advice
4. AI-Brain: *"You have a few options: (1) Negotiate — explain the sample approval creates a reasonable expectation; ask if 350 pcs/style is possible with an NRE fee; (2) Group buy — Gracera can match you with another small brand sourcing the same fabric who could pool the order to meet 500 pcs/style; (3) Find an alternative supplier — your sourcing request is still open and 3 uncontacted matches remain."*
5. Sophie proposes 350 pcs/style + $300 NRE fee per style; Farhan accepts
6. Counter-offer formalised in Deal Room as a revised quote; both parties sign off
7. Order placed at 350 pcs/style × 3 styles = 1,050 pcs

**Expected resolution:** MOQ negotiation is a normal part of the deal flow. AI-Brain offers concrete options including group buying (a platform feature). Counter-offer flow handles non-standard terms.

**Test assertions:**
- Counter-offer to a quote can include a non-standard fee line item (NRE) with free-text description
- AI-Brain response to a Deal Room query includes the deal context (current stage, MOQ, order quantity)
- Group buy option surfaces as a suggestion when buyer's order quantity is below supplier's stated MOQ (Phase 3 feature; mark `@skip // Phase 3`)

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.primary_contact_role = 'owner_founder'`
- `private_label_needed = true` on sourcing request
- ≥ 1 match record in `matches` table
- Introduction accepted: `deals` record created at `Introduction` status if UC-A01 fixture present

---

**Test Notes**

- **Fixture required:** Active supplier, Apparel / Sportswear & Activewear, `country = 'BD'`, GOTS cert `DigitallyVerified`, `private_label = true`, `moq ≤ 500`, `sample_available = true`
- **MOQ boundary assertion:** Supplier with `moq = 501` excluded when `max_moq = 500`; supplier with `moq = 500` included
- **Template pre-fill assertion:** After category selection, `preferred_incoterms`, `quantity_unit`, and `required_certifications` fields are non-empty before user types anything
- **Prospecting Agent assertion:** At 24h+1s past publish with zero matches, `prospecting_job` record created; invitation emails scheduled
- **CS-1 QIMA integration:** Phase 3 feature; mark as `@skip // Phase 3`; assert `deal_milestones` record with `type = 'third_party_inspection'` created when integration available
- **CS-2 counter-offer NRE line:** `quotes` record accepts line items with `type = 'non_recurring_engineering'`; rendered distinctly from product unit price

---

---

## UC-I01

### Industrial Parts & Manufacturing — Supplier: David Lin, Taichung, Taiwan

**Context**

David Lin is the business development manager at Precision One Metalworks, a 90-person CNC machining and die casting shop in Taichung's industrial zone. The company holds ISO 9001:2015 and AS9100D (aerospace quality management). They specialise in aluminium and zinc die castings, 5-axis CNC machined parts, and sheet metal fabrication for industrial and aerospace-adjacent applications. Current customers are mostly domestic Taiwanese OEMs; David has a mandate to grow North American and European revenue to 30% of total by the end of the year. He registered on Gracera after seeing a competitor appear in a Google search for "ISO 9001 precision machining Taiwan".

**Preconditions**

- No prior Gracera account
- Precision One holds ISO 9001 and AS9100D (both valid)
- At least 1 open buyer sourcing request in Industrial / Metal Fabrication & Castings or Industrial / PCB & PCBA (wrong example — use Industrial / Metal Fabrication & Castings), `preferred_supplier_countries` includes `TW` or Asia, requiring ISO 9001 or AS9100

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | David registers; selects "Supplier"; selects categories "Industrial Parts & Manufacturing > Metal Fabrication & Castings" and "Industrial Parts & Manufacturing > Bearings & Transmission" (for their machined shaft work) | Account created; catalog upload prompt |
| 2 | Uploads capability brochure PDF (process capabilities, tolerances, materials, quality certs, sample photos of parts) | RAG extracts: `company_name`, `company_description`, `company_size` (90 employees), `certifications` (ISO 9001, AS9100D detected), `categories`, `custom_manufacturing = true` |
| 3 | Reviews RAG output; adds missing fields: `annual_revenue_range = "$2M–$10M"`, `target_geographies = ["US", "CA", "DE", "UK"]`, `ideal_customer_description` (200 words: OEM/Tier 2 suppliers, industrial automation, medical device housing, aerospace ground support equipment, batch sizes 50–5,000 pcs) | Completeness reaches 69% |
| 4 | Uploads ISO 9001 (TÜV SÜD issued) and AS9100D certificate PDFs | ISO 9001 via TÜV SÜD API → `DigitallyVerified` within 2 min; AS9100D queued for trust team manual review |
| 5 | Adds 3 product lines: Aluminium Die Castings, 5-Axis CNC Machined Parts, Sheet Metal Fabrication; fills MOQ (50 pcs for castings, 10 pcs for CNC), lead times (4–6 weeks), price ranges | Completeness reaches 82% |
| 6 | Registers additional contact: technical contact (Quality Manager, Mei-ling Chang) with `routing_type = ['technical']`; commercial contact stays as David | `company_contacts` record created; technical routing active |
| 7 | Publishes profile | `profile_status = 'active'`; match run triggered |
| 8 | Match results: 2 North American buyers in Industrial / Metal Fabrication & Castings | Cards show buyer country, part type, annual volume estimate, certifications required |
| 9 | Opens Canadian buyer match (James Kowalski, Kowalski Industrial): coaching card shows *"James is the VP of Engineering — technical authority, not purely commercial. Lead with AS9100D and your tolerance capabilities. He'll want to see a sample quotation with material certs."* | Card shown |
| 10 | Sends message referencing AS9100D, 5-axis CNC capability, and offer to provide a no-obligation first-article quotation | Message sent; introduction pending |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | A buyer's RFQ arrives asking technical specification questions; David is away | RFQ auto-routed to Mei-ling Chang (technical routing contact); David receives parallel notification |
| AF-2 | AS9100D trust team review takes > 5 business days | Automated follow-up reminder sent to trust team queue; David notified of delay; profile published without AS9100D verification badge (shows "Pending Review") |
| AF-3 | 72 hours, no introductions accepted | Safety net: benchmark shows top Industrial/Metal Fab suppliers on Gracera have on average 2.1 product lines with photos; Precision One has none — nudge to add part photos |
| AF-4 | David sets `availability_status = 'FullyBooked'` and `next_available_date = 6 weeks out` | Profile shows "Fully Booked — Available [date]" badge; buyers with `deal_timeline` beyond 6 weeks still see the profile; buyers needing immediate supply see it but with availability warning |
| AF-5 | David wants to see which buyers have viewed his profile this week | Profile analytics dashboard shows: views, unique viewers (anonymised), match appearances, introductions sent/received (Phase 2 feature) |
| AF-6 | A typhoon hits Taiwan; Precision One's factory is shut down for 10 days; David has 2 active Deal Room negotiations underway | David updates `availability_status = 'FullyBooked'`; `next_available_date` = 10 days out; platform surfaces a "Notify your active contacts" prompt; David sends a force majeure notification to both Deal Room threads; both buyers see a pinned alert in the Deal Room: *"Supplier has notified a force majeure event. Expected resumption: [date]."* |
| AF-7 | A buyer sends a drawing for a 5-axis aluminium part with a 0.3mm wall section — below Precision One's minimum wall thickness capability of 0.8mm | Mei-ling (technical contact) receives the RFQ; flags the wall thickness issue in the Deal Room: *"Wall section at Ref. B is 0.3mm — below our minimum of 0.8mm for aluminium die casting. We can manufacture this if redesigned to ≥0.8mm at that section. Can you consult with your design team?"* Deal is not lost; redesign discussion begins |
| AF-8 | A large North American OEM with an existing relationship with Precision One asks David to not supply their named competitor; David has already accepted an introduction from that competitor on Gracera | David declines the competitor's introduction with reason code `'conflict_of_interest'`; uses the interaction as leverage to negotiate a formal exclusivity clause with the OEM worth $18K/year |

---

**Complex Multi-Step Scenarios**

### CS-1: First Article Fails Surface Finish Spec

**Trigger:** James Kowalski approves a quote and places a first-article order of 10 encoder housings. The parts arrive and fail his surface finish requirement: Ra 0.8 µm specified on the drawing; Ra 1.6 µm delivered. David claims the Ra 1.6 µm is within "standard machining tolerance" for this material.

**Sequence:**
1. James inspects the first article using a contact profilometer; measures Ra 1.6 µm on the critical mating surface; his drawing callout specifies Ra 0.8 µm (a GD&T callout, not a general note)
2. James initiates dispute: `Dispute type: First article — specification non-conformance`; attaches the profilometer report and a marked-up PDF of the drawing highlighting the Ra 0.8 callout
3. David reviews; his QC team argues that the general machining tolerance note supersedes the specific callout — a position James disputes as technically incorrect
4. 48-hour cooling-off: both parties cannot resolve the technical interpretation disagreement directly
5. James escalates to Gracera trust team; selects: `Need technical mediation`
6. Trust team assigns a technical review (Phase 4 feature — for now, a manual trust team review); trust team engineer examines the drawing and profilometer report
7. Finding: the specific Ra 0.8 callout on the drawing takes precedence over general tolerances per ISO 286 and ASME Y14.5 standards; David's position is incorrect
8. David is required to: re-machine the 10 first-article parts to Ra 0.8 µm at no charge; update his internal process sheet before production proceeds
9. Re-machined parts delivered; James approves first article; production order placed

**Expected resolution:** Technical disputes have an escalation path beyond cooling-off. Trust team can make binding technical findings. Supplier is required to comply without order cancellation.

**Test assertions:**
- Dispute `type = 'first_article_non_conformance'` escalation option available immediately (no 48h block for first article disputes — production deadlines don't permit delay)
- Trust team technical finding creates a `dispute_findings` record with `finding = 'supplier_non_conformant'` and `required_action` text
- Dispute with `finding = 'supplier_non_conformant'` sets a `remediation_deadline` on the dispute record
- Supplier must submit a `remediation_completed` event before dispute can close

---

### CS-2: ITAR Applicability Surfaces Mid-Process

**Trigger:** James's company wins a contract to supply conveyor systems to a US defence contractor. The encoder component now falls under ITAR (International Traffic in Arms Regulations) jurisdiction. Most of his matched Taiwanese and Chinese CNC suppliers cannot legally supply ITAR-controlled parts without a manufacturing licence.

**Sequence:**
1. James's legal team identifies the ITAR requirement; James adds `compliance_required = ['ITAR']` to his sourcing request
2. Match engine re-runs; most existing matches (Taiwan, China, India) are excluded — ITAR prohibits manufacture of defence-related components in these jurisdictions without a US export licence
3. Only 2 of James's 8 existing matches remain: a Canadian supplier (ITAR-exempt under the Canada-US Defence Production Sharing Agreement) and a US supplier
4. James had already opened a Deal Room with Precision One (Taiwan); he must notify David that the order parameters have changed
5. James messages David: *"Due to a new regulatory requirement, this part is now ITAR-controlled. We can no longer manufacture it outside of Canada or the US. Thank you for your time — I'll be in touch for future non-ITAR projects."*
6. The Deal Room is closed by James; deal marked `Cancelled — Regulatory`; no penalty to either party
7. Gracera surfaces the Canadian supplier; James proceeds with a new introduction
8. Gracera logs the ITAR exclusion event; David's profile is not penalised — cancellation reason is explicitly regulatory

**Expected resolution:** Regulatory compliance constraints are first-class cancellation reasons. Supplier is not penalised for regulatory-driven cancellations. ITAR-aware matching (Phase 4 feature) prevents this scenario by filtering before matching.

**Test assertions:**
- Sourcing request `compliance_required` field accepts `['ITAR']`; match engine excludes suppliers from ITAR-restricted jurisdictions (Phase 4; mark `@skip // Phase 4`)
- Deal `Cancelled — Regulatory` sets `deals.cancellation_reason = 'regulatory'`; does not increment buyer's or supplier's dispute count
- Supplier profile analytics records `cancellation_reason = 'regulatory'` separately from `cancellation_reason = 'supplier_fault'`

---

**Postconditions**

- `supplier_profiles.profile_status = 'active'`, `custom_manufacturing = true`
- ISO 9001: `authenticity_status = 'DigitallyVerified'`; AS9100D: `authenticity_status = 'Uploaded'`
- `company_contacts` table has 1 additional record for Mei-ling Chang, `routing_types = ['technical']`
- ≥ 1 match record in `matches` table

---

**Test Notes**

- **Fixture required:** Open buyer sourcing request, Industrial / Metal Fabrication & Castings, `country = 'CA'`, `required_certifications` includes `ISO 9001`, `quantity_required` ≥ 50 (matching MOQ)
- **Routing assertion:** Incoming RFQ with `message_type = 'technical'` creates notification for Mei-ling's contact record, not David's
- **FullyBooked assertion:** Supplier with `availability_status = 'FullyBooked'` does NOT appear in results when buyer filters "Available Now"
- **AS9100D manual review:** Trust team queue item created; `authenticity_status = 'Uploaded'` pending review
- **CS-1 first article dispute:** Escalation available immediately (no 48h cooling-off); `dispute_findings` record; `remediation_deadline` set on supplier
- **CS-2 ITAR cancellation:** `deals.cancellation_reason = 'regulatory'`; assert no penalty increment on either party's trust metrics

---

---

## UC-I02

### Industrial Parts & Manufacturing — Buyer: James Kowalski, Ontario, Canada

**Context**

James Kowalski is VP of Engineering at Kowalski Industrial Systems, a 55-person manufacturer of custom conveyor and material-handling systems based in Hamilton, Ontario. They design in-house and outsource fabricated components. James is looking for a new supplier of precision aluminium die-cast housings for an encoder component — a new product line launching in Q3. Requirements: aluminium die casting, ±0.05mm critical tolerances, ISO 9001 certified, RoHS compliant, 200–500 pcs/run, FOB Taiwan or China, 6–8 week lead time. Current supplier (Mexico-based) is quoting 14+ weeks. James found Gracera via a LinkedIn post from a fellow engineer.

**Preconditions**

- No prior Gracera account
- At least 1 active supplier in Industrial / Metal Fabrication & Castings, ISO 9001, `moq ≤ 200`, `lead_time_days ≤ 60`, `profile_status = 'active'`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Registers; selects "Buyer"; primary industry "Industrial Parts & Manufacturing" | Account created; sourcing request builder launches |
| 2 | Selects category "Industrial Parts & Manufacturing > Metal Fabrication & Castings"; category template pre-fills: typical certifications (ISO 9001, ISO 14001, IATF 16949), standard incoterms (FOB, DAP), common units (pieces, kg) | Template applied; James adjusts certs to ISO 9001 only (required) and RoHS (required) |
| 3 | Fills product requirements: `product_name = "Precision aluminium die-cast encoder housing"`, `quantity_required = 300`, `quantity_unit = "pieces"`, `order_frequency = "Quarterly"`, `max_lead_time_days = 56 (8 weeks)`, `max_moq = 500`, `required_certifications = [ISO 9001, RoHS]` | Fields saved |
| 4 | Writes `ideal_supplier_description` (200 words: die casting specialist, 5+ years, ±0.05mm tolerance capability, experience with encoder/electromechanical housings, material certs provided, sample + PPAP report available) | Completeness 71% |
| 5 | Live match preview: *"Your request matches 9 suppliers. Requiring AS9100D narrows to 2."* James stays with ISO 9001 only | 9 matches retained |
| 6 | Publishes sourcing request | Match run triggered; `status = 'open'` |
| 7 | 5 match cards rendered within 1 hour | Cards show supplier country, key certs, MOQ, lead time, availability status |
| 8 | Opens Precision One Metalworks match: AS9100D badge (pending), ISO 9001 DigitallyVerified badge, 5-axis CNC noted, lead time 4–6 weeks | Match rationale: *"Precision One's tolerance capability (±0.02mm) exceeds your ±0.05mm requirement. AS9100D certification is pending verification."* |
| 9 | Coaching card for Precision One: *"David Lin (Business Development Manager) handles initial enquiries. His technical lead Mei-ling Chang (Quality Manager) handles spec and cert questions — copied on RFQs automatically."* | Card shown |
| 10 | Sends RFQ with attached 2D drawing (DXF) and tolerance callout table | RFQ auto-routed: copy to David (commercial), copy to Mei-ling (technical routing) |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | James uploads a DXF file attachment in the message; file exceeds 25MB | Upload rejected; error: *"File exceeds 25MB limit. Compress the file or share via a link in your message."* |
| AF-2 | James wants quotes from 3 suppliers simultaneously | Multi-supplier RFQ: selects up to 5 suppliers; single standardised RFQ form sent to all; quote responses aggregated for comparison (Phase 3 feature; mark as `@skip` in Phase 1/2) |
| AF-3 | A supplier quotes a 12-week lead time (exceeding James's 8-week target) | AI Price Compass note on quote: *"This quote's lead time of 12 weeks exceeds your target of 8 weeks. 3 other matched suppliers have quoted lead times of 5–7 weeks."* |
| AF-4 | James's sourcing request has been open 30 days without a deal progressing | Platform surfaces "Follow up" nudge: lists introductions pending response and suggests restarting with updated parameters if needed |
| AF-5 | James receives a message in French from a Quebec-based supplier he contacted | Platform displays message with a "Translate to English" option (DeepL integration — Phase 4 feature) |
| AF-6 | James discovers that the matched Taiwanese supplier (Precision One) already manufactures an identical part for James's direct competitor; James asks about confidentiality | Deal Room NDA feature: James and David sign a mutual NDA (platform template or custom upload); NDA terms record in `deal_contracts` table; AI-Brain: *"An NDA protects your design IP but does not prevent a supplier from manufacturing the same part for other customers unless you include an exclusivity clause — that typically requires a volume commitment or exclusivity fee."* |
| AF-7 | James receives his first article but the supplier includes a paperwork error: the material certificate (3.1 cert per EN 10204) shows the wrong alloy grade (6061-T4 vs the specified 6061-T6) | James raises the discrepancy in the Deal Room; supplier confirms it was a paperwork error — the physical material is correct; reissues the correct material cert within 24 hours; first article approval proceeds |
| AF-8 | James wants to evaluate a supplier's financial stability before placing a 12-month blanket order worth $280K | AI-Brain: *"For orders above $100K, consider requesting a Dun & Bradstreet report from the supplier. Gracera can flag suppliers with a 'Business Credit: Verified' badge if the supplier has opted into credit verification."*; Precision One does not currently have D&B verification; James proceeds with a smaller initial order to de-risk |

---

**Complex Multi-Step Scenarios**

### CS-1: Delivery Delay Threatens James's Product Launch

**Trigger:** James placed a 300-unit production order with 6-week lead time. His new product launches at a trade show in 8 weeks. At week 5, David notifies him the parts won't be ready for 10 more weeks due to a machine breakdown (same scenario as CS-1 in UC-I01, but from the buyer's perspective).

**Sequence:**
1. James receives the delay notification in the Deal Room; calculates: 10 more weeks puts delivery 7 weeks past his trade show
2. James escalates immediately to dispute: `Dispute type: Delivery delay — time-critical`; adds context: *"This delay will cause us to miss a trade show launch. We have a contractual commitment to our customer."*
3. James also queries AI-Brain: *"My supplier is 10 weeks late. I have a trade show in 8 weeks. What are my options?"*
4. AI-Brain: *"Options: (1) Request expedited production at a premium cost; (2) Ask if a partial shipment of 50–100 units is possible for the show; (3) Source from a backup supplier — your original sourcing request has 3 uncontacted matches; (4) Negotiate a delay penalty clause for future orders. For the show, 50 units as display samples may be sufficient even if the full order isn't ready."*
5. James proposes: ship 50 units within 3 weeks for the trade show; remainder in 7 more weeks; David agrees
6. Partial shipment plan added as a Deal Room milestone: `Partial shipment — 50 units` with target date
7. 50 units dispatched on time; James attends the trade show; full order arrives 7 weeks later

**Expected resolution:** AI-Brain coaching during a live deal crisis provides actionable options, not platitudes. Partial shipment is a negotiable milestone in the Deal Room.

**Test assertions:**
- Deal Room milestone can be added by either party mid-deal; `deal_milestones.type = 'partial_shipment'`
- AI-Brain query in Deal Room context includes deal stage, original lead time, and current delay information in the prompt
- Dispute `type = 'delivery_delay'` with `urgency = 'time_critical'` flag routes to a shorter trust team SLA (24h response vs 48h standard)

---

### CS-2: Blanket Order — Supplier Raises Price Mid-Contract

**Trigger:** 6 months into a 12-month blanket order, Precision One notifies James that aluminium alloy costs have risen 28% and they need to raise the per-unit price by 12% for the remaining orders.

**Sequence:**
1. David sends a Deal Room message with a formal price revision request and a supporting aluminium price index excerpt
2. James reviews; his original PO locked in the per-unit price for 12 months — he has a contract
3. James queries AI-Brain: *"My supplier wants to raise the price mid-contract citing raw material costs. The original PO has a fixed price. Do I have to accept?"*
4. AI-Brain: *"A fixed-price PO generally binds both parties. However, if your contract contains a material escalation clause (common in metals and chemicals contracts), the supplier may have a legitimate claim. Review your signed agreement. If there's no escalation clause, you can: (a) reject the increase and hold to the contract; (b) negotiate a partial increase in exchange for extending the blanket order term; (c) begin sourcing a backup and use that as leverage."*
5. James reviews the signed PO (stored in Deal Room under `deal_contracts`); confirms there is no escalation clause
6. James declines the price increase; offers a goodwill gesture: extend the blanket order by 3 months at the revised price as a compromise
7. David accepts the compromise; a deal amendment is signed via e-signature in the Deal Room

**Expected resolution:** Signed contracts are the source of truth. AI-Brain provides legally-informed guidance without acting as legal counsel. Deal amendment flow allows mid-contract modifications.

**Test assertions:**
- `deal_contracts` records accessible from Deal Room; downloadable PDF
- Deal amendment creates a new `deal_contracts` record with `type = 'amendment'` referencing the original contract `id`
- AI-Brain response to contract queries includes a disclaimer: *"This is informational only and not legal advice. Consult a trade attorney for binding interpretation."*

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.primary_contact_role = 'operations_manager'`
- ≥ 1 match record
- If UC-I01 fixture present: RFQ record created in `rfqs` table with `supplier_profile_id = Precision One`

---

**Test Notes**

- **Fixture required:** Active supplier, Industrial / Metal Fabrication & Castings, `country = 'TW'`, ISO 9001 DigitallyVerified, `moq ≤ 300`, `lead_time_days ≤ 56`, `availability_status = 'Available'`
- **RFQ routing assertion:** RFQ sent to supplier with a registered `technical` contact results in 2 notification records — one for primary contact, one for technical contact
- **File size assertion:** Upload of file > 25MB returns HTTP 413 with user-readable error message
- **Lead time filter assertion:** Suppliers with `lead_time_days > 56` on all product lines excluded when buyer sets `max_lead_time_days = 56`
- **CS-1 partial shipment milestone:** `deal_milestones.type = 'partial_shipment'`; assert either party can add a milestone mid-deal
- **CS-2 deal amendment:** `POST /deal-contracts` with `type = 'amendment'`, `parent_contract_id`; assert amendment references original; assert e-signature flow creates a `signatures` record for both parties

---

---

## UC-H01

### Health, Beauty & Personal Care — Supplier: Park Soo-jin, Incheon, South Korea

**Context**

Park Soo-jin is the international business development director at Lumos Cosmetics, a 200-person ODM (original design manufacturer) cosmetics factory in the Namdong Industrial Complex in Incheon. The factory holds ISO 22716 (Cosmetics GMP), COSMOS-standard certification (for natural/organic formulations), and CPSR (Cosmetic Product Safety Report) capability for the EU. They specialise in serums, sheet masks, and ampoules — the K-beauty functional skincare category. Lumos currently exports to Japan and Southeast Asia; Soo-jin has been tasked with opening the European market, specifically France, Germany, and the UK. She is fluent in English and has existing CPSR infrastructure.

**Preconditions**

- No prior Gracera account
- Lumos holds ISO 22716, COSMOS-standard, and CPSR documentation
- At least 1 open buyer sourcing request in Health & Beauty / Skincare, `preferred_supplier_countries` includes `KR`, with ISO 22716 or CPSR required, `private_label_needed = true` or `oem_needed = true`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Soo-jin registers; selects "Supplier"; selects categories "Health, Beauty & Personal Care > Skincare" and "Health, Beauty & Personal Care > Body & Bath" | Account created; catalog upload prompt |
| 2 | Uploads Lumos formulation capabilities brochure (includes INCI list examples, packaging options, MOQ table, cert logos) | RAG extracts: `company_name`, `company_description`, `certifications` (ISO 22716, COSMOS detected), `private_label = true`, `custom_manufacturing = true` (ODM), `categories`, `company_size` |
| 3 | Adds `target_geographies = ["FR", "DE", "GB", "NL", "SE"]`; writes `ideal_customer_description` (250 words: European indie skincare/wellness brands, 500–5,000 unit MOQ, private label or ODM, open to small batches for brand launches) | Completeness reaches 67% |
| 4 | Uploads ISO 22716 (Intertek issued) and COSMOS-standard certificates | Intertek API integration: ISO 22716 → `DigitallyVerified`; COSMOS queued for trust team review |
| 5 | Adds 3 product lines: Vitamin C Brightening Serum, Hyaluronic Acid Sheet Mask (20-pack), Retinol Ampoule; fills MOQ (500 units for serums, 1,000 units for sheet masks), lead time (45–60 days), price ranges | Completeness reaches 81% |
| 6 | Adds AI-Brain note about CPSR capability for EU market (free text in `company_description` update): *"We provide full CPSR documentation for EU importers. Responsible Person registration support available."* | Description updated; CPSR keyword indexed |
| 7 | Publishes profile | `profile_status = 'active'`; match run triggered |
| 8 | 3 EU buyer matches within 60 seconds | Cards show buyer country (FR, DE, UK), buyer type (indie brand, wellness brand), certifications matched |
| 9 | Top match is a French indie skincare brand (Claire Moreau); coaching card: *"Claire Moreau is founder and sole buyer with full authority. She's a first-time private label buyer — emphasise your ODM support, small-batch tolerance, and CPSR capability. She won't know what CPSR is; explain it briefly."* | Card shown |
| 10 | Soo-jin sends message explaining ODM process, CPSR support, and offers a sample formulation kit (3 SKUs) | Message sent; introduction pending |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | A buyer requires ISO 22716 AND ECOCERT COSMOS Organic (a stricter tier than COSMOS Natural); Lumos holds only COSMOS Natural | Match shown as partial: *"Buyer requires COSMOS Organic; Lumos holds COSMOS Natural. This is a near-match — buyer may accept if Lumos can confirm organic-certified formulations are available."* |
| AF-2 | Soo-jin adds a 4th product line (SPF 50 Sunscreen); platform flags that EU buyers require additional regulatory documentation (Cosmetic Regulation EC 1223/2009 notification) for SPF products | Informational flag shown: *"SPF products require EU cosmetic product notification (CPNP). Add CPNP capability to your profile to match with EU buyers sourcing sunscreen."* |
| AF-3 | 72h safety net fires | Benchmark: top K-beauty ODM suppliers on Gracera have product images on ≥ 3 product lines; Lumos has none — nudge to add product/packaging photos |
| AF-4 | A buyer requests a sample; Soo-jin wants to track the sample request through the platform | Sample request logged in Deal Room as a pre-RFQ milestone; Soo-jin marks sample dispatched; DHL tracking number added; buyer notified |
| AF-5 | Soo-jin wants to send a product catalogue update to all buyers who've accepted introductions in the past 90 days | Supplier Broadcast Campaign (Phase 3): sends announcement to relevant buyer segment; buyers see platform notification, not cold email |
| AF-6 | During a production run for a European buyer, an EU regulation update restricts methylisothiazolinone (MI) to 0.0015% in rinse-off products; the agreed formula has 0.003% MI | Soo-jin receives a trade policy alert (Phase 4 feature) flagging the regulation change; she notifies the buyer immediately in the Deal Room; production paused; reformulation takes 3 weeks; both parties agree to extend the delivery timeline |
| AF-7 | A competitor factory copies Lumos's Gracera product photos and uses them on their own profile | Soo-jin reports via "Report inaccuracy — stolen images"; trust team cross-references image metadata and upload dates; confirms Lumos uploaded first; competitor's profile images removed within 48 hours; competitor warned; repeat infringement will result in suspension |
| AF-8 | A UK buyer requests COSMOS Organic certification on the finished product; Lumos holds COSMOS Natural (a different tier — natural ingredients but not all organic); the buyer doesn't know the difference | Soo-jin proactively explains the distinction in the coaching card context before the first message; AI-Brain coaching: *"This buyer is asking for COSMOS Organic — a stricter tier than your COSMOS Natural certification. Your certified ingredients can be used in a COSMOS Natural finished product but not a COSMOS Organic one. Clarify this in your first message to avoid a misunderstanding mid-project."* |

---

**Complex Multi-Step Scenarios**

### CS-1: Regulatory Change Stops Production Mid-Run

**Trigger:** Lumos is 3 weeks into a 5-week production run for a German buyer (200 units of a vitamin C serum). The EU Cosmetics Regulation is amended to restrict a preservative in the agreed formula. Production must stop.

**Sequence:**
1. Soo-jin receives a trade policy alert (Phase 4): *"EU Cosmetics Regulation updated: [preservative X] restricted to 0.1% in leave-on products effective [date]. Review your formulations for EU market."*
2. Soo-jin's formulation chemist confirms the serum formula has 0.15% of the restricted preservative — non-compliant
3. Soo-jin immediately notifies the German buyer in the Deal Room; uploads the EU regulation amendment as a document
4. German buyer escalates internally; confirms they need a compliant formula — cannot accept non-compliant product
5. Both parties agree: pause production; reformulate; new timeline is 5 additional weeks
6. Reformulated product: preservative reduced to 0.08%; new stability testing required (3 weeks); total additional delay: 6 weeks
7. German buyer accepts the delay; updated milestone added: `Reformulation complete — regulatory compliance`
8. Lumos updates the Retinol Ampoule product line description to reflect the compliant formula; flags it as "EU Regulation-Updated"
9. Deal completes; Soo-jin adds "EU Reg-Compliant Formulations" to her profile compliance_standards

**Expected resolution:** Regulatory change is a force majeure-equivalent event that neither party caused. Communication in the Deal Room and transparent timeline management prevents the deal from collapsing.

**Test assertions:**
- Trade policy alert creates a `policy_alerts` record linked to relevant `hs_chapters` and the supplier's `categories`; (Phase 4; mark `@skip // Phase 4`)
- Deal milestone with `type = 'regulatory_hold'` can be added; deal does not auto-close or auto-escalate during a regulatory hold
- Product line description is editable after profile is published; edit triggers a re-index of the product line for search
- `compliance_standards` array on `supplier_profiles` is editable; change triggers a profile re-score and new match run

---

### CS-2: EU Buyer's CPNP Submission Rejected — Production Complete, Goods Stranded

**Trigger:** Lumos completes a 500-unit production run for a Belgian indie brand. The buyer attempts to submit the product for CPNP (EU Cosmetics Product Notification Portal) registration before import. The submission is rejected because the product category was misclassified (submitted as "Skin care product" instead of "Serum" which has different notification fields).

**Sequence:**
1. Production complete; goods ready to ship
2. Belgian buyer attempts CPNP notification; portal returns an error: category misclassification
3. Buyer contacts Soo-jin in the Deal Room: *"Our CPNP submission was rejected — the product category needs to be 'Serum (leave-on)'. Can you provide the correct product function description and pH data for the resubmission?"*
4. Soo-jin's QC team provides: pH value, product function statement, challenge test result, and updated INCI list (all in a single PDF)
5. Buyer resubmits CPNP; approved within 5 business days
6. Goods shipped; deal proceeds to completion
7. Lumos adds a CPNP preparation checklist to their Deal Room template for all future EU buyers: *"Before shipping, ensure your EU Responsible Person has submitted the CPNP notification. We can provide pH, INCI, and function documentation within 48 hours of request."*

**Expected resolution:** CPNP documentation gaps are a common first-time-importer issue; an experienced ODM supplier can resolve them quickly if the communication channel is open. The supplier adding a checklist to their Deal Room template is a platform feature for supplier quality.

**Test assertions:**
- Deal Room message supports file attachments up to 25MB; PDF bundle uploaded in a single attachment
- Supplier can add a "Deal Room template" — a set of pre-populated checklist items that auto-appear in new Deal Rooms for that supplier (Phase 3 feature; mark `@skip // Phase 3`)
- Goods-ready milestone does not auto-trigger shipment; awaiting buyer's "ready to receive" confirmation before DHL tracking is requested

---

**Postconditions**

- `supplier_profiles.profile_status = 'active'`, `private_label = true`, `custom_manufacturing = true`
- ISO 22716: `authenticity_status = 'DigitallyVerified'`; COSMOS: `authenticity_status = 'Uploaded'`
- ≥ 1 match record with a European buyer
- 3 product lines with `sample_available = true`

---

**Test Notes**

- **Fixture required:** Open buyer sourcing request, Health & Beauty / Skincare, `country = 'FR'`, `private_label_needed = true`, `required_certifications` includes `ISO 22716`, `max_moq ≤ 1000`
- **COSMOS partial match assertion:** Buyer requiring COSMOS Organic and supplier holding COSMOS Natural renders a match card with a `partial_match` flag and gap description, not zero matches
- **Broadcast Campaign:** Phase 3 feature; mark test as `@skip // Phase 3` comment
- **Sample tracking:** Sample request in Deal Room creates a `deal_milestones` record with `type = 'sample_dispatched'`
- **CS-1 regulatory hold:** `deal_milestones.type = 'regulatory_hold'`; assert deal does not auto-close; assert policy alert creates `policy_alerts` record (Phase 4)
- **CS-2 goods-ready milestone:** `deal_milestones.type = 'goods_ready'`; assert shipment not auto-triggered; requires explicit buyer confirmation milestone before DHL tracking is added

---

---

## UC-H02

### Health, Beauty & Personal Care — Buyer: Claire Moreau, Lyon, France

**Context**

Claire Moreau is the founder of Pur Ritual, a French wellness and skincare brand she sells via her own Shopify store and two independent boutiques in Lyon. She's launching a K-beauty-inspired product line: 3 SKUs (vitamin C serum, hyaluronic toner, and a retinol night serum), all under the Pur Ritual label. She wants Korean-formula ODM production, COSMOS-certified formulations if possible, EU-compliant CPSR documentation, sample within 4 weeks, MOQ ≤ 1,000 units per SKU. Claire has no prior import experience. She found Gracera via an Instagram post from a French beauty business community account.

**Preconditions**

- No prior Gracera account
- At least 1 active supplier in Health & Beauty / Skincare, `country = 'KR'`, ISO 22716 or COSMOS cert, `private_label = true`, `moq ≤ 1000`, `profile_status = 'active'`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Registers; selects "Buyer"; primary industry "Health, Beauty & Personal Care" | Account created; email verified; sourcing request builder launches |
| 2 | Selects category "Health, Beauty & Personal Care > Skincare"; category template pre-fills: typical certs (ISO 22716, COSMOS, CPSR capability), standard incoterms (DAP, DDP), common units (units, bottles) | Template applied |
| 3 | Certification auto-suggest: *"Buyers importing cosmetics to France must ensure suppliers can provide a Cosmetic Product Safety Report (CPSR) and, if selling natural/organic claims, COSMOS certification. All cosmetics sold in the EU must be notified in CPNP."* Claire checks ISO 22716 and CPSR capability as required | `required_certifications` updated |
| 4 | Fills product requirements: 3 SKUs (vitamin C serum, hyaluronic toner, retinol night serum), `quantity_required = 500`, `quantity_unit = "units per SKU"`, `order_frequency = "Quarterly"`, `private_label_needed = true`, `oem_needed = true`, `sample_required = true`, `max_moq = 1000` | Fields saved |
| 5 | Writes `ideal_supplier_description` (150 words: Korean ODM factory open to small brands and first-time importers, CPSR documentation support, English-language communication, quick samples) | Completeness 63% |
| 6 | Live match preview: *"Your request matches 5 suppliers. All offer ODM private label."* | 5 matches shown |
| 7 | Publishes sourcing request | `status = 'open'`; match run triggered |
| 8 | First 5 match cards shown within 1 hour | Cards include: ISO 22716 badge, COSMOS badge (where applicable), ODM indicator, sample lead time, country |
| 9 | Decision-Maker Coaching Card before first message: *"Park Soo-jin (International Business Development Director) — senior decision-maker, strong EU market focus. She's dealt with first-time EU importers before. Ask about their CPSR workflow and whether they have an EU Responsible Person partner they work with — this will signal you've done your homework."* | Card shown |
| 10 | Claire sends message asking about CPSR workflow and EU Responsible Person support | Message sent; introduction pending |
| 11 | Introduction accepted; Deal Room opens; Lumos ships 3-SKU sample formulation kit | `deals.status = 'Introduction'`; sample tracking event logged when Soo-jin marks sample dispatched |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Claire doesn't know what MOQ to set and leaves `max_moq` blank | Sourcing request publishes; matching engine uses a default upper bound; buyers can still see all suppliers regardless of MOQ and filter manually |
| AF-2 | Claire receives 3 introduction acceptances and needs to compare suppliers | Side-by-side comparison of up to 3 supplier profiles: certs, MOQ, lead time, sample cost, ODM notes; available from the matches dashboard |
| AF-3 | A supplier quotes in KRW; Claire's preferred currency is EUR | Platform converts KRW quote to EUR at current exchange rate; displays both; note: *"Price shown in EUR is indicative. Confirm final EUR pricing with the supplier."* |
| AF-4 | After placing a sample order, Claire is unsure if the quote is reasonable | AI Price Compass (Phase 2): shows market range for Korean ODM skincare, MOQ 500, DDP France — e.g. $3.20–$6.80/unit for a 30ml serum |
| AF-5 | Claire wants to know if she needs to pay import VAT | AI-Brain query: *"Do I need to pay import VAT when importing cosmetics from Korea to France?"* — AI-Brain answers using French import regulations context; notes this is informational and recommends confirming with a customs broker |
| AF-6 | Claire's goods are held at French customs because the CPNP notification reference was missing from the customs declaration | Platform surfaces a help prompt in the notification: *"Your supplier can provide INCI list, pH, and challenge test results for CPNP submission. Request them in the Deal Room."* Claire sends a document request; Soo-jin responds within 4 hours; CPNP submitted; goods released in 8 days |
| AF-7 | During pre-production formula review, Claire's label designer notices geraniol in the INCI list; the quantity (0.12%) is above the EU declaration threshold for leave-on products | Soo-jin confirms the geraniol level; Claire updates her label artwork to include the mandatory allergen declaration; no formula change required; no platform dispute needed — resolved through Deal Room communication |
| AF-8 | After sample approval, Lumos raises the MOQ from 500 to 1,500 units; Claire cannot afford the increased quantity | AI-Brain offers 3 options: negotiate a phased order, find an alternative from remaining matches, or add a run-on fee to enable a 500-unit order; Claire negotiates a 500-unit order with a €250 run-on fee per SKU |

---

**Complex Multi-Step Scenarios**

### CS-1: CPNP Customs Hold — Claire's First Import Emergency

**Trigger:** Claire's first shipment of 500 units arrives at CDG freight terminal. Her freight forwarder sends her a hold notice: CPNP notification reference missing. Storage charges accumulating at €45/day.

**Sequence:**
1. Claire receives customs hold notice; has never done CPNP; didn't know it was required before import
2. Claire queries AI-Brain: *"My cosmetics are held at customs in France. They want a CPNP number. What is this and how do I fix it?"*
3. AI-Brain response: explains CPNP, lists required documents (INCI, pH, challenge test, function description), recommends appointing an EU Responsible Person service, estimates 1–5 business days for approval
4. Claire messages Soo-jin via Deal Room document request: `type = 'cpnp_documentation'`
5. Soo-jin sends INCI list, pH certificate, challenge test summary, and product function description — all in one PDF — within 4 hours
6. Claire appoints an EU RP service online; submits CPNP notification same day
7. CPNP reference issued in 2 business days; freight forwarder updates customs declaration
8. Goods released on day 8; total customs storage cost: €360
9. Claire adds EU RP service details to her buyer profile notes for future reference

**Expected resolution:** AI-Brain provides actionable first-response guidance. Deal Room document request is a structured, fast channel to the supplier. Total resolution: 8 days.

**Test assertions:**
- Deal Room supports structured `document_request` with `type` field; request creates a `deal_messages` record with `message_type = 'document_request'`
- AI-Brain response to CPNP query includes a legal disclaimer; response text is not empty and references CPNP specifically
- Buyer profile supports a free-text `notes` field; notes are private (not visible to suppliers or on public profile)

---

### CS-2: Supplier's COSMOS Cert Expires Between Sample Approval and Bulk Production

**Trigger:** Claire approved samples in month 1. Lumos's COSMOS cert expires in month 2 — 4 weeks before bulk production is due to start. Claire's label already carries "COSMOS Natural Certified."

**Sequence:**
1. Platform detects Lumos's COSMOS cert expiry; Soo-jin receives the standard 30-day and 7-day alerts
2. On expiry date, platform sends Claire a notification: *"Lumos Cosmetics' COSMOS-standard certification expired on [date]. Your product carries a COSMOS Natural claim — confirm certification status before proceeding to bulk production."*
3. Claire messages Soo-jin immediately; Soo-jin confirms renewal audit is scheduled next week; renewed cert arrives in 6 weeks from audit
4. Claire must choose: delay production 6 weeks, or proceed and remove the COSMOS claim from labels
5. Claire chooses to delay — the COSMOS claim is a core differentiator for Pur Ritual's positioning
6. Production delayed; Soo-jin sends weekly updates from audit to cert receipt
7. Renewed COSMOS cert uploaded to Gracera after 6 weeks; Claire confirms cert received; production starts
8. New production milestone added: `Cert renewed — production restart [date]`
9. Delivery delayed by 6 weeks total; Claire updates her product launch date accordingly

**Expected resolution:** Cert expiry notifications reach active deal buyers — not just the supplier — which is the critical behaviour that prevents a compliance failure. The buyer can make an informed choice (delay vs relabel) rather than discovering the issue after production.

**Test assertions:**
- Buyer in an active Deal Room receives a `notifications` record with `type = 'supplier_cert_expired'` when a relevant cert on the matched supplier expires
- Renewed cert upload during an active deal triggers notification to all buyers with open introductions: *"[Supplier] has renewed their [cert name]."*
- `deal_milestones.type = 'production_delayed_cert_renewal'` can be added; deal remains open and does not auto-escalate

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.primary_contact_role = 'owner_founder'`
- `private_label_needed = true`, `oem_needed = true`, `sample_required = true` on sourcing request
- ≥ 1 match record
- If UC-H01 fixture present: introduction request sent; `deals` record created

---

**Test Notes**

- **Fixture required:** Active supplier, Health & Beauty / Skincare, `country = 'KR'`, ISO 22716 DigitallyVerified, `private_label = true`, `moq ≤ 500`, `sample_available = true`, `sample_lead_time_days ≤ 28`
- **Currency conversion assertion:** Quote value in KRW displayed with EUR equivalent; conversion rate label shown with timestamp
- **AI Price Compass:** Phase 2 feature; mark test as `@skip` with `// Phase 2` comment
- **Comparison view assertion:** Selecting 3 suppliers from match results renders a `/compare?ids=...` page with a table showing ≥ 5 comparative fields
- **CS-1 document request:** `POST /deal-messages` with `message_type = 'document_request'`, `document_type = 'cpnp_documentation'`; assert `deal_messages` record created
- **CS-2 buyer cert expiry notification:** Cert expiry job triggers notification to buyers in active Deal Rooms; assert `notifications` record created for Claire with `type = 'supplier_cert_expired'` when Lumos cert expires

---

---

## UC-C01

### Chemicals & Raw Materials — Supplier: Rajesh Sharma, Mumbai, India

**Context**

Rajesh Sharma is the VP Sales & Marketing at Chemova Industries, a 160-person specialty chemicals manufacturer in Navi Mumbai. Chemova produces mid-chain alcohol ethoxylates and alkyl polyglucosides (APG) — non-ionic surfactants used as active ingredients in household cleaning products, industrial degreasers, and personal care formulations. They hold ISO 9001:2015, ISO 14001:2015, and are REACH pre-registered for the EU market. Their main export markets are currently the Middle East and Southeast Asia. Rajesh wants to break into the EU and UK cleaning products sector — specifically targeting contract manufacturers and own-label producers that use bio-based surfactants in their green cleaning ranges.

**Preconditions**

- No prior Gracera account
- Chemova holds ISO 9001, ISO 14001, and REACH pre-registration documentation
- At least 1 open buyer sourcing request in Chemicals / Cleaning & Detergent Chemicals or Chemicals / Specialty Chemicals, requiring ISO 9001 or REACH compliance, `preferred_supplier_countries` includes `IN` or is open to Asia

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Rajesh registers; selects "Supplier"; selects categories "Chemicals & Raw Materials > Cleaning & Detergent Chemicals" and "Chemicals & Raw Materials > Specialty Chemicals" | Account created; catalog upload prompt |
| 2 | Uploads Chemova's technical data sheet library (PDF bundle: 3 TDS documents for APG 810, APG 1214, and AEO-7) | RAG extracts: `company_name`, `company_description`, `product_lines` (3 products partially extracted), `categories`, `certifications` (ISO 9001, ISO 14001 detected from document header), `custom_manufacturing = false` (standard formulations) |
| 3 | Reviews pre-fill; corrects product names to full INCI nomenclature; adds `target_geographies = ["DE", "NL", "GB", "FR", "BE"]`; writes `ideal_customer_description` (200 words: EU contract cleaning product manufacturers, own-label green cleaning brands, industrial formulation companies, REACH compliance required, minimum 1 MT per order) | Completeness reaches 66% |
| 4 | Uploads ISO 9001, ISO 14001, and REACH dossier excerpt (summary page) | ISO 9001 (Bureau Veritas issued): Bureau Veritas API → `DigitallyVerified`; ISO 14001: `Uploaded`; REACH dossier: `Uploaded` (not a standard cert — stored as supporting document) |
| 5 | Adds 3 product lines with detailed TDS references: APG 810, APG 1214, AEO-7 ethoxylate; fills MOQ (1 MT each), lead time (3–4 weeks), price ranges (FOB Mumbai, per MT) | Completeness 79% |
| 6 | Adds `compliance_standards = ["REACH", "ISO 9001", "ISO 14001", "Ecocert Cosmos Approved"]` (APG 810 and 1214 are COSMOS-approved ingredients) | COSMOS ingredient approval noted — boosts match with cosmetic/natural cleaning product buyers |
| 7 | Publishes profile | `profile_status = 'active'`; match run triggered |
| 8 | Match results: 3 EU buyers | Cards show buyer country (NL, DE, UK), product type (cleaning formulations, personal care), annual volume range |
| 9 | Opens Dutch buyer match (Henk van der Berg, BioClean Solutions); coaching card: *"Henk is the Procurement Director — authority to award supply contracts. He's been buying surfactants for 15 years and will ask about your REACH dossier status for the EU. Have your SDS (Safety Data Sheet) ready. Lead with COSMOS approval for their eco range."* | Card shown |
| 10 | Sends message referencing COSMOS ingredient approval, REACH pre-registration, and offers to provide SDSs and COA for samples | Message sent; introduction pending |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Rajesh uploads a TDS that includes hazardous substance classifications (GHS); platform detects chemical hazard flags | Informational note shown: *"Your product TDS indicates GHS hazard classification. Buyers in the EU may require an EU-format Safety Data Sheet (SDS) in the local language. Add SDS documents to strengthen your profile."* |
| AF-2 | A buyer sourcing request requires REACH full registration (not pre-registration); Chemova has pre-registration only | Match shown with gap flag: *"Buyer requires full REACH registration. Chemova holds REACH pre-registration. This may qualify for orders below the 1 MT/year threshold — confirm with buyer."* Partial match, not excluded |
| AF-3 | Rajesh is asked to specify UN transport classification for a hazardous product | Platform provides a field for UN classification (`un_number`, `packing_group`) in product line schema; displayed in match card to signal logistics capability |
| AF-4 | 72h no-introduction safety net fires | Benchmark: top Chemical suppliers on Gracera have on average 2.8 compliance standards listed; Chemova has 4 (above average). Gap identified: zero product photos/images — nudge to add lab/process photos |
| AF-5 | Rajesh wants to monitor EU regulatory changes affecting his HS chapter (HS 34.02 — surfactants) | Trade Policy Alert (Phase 4): Rajesh subscribes to HS chapter 34.02 alerts; receives notifications when EU REACH or biocides regulation updates affect his category |
| AF-6 | A shipped batch of APG 810 has a COA showing purity of 98.2%; the buyer's specification requires ≥ 99%; Rajesh claims this is within lab measurement uncertainty | Buyer files dispute: `Dispute type: Product specification non-conformance`; Rajesh provides the instrument calibration records and method uncertainty data; third-party lab analysis ordered; lab confirms 98.1% — below spec; Rajesh agrees to replace the batch |
| AF-7 | A buyer requests a 12-month fixed price contract; palm kernel oil (the primary feedstock) spot price rises 28% within 4 months | Rajesh reviews his contract; no material escalation clause was included; he contacts the buyer in the Deal Room to renegotiate; buyer declines; Rajesh must honour the contract for the full 12 months at a loss; lesson: add an escalation clause to all future contracts |
| AF-8 | An enquiry arrives from a buyer whose country is on an OFAC-monitored list; the buyer appears legitimate but the jurisdiction raises automatic compliance flags | Platform detects the buyer's `country` against a sanctions screening list; introduces a `compliance_hold` on the introduction — Rajesh cannot proceed until the trust team clears the buyer; trust team reviews the company registration and confirms the company is not a sanctioned entity; hold lifted within 24 hours |

---

**Complex Multi-Step Scenarios**

### CS-1: EU Proposes Restrictions on AEO-7 Mid-Pipeline

**Trigger:** Rajesh has 3 active buyer conversations in the EU — all sourcing AEO-7 (a specific alcohol ethoxylate). The EU REACH committee publishes a proposal to restrict AEO-7 usage in consumer cleaning products, pending a 12-month public comment period.

**Sequence:**
1. Rajesh receives a trade policy alert (Phase 4): *"EU REACH proposal: restriction on short-chain alcohol ethoxylates (C9–C11 AEO) in consumer cleaning products — public comment period opens [date], effective date proposed 18 months from now."*
2. Two of Rajesh's 3 active buyers use AEO-7 in consumer products (household cleaners); the third uses it in industrial cleaning (not covered by the proposal)
3. Rajesh messages all 3 buyers in their respective Deal Rooms with the proposal details and his assessment: *"This is a proposal, not a regulation yet. The 18-month timeline means your current orders are unaffected. We recommend you evaluate alternative grades (C12–C14 AEO) which are not in scope."*
4. Buyer 1 (consumer products) panics and wants to cancel; Rajesh explains the 18-month window; buyer continues but requests a quote for the C12–C14 alternative
5. Buyer 2 (consumer products) requests a formal letter from Rajesh confirming the current order is not affected; Rajesh provides it via the Deal Room
6. Buyer 3 (industrial cleaning) is unaffected; deal proceeds normally
7. Rajesh updates his product line descriptions to highlight which products are in scope vs out of scope for the proposal
8. Rajesh adds the alternative C12–C14 AEO grades as new product lines on his Gracera profile

**Expected resolution:** Trade policy alerts reach suppliers early enough to act proactively, not reactively. Proactive supplier communication maintains buyer confidence during regulatory uncertainty.

**Test assertions:**
- Trade policy alert `policy_alerts.scope = 'supplier'` routes to supplier inbox; Phase 4 feature; mark `@skip // Phase 4`
- Deal Room message with a file attachment (compliance letter PDF) creates a `deal_documents` record linked to the message
- New product line added post-publish triggers a profile re-score and new match run within 5 minutes

---

### CS-2: Batch COA Mismatch — Formal Dispute and Lab Analysis

**Trigger:** Rajesh ships 5 MT of APG 810 to Henk's factory in Rotterdam. The COA shows 98.2% active content. Henk's incoming quality inspection measures 97.8% on 3 of 5 samples using an in-house titration method. Henk's specification requires ≥99%.

**Sequence:**
1. Henk receives the shipment; performs incoming QC; 3 of 5 samples fail at 97.8% purity
2. Henk initiates dispute: `Dispute type: Product specification non-conformance`; attaches his in-house titration results; specifies: received 5 MT APG 810 at 97.8% purity; specification is ≥99%; requests replacement or full refund
3. Rajesh reviews; disputes Henk's titration results: *"Our COA shows 98.2%, issued by an ISO 17025-accredited lab. Your in-house method may not be calibrated for this product."*
4. Cooling-off: both parties agree to send a retention sample to an independent ISO 17025-accredited lab (SGS Rotterdam); cost split 50/50 per dispute protocol
5. SGS Rotterdam result: 98.0% purity — above Henk's 97.8% measurement but below spec (99%)
6. Both parties accept the SGS finding; the product is non-conformant per the 99% specification
7. Rajesh offers: replace 5 MT with a new batch (currently in production, 3 weeks lead time); no refund on the current batch (which Henk can use for industrial applications with lower purity requirements)
8. Henk accepts — he has a secondary product line where 98% purity is acceptable; he uses the current batch there
9. Replacement batch ships 3 weeks later; COA shows 99.3%; Henk confirms acceptance
10. Dispute closed; Rajesh's payment track record shows 1 resolved dispute — `resolution_type = 'replacement_accepted'`

**Expected resolution:** Third-party lab analysis is the definitive tie-breaker. Both parties accept an independent result even when it doesn't fully favour either side. Creative resolution (using non-conformant batch for a secondary purpose) avoids total waste.

**Test assertions:**
- Dispute allows attachment of COA and test results; `dispute_evidence` table stores file references for each party
- Third-party analysis request creates a `deal_milestones` record: `type = 'third_party_analysis'`, `provider = 'SGS'`
- Dispute `resolution_type = 'replacement_accepted'` is a valid enum; recorded on `disputes` table
- Supplier payment/resolution track record shows resolved disputes count; `resolution_type` is visible to buyers on the supplier's profile

---

**Postconditions**

- `supplier_profiles.profile_status = 'active'`
- ISO 9001: `authenticity_status = 'DigitallyVerified'`; ISO 14001: `authenticity_status = 'Uploaded'`
- `compliance_standards` array includes at least `REACH` and `ISO 9001`
- 3 product lines with MOQ and lead time populated
- ≥ 1 match record with an EU buyer

---

**Test Notes**

- **Fixture required:** Open buyer sourcing request, Chemicals / Cleaning & Detergent Chemicals, `country = 'NL'`, `required_certifications` includes `ISO 9001` or `REACH`, `quantity_unit = 'MT'`, `quantity_required ≥ 1`
- **Bureau Veritas API mock:** Stub returns `DigitallyVerified`; real integration uses VCR cassette
- **GHS detection:** Uploading TDS with GHS H-statements triggers an informational banner (not a block); assert banner text contains "Safety Data Sheet"
- **REACH partial match:** Buyer requiring full REACH registration; supplier with pre-registration only → `matches.match_type = 'partial'`; match card renders gap flag
- **CS-1 product line addition post-publish:** Assert new `product_lines` record triggers match re-run; assert updated profile renders the new product line within 60 seconds of save
- **CS-2 SGS analysis milestone:** `deal_milestones.type = 'third_party_analysis'`; `dispute_evidence` records for both parties; `disputes.resolution_type = 'replacement_accepted'` valid enum

---

---

## UC-C02

### Chemicals & Raw Materials — Buyer: Henk van der Berg, Rotterdam, Netherlands

**Context**

Henk van der Berg is the Procurement Director at BioClean Solutions, a 70-person Rotterdam-based contract manufacturer of eco-label household and industrial cleaning products. Their customers include private-label supermarket chains and B2B facilities management companies. BioClean is reformulating their core surface cleaner range to use bio-based surfactants (APG or SLSA) as the active ingredient, targeting EU Ecolabel certification for the finished product. Henk needs a reliable supplier: bio-based surfactants, REACH registered, preferably COSMOS-approved, 3–10 MT/month, DAP Rotterdam, 30-day payment terms. His existing surfactant supplier (Germany-based) is discontinuing the APG grade he uses.

**Preconditions**

- No prior Gracera account
- At least 1 active supplier in Chemicals / Cleaning & Detergent Chemicals or Chemicals / Specialty Chemicals, REACH compliant, `moq ≤ 3000 kg (3 MT)`, `profile_status = 'active'`

---

**Main Flow**

| Step | Actor action | System response |
|------|-------------|----------------|
| 1 | Registers; selects "Buyer"; primary industry "Chemicals & Raw Materials" | Account created; sourcing request builder |
| 2 | Selects category "Chemicals & Raw Materials > Cleaning & Detergent Chemicals"; template pre-fills: typical certifications (ISO 9001, REACH, Ecocert), standard incoterms (DAP, DDP, CIF), common units (MT, kg, L) | Template applied |
| 3 | Certification auto-suggest: *"Buyers importing chemical raw materials to the Netherlands (EU) require REACH registration from the supplier. SDS in Dutch or English is required. For EU Ecolabel end products, sourcing COSMOS-approved or Ecocert ingredients is recommended."* Henk adds REACH (required) and COSMOS-approved (preferred, not required) | `required_certifications` updated |
| 4 | Fills product requirements: `product_name = "Alkyl polyglucoside (APG) surfactant — bio-based"`, `quantity_required = 5`, `quantity_unit = "MT"`, `order_frequency = "Monthly"`, `preferred_incoterms = ["DAP"]`, `preferred_payment_terms = ["Net 30"]`, `max_moq = 5` (MT) | Fields saved |
| 5 | Writes `ideal_supplier_description` (200 words: established surfactant manufacturer, REACH full registration, supply chain traceability for bio-based feedstock, SDS in English, COA per batch, experience supplying EU contract manufacturers) | Completeness 74% |
| 6 | Live match preview: *"Your request matches 7 suppliers. Requiring COSMOS-approved (not just REACH) narrows to 3."* Henk sets COSMOS as preferred, not required — keeps 7 matches | 7 matches retained |
| 7 | Publishes sourcing request | `status = 'open'`; match run triggered |
| 8 | First 5 matches shown within 1 hour | Cards include: supplier country, ISO 9001 / REACH / COSMOS badges, product names, lead time, MOQ |
| 9 | Opens Chemova Industries (India) match: Bureau Veritas ISO 9001 DigitallyVerified, REACH pre-registration flag with note, COSMOS Approved indicator | Match card shows gap flag: *"REACH pre-registration. Confirm full registration status with supplier before ordering above the 1 MT/year threshold."* |
| 10 | Coaching card: *"Rajesh Sharma (VP Sales & Marketing) — experienced exporter, 15+ years. He will respond quickly and is comfortable with EU documentation requirements. Ask for the REACH pre-registration number and SDS upfront."* | Card shown |
| 11 | Sends RFQ: requests REACH pre-registration number, SDS, product specification sheet for APG 810 and APG 1214, and sample (500g each) | RFQ delivered to Rajesh (commercial) |

---

**Alternate Flows**

| ID | Trigger | System response |
|----|---------|----------------|
| AF-1 | Henk sets `quantity_unit = "MT"` and `quantity_required = 5`; a supplier's MOQ is listed in kg (5,000 kg = 5 MT); platform can't reconcile units | Matching engine normalises common unit conversions (MT ↔ kg, L ↔ mL); suppliers with MOQ 5,000 kg included; displayed as "5,000 kg (5 MT)" on match card |
| AF-2 | Henk receives a quote with a price in USD/MT; he wants to see it in EUR | Currency displayed in buyer's preferred currency (EUR); USD price shown in brackets; exchange rate timestamped |
| AF-3 | Henk wants to know the EU tariff rate for importing APG from India (HS 3402.13) | AI-Brain query: *"What is the EU import tariff for APG surfactants from India under HS 3402.13?"* — AI-Brain responds with current rate and notes EU-India trade agreement status; flags to verify with a customs broker |
| AF-4 | BioClean completes a deal with Chemova; Henk pays on time (Net 30, confirmed by Chemova) | `on_time_payment_rate` updated on `buyer_profiles`; `completed_deals_count = 1`; `avg_days_to_payment` calculated; Payment Track Record now visible to future suppliers |
| AF-5 | A month later, Henk's surfactant need becomes recurring; he creates a standing order request | Repeat order flow (Phase 3): "Reorder" button on closed deal; pre-fills new sourcing request from prior RFQ parameters; Chemova notified as priority match |
| AF-6 | Henk's first shipment arrives at Rotterdam port; the SDS (Safety Data Sheet) is in English only; Dutch customs requires an SDS in Dutch or English for EU import — English is acceptable, but the port inspector questions the EU format (Regulation 1907/2006 format vs the Indian SDS format Rajesh used) | Henk contacts Rajesh; Rajesh provides an EU-format SDS (Regulation 1907/2006, 16-section format) within 48 hours; shipment released; Rajesh updates all his EU customer SDS templates going forward |
| AF-7 | Henk's existing German surfactant supplier announces discontinuation of his APG grade with 30 days notice (contractually required: 6 months) | Urgent sourcing situation; Henk reopens his Gracera sourcing request with `urgency = 'high'`, `required_by = 30 days`; match engine prioritises suppliers with `availability_status = 'Available'` and short lead times; Chemova has 3-week lead time and available stock — becomes the primary candidate |
| AF-8 | After BioClean achieves EU Ecolabel certification using Chemova's COSMOS APG as an ingredient, Chemova raises their price by 18%; Henk is now locked into a formulation that depends on this specific ingredient | Henk negotiates; AI-Brain: *"You have leverage: switching to a different APG supplier requires a reformulation and potentially a new EU Ecolabel application — a significant cost. Use this to negotiate a supply agreement with a price cap and volume commitment, rather than accepting the increase outright."* Henk and Rajesh negotiate a 2-year supply agreement with a price cap and annual CPI adjustment clause |

---

**Complex Multi-Step Scenarios**

### CS-1: Urgent Sourcing Under 30-Day Deadline

**Trigger:** Henk's German supplier announces they are discontinuing his APG grade in 30 days. Henk has 6 weeks of stock. If he can't find a replacement supplier in 2 weeks, production shuts down.

**Sequence:**
1. Henk receives the discontinuation notice on a Monday morning; logs into Gracera immediately
2. Reopens his sourcing request (was Closed from a prior search); updates: `urgency = 'high'`, `required_delivery_date = 30 days`, re-activates
3. Match engine prioritises: `availability_status = 'Available'`, lead times ≤ 25 days, REACH compliant, ≥ 3 MT stock available
4. Chemova appears as the top match; Rajesh's profile shows `availability_status = 'Available'`, lead time 18–21 days FOB Mumbai
5. Henk sends an RFQ marked "Urgent" in the Deal Room subject line; Rajesh responds within 4 hours (within his 24h committed response time)
6. Quote provided: 10 MT APG 810, 99.1% purity, COA included, lead time 18 days FOB Mumbai, DAP Rotterdam quoted as well
7. Henk requests an air freight option for the first 2 MT (to bridge his stock gap); Rajesh provides an air freight quote: €3.80/kg premium — 8× the sea freight cost
8. Henk decides: air freight 2 MT (arrival day 5), sea freight 8 MT (arrival day 26); places split order
9. First 2 MT arrive by air on day 5; production continues; 8 MT arrive by sea on day 26; full stock replenished

**Expected resolution:** Urgency flag surfaces time-sensitive requests to suppliers who respond quickly. Split shipment (air + sea) is a legitimate negotiation outcome handled in the Deal Room.

**Test assertions:**
- Sourcing request `urgency` field and `required_delivery_date` field affect match ranking (suppliers with shorter lead times ranked higher when urgency is set)
- RFQ with a subject line or body containing "Urgent" does not get special treatment at the system level — urgency is communicated via the fields, not free text (assert the matching prioritisation comes from the structured fields)
- Split order (2 line items in the quote with different shipment methods) is a valid quote structure; `quote_line_items` supports `shipment_method` per line

---

### CS-2: Price Lock Expires — Renegotiating When Locked Out

**Trigger:** Henk negotiated a 12-month fixed-price supply agreement with Chemova. 9 months in, palm kernel oil (the APG feedstock) price has risen 31%. Rajesh approaches Henk to renegotiate. Henk's contract has no escalation clause.

**Sequence:**
1. Rajesh sends a Deal Room message with palm kernel oil price index data (public commodity data, attached as PDF) showing the 31% increase over 9 months
2. Rajesh requests a 15% price increase for the remaining 3 months of the contract
3. Henk reviews the signed agreement (stored in `deal_contracts`); confirms no escalation clause
4. Henk is not legally obligated to accept; but Rajesh is threatening to not renew the supply agreement at current pricing
5. Henk queries AI-Brain: *"My supplier wants to raise prices mid-contract due to raw material costs. I have a fixed-price PO with no escalation clause. Can they force this?"*
6. AI-Brain: *"No — a fixed-price PO is binding. However, if they refuse to renew after the contract ends, your supply is at risk. Consider: (1) Hold firm for the 3 remaining months — they will likely honour the contract; (2) Begin qualifying a backup supplier now to reduce your dependency; (3) Offer a one-time goodwill adjustment of 5–8% in exchange for a 24-month renewal with an explicit escalation clause (e.g. CPI + commodity index) — this protects both sides."*
7. Henk proposes option (3): 7% goodwill adjustment for the remaining 3 months; 24-month renewal with a palm oil index escalation clause capped at ±10% per year
8. Rajesh accepts; deal amendment created; e-signed by both parties
9. Both parties record the escalation clause language in the Deal Room amendment for future reference

**Expected resolution:** AI-Brain provides leverage-aware negotiation coaching. Deal amendment with an escalation clause is a mature supply agreement outcome. The platform enables the agreement — it doesn't mandate the terms.

**Test assertions:**
- `deal_contracts.type = 'amendment'` accepted; amendment references `parent_contract_id`
- Amendment e-signature creates `signatures` record for each party with `timestamp` and `ip_address`
- AI-Brain query in Deal Room context includes the active contract's key terms in the prompt context (if contract text is parseable — Phase 4; mark `@skip // Phase 4`)

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.primary_contact_role = 'procurement_manager'`
- `required_certifications` includes REACH; COSMOS listed as preferred
- ≥ 1 match record with a supplier holding REACH compliance
- If UC-C01 fixture present: RFQ sent to Chemova Industries

---

**Test Notes**

- **Fixture required:** Active supplier, Chemicals / Cleaning & Detergent Chemicals, `country = 'IN'`, ISO 9001 DigitallyVerified, REACH in `compliance_standards`, `moq ≤ 5000` (kg), `profile_status = 'active'`
- **Unit normalisation assertion:** Buyer `quantity_unit = 'MT'`, supplier `moq_unit = 'kg'` with `moq = 5000`; assert these are treated as equivalent in the matching engine; display shows both units
- **Payment track record assertion:** After a deal is marked complete with payment confirmed, `buyer_profiles.on_time_payment_rate`, `completed_deals_count`, and `avg_days_to_payment` fields are updated; visible to suppliers on buyer profile page
- **REACH gap flag assertion:** Supplier with `REACH` in `compliance_standards` but no full REACH registration cert renders a `partial_match` flag on the match card with gap description text
- **AI-Brain tariff query:** Phase 4 feature; mark as `@skip // Phase 4`; assert AI-Brain context includes buyer's active HS chapters
- **CS-1 urgency ranking:** Sourcing request with `urgency = 'high'` and `required_delivery_date` ranks suppliers with shorter lead times higher; assert rank order changes vs no-urgency baseline
- **CS-2 deal amendment:** `deal_contracts.type = 'amendment'`, `parent_contract_id` required; `signatures` records created per party with `timestamp`

---

[Back to README](../README.md)
