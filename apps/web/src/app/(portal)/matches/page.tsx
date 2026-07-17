"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type MatchParty = "supplier" | "buyer";

type CounterpartProfile = {
  companyName?: string | null;
  displayName?: string | null;
  tagline?: string | null;
};

type SourcingRequestSummary = {
  id: string;
  title: string | null;
  category: string | null;
  productName: string | null;
  quantityRequired: number | null;
  quantityUnit: string | null;
  status: string;
};

type MatchItem = {
  id: string;
  score: number;
  quality: string;
  summary: string;
  dimensions: Record<string, { score: number; rationale: string }>;
  counterpartProfile: CounterpartProfile | null;
  sourcingRequest: SourcingRequestSummary | null;
  supplierStatus: "pending" | "accepted" | "rejected";
  buyerStatus: "pending" | "accepted" | "rejected";
  dealId: string | null;
  createdAt: string;
};

const REJECTION_REASONS = [
  { value: "wrong_category", label: "Wrong category" },
  { value: "wrong_volume", label: "Wrong volume" },
  { value: "already_connected", label: "Already connected" },
  { value: "other", label: "Other" },
];

const WEAK_THRESHOLD = 70;

type CoachingItem = {
  dimension: string;
  actionType: "edit_profile" | "ask_counterpart" | "informational";
  suggestedText: string;
  targetField: string | null;
};

// Which wizard step a given field lives on, per profile type — used to
// build the "add this to your profile" deep link
// (/onboarding/{supplier|buyer}?step=<key>). Keep in sync with the STEPS
// arrays in onboarding/supplier/page.tsx and onboarding/buyer/page.tsx.
const SUPPLIER_FIELD_TO_STEP: Record<string, string> = {
  companyName: "basics",
  displayName: "basics",
  country: "basics",
  headquartersCity: "basics",
  description: "about",
  yearEstablished: "about",
  companySize: "about",
  businessRegNumber: "about",
  tagline: "about",
  supplierType: "category",
  categories: "category",
  productName: "product",
  productUnit: "product",
  productMoq: "product",
  productMoqUnit: "product",
  productLeadTimeDays: "product",
  productDescription: "product",
  targetGeographies: "market",
  languagesSpoken: "market",
  targetCustomerTypes: "market",
  preferredDealTypes: "market",
  idealCustomerDescription: "market",
  annualRevenueRange: "additional",
  productionCapacityMonthly: "additional",
  certifications: "additional",
  notableCustomers: "additional",
  qualityControlProcess: "additional",
  referencesAvailable: "additional",
  primaryContactName: "contact",
  primaryContactRole: "contact",
  primaryContactEmail: "contact",
  primaryContactPhone: "contact",
};

const BUYER_FIELD_TO_STEP: Record<string, string> = {
  companyName: "basics",
  displayName: "basics",
  country: "basics",
  headquartersCity: "basics",
  companySize: "about",
  industry: "about",
  businessRegNumber: "about",
  annualPurchasingVolume: "about",
  buyerType: "preferences",
  preferredSupplierCountries: "preferences",
  languagesSpoken: "preferences",
  primaryContactName: "contact",
  primaryContactRole: "contact",
  primaryContactEmail: "contact",
  primaryContactPhone: "contact",
};

function MatchList({ profileType, profileId }: { profileType: MatchParty; profileId: string }) {
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState(REJECTION_REASONS[0].value);
  const [error, setError] = useState<string | null>(null);
  const [coaching, setCoaching] = useState<Record<string, CoachingItem[] | "loading">>({});

  const load = useCallback(() => {
    authFetch(`/api/matches?profile_type=${profileType}&profile_id=${profileId}`)
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((body) => setMatches(body.matches ?? []));
  }, [profileType, profileId]);

  useEffect(() => {
    load();
  }, [load]);

  async function loadCoaching(matchId: string) {
    setCoaching((c) => ({ ...c, [matchId]: "loading" }));
    const res = await authFetch(`/api/matches/${matchId}/coach`, { method: "POST" });
    const body = res.ok ? await res.json() : { items: [] };
    setCoaching((c) => ({ ...c, [matchId]: body.items ?? [] }));
  }

  async function accept(id: string) {
    setError(null);
    const res = await authFetch(`/api/matches/${id}/accept`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not accept this match.");
      return;
    }
    load();
  }

  async function reject(id: string) {
    await authFetch(`/api/matches/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setRejectingId(null);
    load();
  }

  if (matches === null) return <p className={styles.helpText}>Loading matches...</p>;
  if (matches.length === 0) {
    return <p className={styles.helpText}>No matches yet — check back soon.</p>;
  }

  const myStatusKey: keyof MatchItem = profileType === "supplier" ? "supplierStatus" : "buyerStatus";

  return (
    <>
      {error && <div className={styles.formError}>{error}</div>}
      {matches.map((m) => (
        <div key={m.id} className={styles.formSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
            <strong>
              {m.counterpartProfile?.companyName || m.counterpartProfile?.displayName || "(profile pending)"}
            </strong>
            <span className={styles.pctW}>{m.quality}</span>
          </div>
          {m.counterpartProfile?.tagline && <p className={styles.helpText}>{m.counterpartProfile.tagline}</p>}
          {m.sourcingRequest && (
            <p className={styles.helpText}>
              Sourcing: {m.sourcingRequest.productName || m.sourcingRequest.title || m.sourcingRequest.category}
              {m.sourcingRequest.quantityRequired &&
                ` — ${m.sourcingRequest.quantityRequired} ${m.sourcingRequest.quantityUnit ?? ""}`}
              {m.sourcingRequest.status !== "open" && " (no longer open)"}
            </p>
          )}
          <p>{m.summary}</p>
          <button
            type="button"
            className={styles.helpText}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
          >
            {expandedId === m.id ? "Hide details" : "Why this match?"}
          </button>
          {expandedId === m.id && (
            <>
              <ul>
                {Object.entries(m.dimensions).map(([key, d]) => (
                  <li key={key} className={styles.helpText}>
                    <strong>{key.replace(/_/g, " ")}:</strong> {d.score} — {d.rationale}
                  </li>
                ))}
              </ul>
              {Object.values(m.dimensions).some((d) => d.score < WEAK_THRESHOLD) && (
                <div className={styles.formSection}>
                  {!coaching[m.id] ? (
                    <button
                      type="button"
                      className={styles.helpText}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => loadCoaching(m.id)}
                    >
                      How can I improve this match?
                    </button>
                  ) : coaching[m.id] === "loading" ? (
                    <p className={styles.helpText}>Thinking...</p>
                  ) : (
                    (coaching[m.id] as CoachingItem[]).map((item, i) => {
                      const fieldToStep = profileType === "supplier" ? SUPPLIER_FIELD_TO_STEP : BUYER_FIELD_TO_STEP;
                      const step = item.targetField ? fieldToStep[item.targetField] : undefined;
                      return (
                        <div key={i} className={styles.formGroup}>
                          <p className={styles.helpText}>{item.suggestedText}</p>
                          {item.actionType === "edit_profile" && step && (
                            <Link href={`/onboarding/${profileType}?step=${step}`} className={styles.btnTealWarm}>
                              Update profile
                            </Link>
                          )}
                          {item.actionType === "ask_counterpart" &&
                            (m.dealId ? (
                              <Link
                                href={`/deals/${m.dealId}?draftMessage=${encodeURIComponent(item.suggestedText)}`}
                                className={styles.btnTealWarm}
                              >
                                Draft this into a message
                              </Link>
                            ) : (
                              <p className={styles.helpText}>(Once you connect, you can ask about this.)</p>
                            ))}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
          {m[myStatusKey] === "pending" && rejectingId !== m.id && (
            <div className={styles.submitRow}>
              <button type="button" className={styles.btnTealWarm} onClick={() => accept(m.id)}>
                Accept
              </button>
              <button type="button" className={styles.btnOrangeWarm} onClick={() => setRejectingId(m.id)}>
                Reject
              </button>
            </div>
          )}
          {rejectingId === m.id && (
            <div className={styles.formGroup}>
              <select className={styles.select} value={reason} onChange={(e) => setReason(e.target.value)}>
                {REJECTION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className={styles.submitRow}>
                <button type="button" className={styles.btnSubmit} onClick={() => reject(m.id)}>
                  Confirm reject
                </button>
              </div>
            </div>
          )}
          {m[myStatusKey] !== "pending" && <p className={styles.helpText}>Status: {m[myStatusKey]}</p>}
          {m.dealId && (
            <div className={styles.submitRow}>
              <Link href={`/deals/${m.dealId}`} className={styles.btnTealWarm}>
                Go to deal
              </Link>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function MatchesPage() {
  const session = useSession();

  const [supplierProfile, setSupplierProfile] = useState<{ id: string } | null | undefined>(undefined);
  const [buyerProfile, setBuyerProfile] = useState<{ id: string } | null | undefined>(undefined);

  // No redirect here — the (portal) layout already guarantees an
  // authenticated session before this page renders. Redirecting on this
  // page's own (reactive, briefly-null-after-hydration) session read was
  // sending logged-in users back to /get-started on every refresh.
  useEffect(() => {
    if (!session) return;
    const showSupplier = session.role === "supplier" || session.role === "both";
    const showBuyer = session.role === "buyer" || session.role === "both";

    if (showSupplier) {
      authFetch("/api/supplier-profiles/me")
        .then((res) => (res.ok ? res.json() : null))
        .then(setSupplierProfile);
    }
    if (showBuyer) {
      authFetch("/api/buyer-profiles/me")
        .then((res) => (res.ok ? res.json() : null))
        .then(setBuyerProfile);
    }
  }, [session]);

  if (!session) return null;

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Your matches</h1>
              <p className={styles.heroSub}>Suppliers and buyers Gracera thinks you should meet.</p>
            </div>
            <div className={styles.formCard}>
              {supplierProfile && (
                <>
                  <div className={styles.formSectionTitle}>As a supplier</div>
                  <MatchList profileType="supplier" profileId={supplierProfile.id} />
                </>
              )}
              {buyerProfile && (
                <>
                  <div className={styles.formSectionTitle}>As a buyer</div>
                  <MatchList profileType="buyer" profileId={buyerProfile.id} />
                </>
              )}
              {!supplierProfile && !buyerProfile && (
                <p className={styles.helpText}>
                  Create and publish a profile first — matches show up here once Gracera finds a fit.
                </p>
              )}
              <div className={styles.submitRow}>
                <Link href="/onboarding" className={styles.helpText}>
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
