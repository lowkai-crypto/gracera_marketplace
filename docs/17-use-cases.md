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

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.primary_contact_role = 'operations_manager'` (or update to reflect VP Engineering — closest enum match is `operations_manager` or add engineering role)
- ≥ 1 match record
- If UC-I01 fixture present: RFQ record created in `rfqs` table with `supplier_profile_id = Precision One`

---

**Test Notes**

- **Fixture required:** Active supplier, Industrial / Metal Fabrication & Castings, `country = 'TW'`, ISO 9001 DigitallyVerified, `moq ≤ 300`, `lead_time_days ≤ 56`, `availability_status = 'Available'`
- **RFQ routing assertion:** RFQ sent to supplier with a registered `technical` contact results in 2 notification records — one for primary contact, one for technical contact
- **File size assertion:** Upload of file > 25MB returns HTTP 413 with user-readable error message
- **Lead time filter assertion:** Suppliers with `lead_time_days > 56` on all product lines excluded when buyer sets `max_lead_time_days = 56`

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
- **Broadcast Campaign:** Phase 3 feature; mark test as `@skip` with `// Phase 3` comment
- **Sample tracking:** Sample request in Deal Room creates a `deal_milestones` record with `type = 'sample_dispatched'`

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

---

**Postconditions**

- `sourcing_requests.status = 'open'`
- `buyer_profiles.primary_contact_role = 'procurement_manager'` (closest enum for Procurement Director)
- `required_certifications` includes REACH; COSMOS listed as preferred
- ≥ 1 match record with a supplier holding REACH compliance
- If UC-C01 fixture present: RFQ sent to Chemova Industries

---

**Test Notes**

- **Fixture required:** Active supplier, Chemicals / Cleaning & Detergent Chemicals, `country = 'IN'`, ISO 9001 DigitallyVerified, REACH in `compliance_standards`, `moq ≤ 5000` (kg), `profile_status = 'active'`
- **Unit normalisation assertion:** Buyer `quantity_unit = 'MT'`, supplier `moq_unit = 'kg'` with `moq = 5000`; assert these are treated as equivalent in the matching engine; display shows both units
- **Payment track record assertion:** After a deal is marked complete with payment confirmed, `buyer_profiles.on_time_payment_rate`, `completed_deals_count`, and `avg_days_to_payment` fields are updated; visible to suppliers on buyer profile page
- **REACH gap flag assertion:** Supplier with `REACH` in `compliance_standards` but no full REACH registration cert renders a `partial_match` flag on the match card with gap description text
- **AI-Brain tariff query:** Phase 4 trade policy feature; mark as `@skip` with `// Phase 4` comment; test that AI-Brain context includes buyer's active HS chapters

---

[Back to README](../README.md)
