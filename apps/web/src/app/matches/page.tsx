"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../warm.module.css";

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

function MatchList({ profileType, profileId }: { profileType: MatchParty; profileId: string }) {
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState(REJECTION_REASONS[0].value);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    authFetch(`/api/matches?profile_type=${profileType}&profile_id=${profileId}`)
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((body) => setMatches(body.matches ?? []));
  }, [profileType, profileId]);

  useEffect(() => {
    load();
  }, [load]);

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
            <ul>
              {Object.entries(m.dimensions).map(([key, d]) => (
                <li key={key} className={styles.helpText}>
                  <strong>{key.replace(/_/g, " ")}:</strong> {d.score} — {d.rationale}
                </li>
              ))}
            </ul>
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
  const router = useRouter();
  const session = useSession();

  const [supplierProfile, setSupplierProfile] = useState<{ id: string } | null | undefined>(undefined);
  const [buyerProfile, setBuyerProfile] = useState<{ id: string } | null | undefined>(undefined);

  useEffect(() => {
    if (!session) {
      router.replace("/get-started");
      return;
    }
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
  }, [session, router]);

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
