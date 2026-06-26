# Category Taxonomy

Gracera's category taxonomy is the backbone of the matching engine. Every supplier product line, every buyer sourcing request, and every programmatic SEO page is anchored to a node in this tree. Match quality depends directly on taxonomy quality — too broad and everything matches everything; too narrow and real matches get missed.

---

## 1. Structure

Three levels:

```
Level 1 — Vertical        (e.g. Food & Beverage)
  Level 2 — Category      (e.g. Sauces & Condiments)
    Level 3 — Subcategory (e.g. Hot Sauce & Chili Paste)
```

- **Level 1** — 15 top-level verticals covering the full range of global B2B trade
- **Level 2** — 5–12 categories per vertical (~120 total)
- **Level 3** — Leaf nodes for the 6 Priority Verticals at launch; other verticals gain Level 3 nodes as they are activated

**In matching:** The hard filter checks Level 1–2 overlap. Claude's semantic scoring evaluates Level 3 fit (how precisely the supplier's subcategory matches the buyer's sourcing need).

**In programmatic SEO:** Combination pages are generated at Level 2 (e.g. `/suppliers/sauces-condiments/south-korea`) and Level 3 (e.g. `/suppliers/hot-sauce/south-korea/fssc-22000-certified`).

**Priority Verticals** — the 6 verticals where Gracera invests in community forums, specialist white-glove onboarding, trade show presence, and trade association partnerships at launch. All 15 verticals are available for matching and SEO from day one; Priority Verticals get deeper product investment.

---

## 2. Full Taxonomy

### V01 · Food & Beverage ⭐ Priority Vertical
*HS Chapters: 01–24*

| Level 2 | Level 3 (selected) |
|---------|-------------------|
| Grains, Starches & Flour | Rice, Wheat Flour, Corn Starch, Tapioca, Oats |
| Oils & Fats | Vegetable Oils, Olive Oil, Coconut Oil, Animal Fats, Margarine |
| Sugar & Confectionery | Refined Sugar, Honey, Chocolate, Candy, Chewing Gum |
| Sauces, Condiments & Seasonings | Hot Sauce & Chili Paste, Soy Sauce, Fish Sauce, Vinegar, Spice Blends |
| Dairy & Eggs | Cheese, Butter, Milk Powder, Yogurt, Eggs |
| Seafood & Marine Products | Frozen Fish, Dried Seafood, Canned Seafood, Shrimp & Shellfish, Seaweed |
| Meat & Poultry | Frozen Meat, Canned Meat, Processed Meat, Halal Meat, Organic Meat |
| Fresh & Frozen Produce | Fruits, Vegetables, Frozen Vegetables, Herbs |
| Beverages — Non-Alcoholic | Juice, Tea & Coffee, Energy Drinks, Water, Functional Drinks |
| Beverages — Alcoholic | Beer, Wine, Spirits, Traditional/Regional Beverages |
| Food Additives, Flavors & Colors | Natural Flavors, Artificial Flavors, Preservatives, Emulsifiers, Food Colors |
| Organic & Natural Foods | Organic Certified Products, Clean Label, Non-GMO, Vegan/Vegetarian |
| Snacks & Processed Foods | Chips & Crackers, Instant Noodles, Canned Goods, Ready Meals, Dried Snacks |
| Baby & Infant Food | Formula, Purées, Cereals, Snacks |

---

### V02 · Electronics & Components ⭐ Priority Vertical
*HS Chapters: 84–85, 90*

| Level 2 | Level 3 (selected) |
|---------|-------------------|
| Passive Components | Resistors, Capacitors, Inductors, Transformers, Filters |
| Active Components & ICs | Microcontrollers, CPUs, Memory ICs, Power ICs, RF ICs |
| PCB & PCBA | Bare PCB Fabrication, PCB Assembly (SMT/THT), Flex PCB, HDI PCB |
| Consumer Electronics | Smartphones & Tablets (components), Smart Home Devices, Wearables, Audio Equipment |
| Industrial Electronics & Automation | PLCs, HMIs, Servo Drives, Sensors, Industrial IoT |
| LED & Lighting | LED Chips, LED Modules, LED Strips, Commercial Fixtures, Street Lighting |
| Cables, Connectors & Wiring | USB & Data Cables, Power Cables, RF Connectors, Fiber Optic Cables |
| Power Supplies & Batteries | AC/DC Power Supplies, Li-ion Batteries, Battery Packs, UPS, Solar Batteries |
| Security & Surveillance | IP Cameras, NVR/DVR, Access Control, Alarm Systems |
| Communication Equipment | Network Switches, Routers, Antennas, 5G Components |
| Electronic Displays | LCD Panels, OLED Displays, E-ink, LED Displays, Touchscreens |

---

### V03 · Apparel & Textiles ⭐ Priority Vertical
*HS Chapters: 50–63*

| Level 2 | Level 3 (selected) |
|---------|-------------------|
| Women's Clothing | Tops & Blouses, Dresses & Skirts, Outerwear, Swimwear |
| Men's Clothing | Shirts, Trousers & Suits, Outerwear, Casual Wear |
| Children's Clothing | Infant Wear, Kids Tops & Bottoms, School Uniforms |
| Sportswear & Activewear | Running & Gym Wear, Team Uniforms, Outdoor Sports Apparel |
| Workwear & Uniforms | Hi-Vis Workwear, Corporate Uniforms, Chef & Hospitality Wear, Medical Scrubs |
| Underwear & Intimates | Bras & Underwear, Sleepwear, Socks & Hosiery |
| Footwear | Sneakers & Athletic, Dress Shoes, Boots, Sandals, Safety Footwear |
| Accessories | Bags & Backpacks, Hats & Caps, Belts & Wallets, Scarves |
| Woven Fabrics | Cotton Wovens, Polyester Wovens, Linen, Wool, Technical Fabrics |
| Knitted Fabrics | Jersey, Interlock, Fleece, Mesh, Rib Knit |
| Yarn & Thread | Spun Yarn, Filament Yarn, Sewing Thread, Embroidery Thread |
| Nonwovens & Technical Textiles | Nonwoven Fabrics, Filtration Textiles, Geotextiles, Medical Nonwovens |

---

### V04 · Industrial Parts & Manufacturing ⭐ Priority Vertical
*HS Chapters: 73–83*

| Level 2 | Level 3 (selected) |
|---------|-------------------|
| Metal Fabrication & Castings | CNC Machined Parts, Die Castings, Sheet Metal Fabrication, Forgings, Stampings |
| Fasteners & Hardware | Bolts & Screws, Nuts & Washers, Rivets, Anchors, Wire Rope |
| Valves & Fittings | Ball Valves, Gate Valves, Check Valves, Pipe Fittings, Flanges |
| Pipes & Tubes | Steel Pipes, Aluminum Tubes, Plastic Pipes, Flexible Hoses |
| Bearings & Transmission | Ball Bearings, Roller Bearings, Gears, Couplings, Chains |
| Seals, Gaskets & Rubber Parts | O-Rings, Seals, Gaskets, Custom Rubber Molding |
| Tools & Equipment | Cutting Tools, Hand Tools, Pneumatic Tools, Jigs & Fixtures |
| Springs & Precision Parts | Compression Springs, Extension Springs, Precision Turned Parts |
| Safety Equipment (Industrial) | Hard Hats, Safety Harnesses, Gloves, Eye & Ear Protection, Respiratory PPE |
| Plastics & Polymer Parts | Injection Molded Parts, Extruded Profiles, Thermoformed Parts, PTFE & Engineering Plastics |

---

### V05 · Health, Beauty & Personal Care ⭐ Priority Vertical
*HS Chapters: 30, 33, 34*

| Level 2 | Level 3 (selected) |
|---------|-------------------|
| Skincare | Moisturizers & Serums, Sunscreen, Cleansers & Toners, Anti-aging, Acne Treatment |
| Color Cosmetics | Foundation & Concealer, Lip Products, Eye Makeup, Nail Polish, Setting Products |
| Hair Care | Shampoo & Conditioner, Hair Treatments & Masks, Styling Products, Hair Color |
| Body & Bath | Body Lotions, Shower Gels, Bath Bombs, Deodorants, Hand Creams |
| Fragrances | Eau de Parfum, Eau de Toilette, Body Mist, Aroma Diffusers |
| Oral Care | Toothpaste, Toothbrushes, Mouthwash, Teeth Whitening |
| Men's Grooming | Shaving Products, Men's Skincare, Beard Care |
| Nutritional Supplements | Vitamins & Minerals, Protein Supplements, Probiotics, Herbal Supplements, Sports Nutrition |
| OTC Pharmaceuticals | Pain Relief, Cold & Flu, Digestive Health, Topical Treatments |
| Baby & Child Personal Care | Baby Skincare, Baby Shampoo, Nappies & Wipes, Baby Oral Care |

---

### V06 · Chemicals & Raw Materials ⭐ Priority Vertical
*HS Chapters: 28–40*

| Level 2 | Level 3 (selected) |
|---------|-------------------|
| Industrial Chemicals | Acids & Alkalis, Solvents, Oxidizing Agents, Industrial Gases |
| Specialty Chemicals | Surfactants, Chelating Agents, Catalysts, Polymer Additives |
| Agricultural Chemicals | Herbicides, Pesticides, Fungicides, Plant Growth Regulators |
| Adhesives & Sealants | Epoxy Adhesives, Hot Melt, Silicone Sealants, Structural Adhesives |
| Paints, Coatings & Inks | Industrial Coatings, Architectural Paints, UV Inks, Powder Coatings |
| Plastics & Polymers (Raw) | PET, PP, PE, PVC, ABS, Polycarbonate, Engineering Resins |
| Rubber (Raw & Synthetic) | Natural Rubber, SBR, EPDM, Silicone Rubber, Latex |
| Cleaning & Detergent Chemicals | Surfactants, Biocides, Enzyme Cleaners, Industrial Degreasers |
| Water Treatment Chemicals | Coagulants, Flocculants, Disinfectants, Scale Inhibitors |
| Lab & Research Chemicals | Analytical Reagents, Solvents (lab grade), Standards & Reference Materials |

---

### V07 · Construction & Building Materials
*HS Chapters: 25, 68–70, 72–73*

| Level 2 |
|---------|
| Structural Steel & Metal Profiles |
| Cement, Concrete & Aggregates |
| Timber & Engineered Wood Products |
| Bricks, Blocks & Masonry |
| Flooring (Tiles, Hardwood, Vinyl, Carpet) |
| Roofing & Waterproofing |
| Doors, Windows & Curtain Walls |
| Insulation Materials |
| Electrical & Plumbing Fittings |
| Interior Finishes (Drywall, Plaster, Ceiling Systems) |
| Smart Building Systems & Controls |
| Prefab & Modular Construction |

---

### V08 · Agriculture & Agrifood
*HS Chapters: 01–14, 84 (agricultural machinery)*

| Level 2 |
|---------|
| Seeds & Planting Materials |
| Fertilizers & Soil Amendments |
| Crop Protection (Pesticides, Fungicides, Herbicides) |
| Agricultural Machinery & Equipment |
| Irrigation & Water Management Systems |
| Animal Feed & Supplements |
| Livestock & Aquaculture |
| Greenhouse & Controlled Environment Agriculture |
| Post-Harvest & Storage Equipment |
| Agricultural Inputs (Mulch, Growing Media, Films) |

---

### V09 · Automotive & Transportation
*HS Chapters: 40, 84, 87–89*

| Level 2 |
|---------|
| Engine & Powertrain Components |
| Transmission & Drivetrain |
| Braking Systems & Suspension |
| Body Parts & Exterior Accessories |
| Automotive Electrical & Electronics |
| Tires, Wheels & Rims |
| Truck & Commercial Vehicle Parts |
| Motorcycle & Scooter Parts |
| EV Components & Charging Equipment |
| Marine Equipment & Accessories |
| Aerospace Components |
| Automotive Interior & Comfort |

---

### V10 · Medical & Healthcare Equipment
*HS Chapter: 90*

| Level 2 |
|---------|
| Diagnostic Imaging Equipment |
| Patient Monitoring Systems |
| Surgical Instruments & Supplies |
| Hospital Furniture & Beds |
| Disposables & Medical Consumables |
| Rehabilitation & Physiotherapy Equipment |
| Dental Equipment & Supplies |
| Laboratory & Diagnostic Equipment |
| Veterinary Equipment & Supplies |
| Telemedicine & Digital Health Devices |

---

### V11 · Packaging
*HS Chapters: 39, 44, 48, 63, 70, 73*

| Level 2 |
|---------|
| Corrugated & Paperboard Boxes |
| Flexible Packaging (Pouches, Bags, Films) |
| Rigid Plastic Containers (Bottles, Jars, Tubs) |
| Glass Bottles & Jars |
| Metal Cans, Drums & Aerosols |
| Labels, Tags & Stickers |
| Industrial & Transit Packaging (Pallets, Strapping, Stretch Film) |
| Sustainable & Biodegradable Packaging |
| Caps, Closures & Dispensers |
| Packaging Machinery & Equipment |

---

### V12 · Machinery & Equipment
*HS Chapter: 84*

| Level 2 |
|---------|
| Food & Beverage Processing Machinery |
| Textile & Apparel Machinery |
| Metalworking & CNC Machinery |
| Plastic & Rubber Processing Machinery |
| Packaging & Labeling Machinery |
| Woodworking Machinery |
| Construction & Mining Equipment |
| Material Handling (Forklifts, Conveyors, Cranes) |
| HVAC & Refrigeration Equipment |
| Pumps, Compressors & Pneumatics |
| Generators & Power Generation |
| Printing & Paper Processing Machinery |

---

### V13 · Home, Furniture & Decor
*HS Chapters: 44, 69, 94*

| Level 2 |
|---------|
| Living Room Furniture (Sofas, Tables, Cabinets) |
| Bedroom Furniture (Beds, Wardrobes, Nightstands) |
| Office Furniture (Desks, Chairs, Storage) |
| Kitchen & Bathroom Furniture |
| Decorative Lighting (Chandeliers, Lamps, Wall Lights) |
| Home Textiles (Curtains, Rugs, Cushions, Throws) |
| Kitchenware & Cookware |
| Tableware & Serveware |
| Home Decor & Ornaments |
| Garden & Outdoor Furniture |
| Storage & Organization Products |

---

### V14 · Sports, Toys & Recreation
*HS Chapters: 92, 95*

| Level 2 |
|---------|
| Team & Ball Sports Equipment |
| Fitness & Gym Equipment |
| Outdoor & Camping Gear |
| Water Sports & Swimming |
| Winter Sports Equipment |
| Infant & Preschool Toys |
| Educational Toys & STEM |
| Electronic & Interactive Toys |
| Games, Puzzles & Trading Cards |
| Musical Instruments |
| Arts, Crafts & Hobby Supplies |
| Pet Supplies & Accessories |

---

### V15 · Energy & Environment
*HS Chapters: 84–85*

| Level 2 |
|---------|
| Solar Panels & PV Modules |
| Solar Inverters & Balance of System |
| Wind Energy Components |
| Batteries & Energy Storage Systems |
| EV Charging Equipment & Infrastructure |
| Water Purification & Treatment Systems |
| Air Filtration & Purification |
| Waste Management & Recycling Equipment |
| Environmental Monitoring Instruments |
| Energy-Efficient Lighting (Commercial/Industrial) |
| Biogas & Biomass Systems |

---

## 3. Priority Verticals at Launch

| Vertical | Code | Community Forum | Specialist Onboarding | Trade Show Presence |
|----------|------|-----------------|-----------------------|-------------------|
| Food & Beverage | V01 | ✓ Phase 4 | ✓ Phase 2 | Fancy Food Show, SIAL |
| Electronics & Components | V02 | ✓ Phase 4 | ✓ Phase 2 | Electronica, COMPUTEX |
| Apparel & Textiles | V03 | ✓ Phase 4 | ✓ Phase 2 | Magic Las Vegas, Texworld |
| Industrial Parts & Manufacturing | V04 | ✓ Phase 4–5 | ✓ Phase 2 | Hannover Messe, IMTS |
| Health, Beauty & Personal Care | V05 | ✓ Phase 5 | Phase 3 | Cosmoprof, In-Cosmetics |
| Chemicals & Raw Materials | V06 | ✓ Phase 5 | Phase 3 | ChemShow, ICIS Forums |

The remaining 9 verticals (V07–V15) are available for supplier registration, matching, and programmatic SEO from Phase 1 but do not receive specialist onboarding programs or community forums until Phase 5+.

---

## 4. HS Code Alignment

Each category node stores a `hs_chapters` array mapping to relevant HS tariff chapters. This enables:
- **Trade policy alerts** — triggered when a tariff change affects an HS chapter that overlaps a user's active categories
- **Certification requirement lookup** — some certifications are required by HS chapter (e.g. FDA registration for HS 21.xx food preparations importing to the US)
- **HS code search** — buyers who know their HS code can find suppliers tagged to the same chapter

| Vertical | Primary HS Chapters |
|----------|-------------------|
| Food & Beverage | 01–24 |
| Electronics & Components | 84–85, 90 |
| Apparel & Textiles | 50–63 |
| Industrial Parts & Manufacturing | 73–83 |
| Health, Beauty & Personal Care | 30, 33–34 |
| Chemicals & Raw Materials | 28–40 |
| Construction & Building Materials | 25, 68–70, 72–73 |
| Agriculture & Agrifood | 01–14 (raw), 84 (machinery) |
| Automotive & Transportation | 40, 84, 87–89 |
| Medical & Healthcare Equipment | 90 |
| Packaging | 39, 44, 48, 63, 70, 73 |
| Machinery & Equipment | 84 |
| Home, Furniture & Decor | 44, 69, 94 |
| Sports, Toys & Recreation | 92, 95 |
| Energy & Environment | 84–85 |

---

## 5. Data Model

```sql
CREATE TABLE categories (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  slug         VARCHAR(120) NOT NULL UNIQUE,   -- used in URLs and search
  parent_id    INTEGER REFERENCES categories(id) NULLABLE,
  level        SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
  vertical_code CHAR(3),                       -- V01–V15 for Level 1 rows
  hs_chapters  TEXT[],                         -- e.g. ['01','02','03']
  is_priority_vertical BOOLEAN DEFAULT FALSE,  -- Level 1 only
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT now()
);

CREATE INDEX ON categories (parent_id);
CREATE INDEX ON categories (slug);
```

**Usage in other tables:**
- `supplier_profiles.categories` — `INTEGER[]` of Level 2 or Level 3 category IDs
- `buyer_profiles.industry` — single Level 1 or Level 2 category ID
- `sourcing_requests.category_id` — single Level 2 or Level 3 category ID
- `programmatic_pages` — generated for every active Level 2 node with ≥ 3 verified suppliers

---

## 6. Taxonomy Governance

| Rule | Detail |
|------|--------|
| **Who owns it** | Product team; changes require a product review (not engineering-only) |
| **Adding a Level 2 node** | Requires ≥ 10 supplier registrations attempting to tag an unmapped product; product team approves and assigns HS chapters |
| **Adding a Level 3 node** | Requires ≥ 5 sourcing requests using free-text that maps to the same concept; product team creates the node and retroactively re-tags |
| **Merging nodes** | Old slug redirects to new slug permanently (301); all FK references updated in a migration |
| **Deprecating nodes** | Set `active = false`; existing profiles retain the tag but new registrations cannot select it; tag shown as "Legacy" in UI |
| **HS chapter updates** | Reviewed annually against the WCO HS revision cycle (next: 2027) |

---

[Back to README](../README.md)
