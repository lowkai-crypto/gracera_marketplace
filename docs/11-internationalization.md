# Internationalization

Gracera is built for global trade. This document covers multi-language support, multi-currency handling, and international trade compliance features.

---

## 1. Language Support

### Phase 1 (Launch)
- English (default)
- Simplified Chinese (zh-CN)
- Spanish (es)
- Arabic (ar) — right-to-left layout support required

### Phase 2+
- Korean (ko), Japanese (ja), Portuguese (pt-BR), French (fr), German (de), Vietnamese (vi)

### Implementation

| Concern | Approach |
|---------|----------|
| UI strings | i18next (React) with locale JSON files |
| User-generated content | Stored in original language; translated on-demand via DeepL API |
| AI-generated match rationale | Delivered in the viewing user's preferred language |
| Search | Elasticsearch language-aware analyzers per locale |
| Email templates | Localized per user's `preferred_language` setting |
| Date/time formatting | Intl.DateTimeFormat — locale-aware |
| Number formatting | Intl.NumberFormat — locale-aware |
| RTL layout | CSS `dir="rtl"` via Next.js locale detection |

### Profile Content Translation

Supplier and buyer profiles are entered in the user's chosen language. When a user views a profile in a different language:
1. Check if a human translation exists (user-provided)
2. If not, request machine translation (DeepL) and cache it
3. Show a "Machine translated" badge; user can request to see original

---

## 2. Currency Support

### Supported Currencies at Launch

USD, EUR, CNY, HKD, SGD, JPY, KRW, AUD, CAD, GBP, MXN, BRL

### How Prices Are Stored

All prices in the database are stored in **USD** as the canonical currency. Display prices are converted at query time using live exchange rates.

```
price_usd = stored_price
display_price = price_usd × exchange_rate[user_currency]
```

Exchange rates are fetched from an FX API (e.g., Open Exchange Rates) and cached for 1 hour in Redis.

### User Currency Preference

- Set on account setup (defaults to country-based detection)
- Can be changed at any time in Settings
- Applied globally: all prices, budgets, and deal values shown in user's preferred currency
- Disclaimer shown: "Prices shown in [currency] are approximate. Final deal terms may differ."

### Deal Quotes

Quotes are submitted in the supplier's nominated currency. Buyers see both:
- Supplier's quoted currency
- Converted amount in buyer's preferred currency (for reference only)

The formal quote amount in the supplier's currency is the binding figure.

---

## 3. International Trade Features

### 3.1 HS Code Support

Suppliers tag each product line with a Harmonized System (HS) code. This enables:
- Buyers to filter by HS code (useful for importers who know the tariff code)
- Platform to surface applicable import/export restrictions
- Trade document generation with correct classification

### 3.2 Incoterms

Supported incoterms (ICC 2020):

| Code | Name |
|------|------|
| EXW | Ex Works |
| FCA | Free Carrier |
| CPT | Carriage Paid To |
| CIP | Carriage and Insurance Paid To |
| DAP | Delivered at Place |
| DPU | Delivered at Place Unloaded |
| DDP | Delivered Duty Paid |
| FAS | Free Alongside Ship |
| FOB | Free on Board |
| CFR | Cost and Freight |
| CIF | Cost, Insurance and Freight |

Both supplier profiles and quotes specify preferred/accepted incoterms. Mismatch flagged as a compatibility note.

### 3.3 Trade Document Templates

Available in the Deal Room once a quote is accepted:

| Template | Description |
|----------|-------------|
| Pro-forma Invoice | Supplier-generated invoice for customs/payment |
| Commercial Invoice | Final invoice post-shipment |
| Packing List | Line-item list for customs clearance |
| Certificate of Origin | Origin declaration template |
| Purchase Order | Buyer-generated PO template |
| Non-Disclosure Agreement | Mutual NDA for sensitive negotiations |

Templates are auto-populated from deal data (party names, product, quantity, terms) and editable in-platform. PDF export supported.

### 3.4 Regional Compliance Flags

The platform maintains a lightweight compliance database:

- **Restricted goods:** Alert when a product category has known import/export restrictions between the two countries
- **Sanctioned country pairs:** Hard block on introductions between parties in sanctioned country pairs (OFAC, EU, UN lists)
- **Certification requirements by destination:** Warn supplier if buyer's country requires certifications not in the supplier's profile (e.g., CE for EU, FDA for USA, HACCP for food)

> Note: Gracera provides compliance flags as informational guidance only. Users are responsible for their own legal compliance.

---

## 4. Time Zones

- All timestamps stored and transmitted as UTC (ISO 8601)
- User local timezone detected via browser `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Persisted in user settings (can be overridden)
- All UI timestamps displayed in the user's local timezone with UTC offset shown on hover

---

[Back to README](../README.md)
