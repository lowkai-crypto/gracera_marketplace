// docs/25-legal-compliance.md §7.2 prohibited goods list, scanned at
// sourcing-request publish time per docs/20-admin-ops-spec.md §8.3. This is
// a naive keyword scan, not an NLP classifier — false positives are expected
// and are exactly why a match holds the request for human review instead of
// auto-rejecting it.
const PROHIBITED_KEYWORDS: string[] = [
  // Military weapons, firearms, ammunition
  "firearm",
  "firearms",
  "handgun",
  "assault rifle",
  "ammunition",
  "grenade",
  "military weapon",
  // Controlled substances, narcotics, precursor chemicals
  "narcotics",
  "cocaine",
  "heroin",
  "methamphetamine",
  "fentanyl",
  "controlled substance",
  // Counterfeit or trademark-infringing goods
  "counterfeit",
  "knockoff",
  "replica watch",
  "replica handbag",
  // CITES-listed endangered species products
  "ivory",
  "rhino horn",
  "shark fin",
  "tiger bone",
  "endangered species",
  // Export control lists (EAR, ITAR, EU Dual-Use Regulation)
  "itar",
  "dual-use",
  "export controlled",
];

/**
 * Scans free-text sourcing-request fields against the prohibited goods
 * list. Returns the matched keywords, or an empty array if none matched.
 */
export function scanProhibitedGoods(...fields: (string | null | undefined)[]): string[] {
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return PROHIBITED_KEYWORDS.filter((keyword) => haystack.includes(keyword));
}
