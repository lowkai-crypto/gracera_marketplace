# Security & Trust

Gracera operates a two-sided marketplace where both sides depend on the platform to protect their business information and ensure the quality of counterparts they interact with. Trust is a core product feature, not an afterthought.

---

## 1. Identity & Authentication

| Control | Implementation |
|---------|---------------|
| Password hashing | bcrypt (min cost 12) |
| Session tokens | JWT with 15-minute expiry; refresh tokens rotate on use |
| MFA | TOTP (Google Authenticator compatible); optional at launch, required for admin accounts |
| SSO | OAuth2 via Google and LinkedIn |
| Brute-force protection | Account lockout after 10 failed attempts; exponential backoff |
| Session invalidation | All active tokens invalidated on password change |

---

## 2. Business Verification

Verification is how both parties signal trustworthiness. Three levels:

### Email Verification (Basic)
- Required to publish a profile
- Double opt-in: verification link expires in 24 hours

### Business Registration Verification (Verified)
- User provides business registration number and country
- Platform calls a third-party registry API (e.g., Companies House UK, SEC EDGAR, CIPC, etc.)
- Or manual review by Gracera trust team within 2 business days

### Certification Verification (Certified)
- User uploads certification documents
- Platform validates: issuing body, expiry date, certificate number format
- Physical documents checked by trust team for Premium level
- Where the issuing body provides a verification API (SGS, Bureau Veritas, TÜV, BSI, NSF, QIMA), the certificate is digitally verified and marked with a "Digitally Verified" badge — stronger than trust-team review

**Certification Expiry Management:**
- Automated alerts sent at 90, 60, and 30 days before each certificate's `expiry_date`
- Certificates not renewed by their expiry date are automatically marked "Expired", removed from matching filters that require them, and flagged on the public profile
- Buyers who accepted introductions from a supplier based on a certification that has since expired are notified within 24 hours of the expiry
- Suppliers can re-upload a renewed certificate document at any time to restore their status

### KYB (Know Your Business) — Premium
- Video call with Gracera trust team
- Documents reviewed: business registration, proof of address, owner ID
- Supplier must provide 2 contactable references

---

## 3. Data Privacy

### Personal Data

| Data Type | Stored | Visibility |
|-----------|--------|------------|
| Email address | Yes (hashed for search) | Never public; used for auth and notifications only |
| Phone number | Yes | Hidden until both parties accept introduction |
| Full contact details | Yes | Hidden until deal stage 1 (messaging opened) |
| Business registration number | Yes | Used for verification only; never displayed |
| Price targets / budgets | Yes | Used by AI only; never shown to counterparty |

### Compliance

| Standard | Status |
|----------|--------|
| GDPR | Required from day 1 (EU users) |
| CCPA | Required from day 1 (California users) |
| Data residency | User data stored in region closest to user (US-East, EU-West, AP-Southeast) |
| Data retention | User data retained 7 years post-deletion for legal/audit purposes; profile data deleted immediately |
| Right to erasure | Handled within 30 days of request; email anonymized, profile soft-deleted |

---

## 4. Profile Integrity

### Spam & Fake Profiles

| Control | Method |
|---------|--------|
| Rate limiting | Max 3 profile submissions per IP per day without verification |
| Bot detection | CAPTCHA on registration and profile submission |
| Duplicate detection | Fuzzy match on company name + country; flagged for manual review |
| AI content scanning | Profiles with plagiarized or nonsense descriptions flagged |

### Profile Claims

- Suppliers cannot claim certifications without uploading documents
- "Notable customers" field is not verified; shown with a "Self-reported" label
- Misrepresentation reported by another user triggers a trust review

### Document Authenticity Verification

Submitted certification documents go through a two-pass authenticity check before the "Certified" badge is awarded:

| Pass | Method | Result |
|------|--------|--------|
| Issuer API | Platform queries the issuing body's digital verification endpoint | "Digitally Verified" badge — strongest signal |
| AI pre-screening | Layout analysis, font consistency, metadata checks, cross-reference against known certificate formats | Flags suspected forgeries for manual escalation |
| Trust team review | Manual review for issuers without public APIs, and any document flagged by AI pre-screening | "Trust Team Verified" badge |

AI-generated or manipulated certificates are an increasing fraud vector in B2B trade. The AI pre-screening layer reduces trust team workload by catching obvious forgeries early, while issuer API verification provides cryptographic certainty for participating bodies.

---

## 5. Communication Safety

| Risk | Control |
|------|---------|
| PII in messages | Warn users not to share email/phone before mutual introduction is accepted; monitor for patterns |
| Phishing links | Scan message body for known phishing domains; block with warning |
| Spam messages | Rate limit: max 5 new conversations per day for unverified users |
| Harassment | One-click block; reported user's profile reviewed within 24 hours |

---

## 6. Platform Security

| Control | Implementation |
|---------|---------------|
| TLS | TLS 1.3 enforced; HSTS header |
| CORS | Strict allowlist; no wildcard origins |
| SQL injection | Parameterized queries via ORM; no string concatenation |
| XSS | Content Security Policy; React auto-escaping; DOMPurify for rich text |
| CSRF | SameSite=Strict cookies; CSRF token on state-changing requests |
| File uploads | Files scanned with ClamAV; only allowed MIME types accepted; stored in isolated S3 bucket |
| Secrets | No secrets in code; all secrets in AWS Secrets Manager / environment variables |
| Dependency scanning | Dependabot + Snyk on all repos |
| Penetration testing | Annual third-party pentest; critical findings resolved within 7 days |

---

## 7. Fraud Prevention

### Deal Fraud Signals

The platform flags deal-level fraud patterns:

| Pattern | Action |
|---------|--------|
| Supplier requests payment outside platform before deal room | Warning message to buyer; supplier flagged for review |
| Extremely low price vs. market (possible advance-fee fraud) | Buyer warning; match de-prioritized |
| Rapid account creation + immediate deal closure | Hold deal for manual review |
| Multiple accounts from same IP attempting to create artificial deal history | Account suspension |

---

## 8. Incident Response

| Severity | Response Time | Examples |
|----------|--------------|---------|
| Critical | < 2 hours | Data breach, authentication bypass, mass data exposure |
| High | < 8 hours | Account takeover, payment fraud, AI manipulation |
| Medium | < 48 hours | Spam campaign, single-user data leak |
| Low | < 7 days | UI misrepresentation, minor privacy issue |

Security disclosures: security@gracera.com (PGP key published on website).

---

## 9. Dispute Resolution Policy

See [Deal Workflow §7](08-deal-workflow.md#7-dispute-resolution) for the full dispute process, filing flow, and escalation path.

**Trust team scope:** The Gracera trust team reviews evidence submitted by both parties and issues a non-binding recommendation within 5 business days. The trust team can:
- Set a supplier's profile to "Under Review" (removes match visibility while investigation is active)
- Suspend accounts pending investigation
- Export a deal record package (messages, documents, milestone history) for use in external arbitration

**Account consequences:**

| Finding | Consequence |
|---------|-------------|
| Bad-faith dispute (fabricated evidence) | Account suspended; match visibility removed |
| Verified non-delivery by supplier | Profile flagged; visible to buyers receiving future matches |
| Repeated payment refusal by buyer | Buyer account escalated; match score penalized |
| Unresolved dispute after 60 days | "Active Dispute" badge visible to counterparties |

**Gracera's limits:** Gracera is a neutral facilitator, not an arbitrator. The platform does not guarantee deal outcomes, refunds, or specific remedies. Unresolved disputes are referred to appropriate international arbitration bodies (ICC, CIETAC, SIAC) based on the parties' countries. Users transact with full knowledge of this policy, disclosed in the Terms of Service at signup.

---

[Back to README](../README.md)
