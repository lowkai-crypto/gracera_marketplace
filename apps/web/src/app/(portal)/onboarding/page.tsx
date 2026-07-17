"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type SupplierSummary = {
  id: string;
  companyName: string | null;
  tagline: string | null;
  completenessScore: number;
  profileStatus: string;
  verificationLevel: string;
};

type BuyerSummary = {
  id: string;
  companyName: string | null;
  completenessScore: number;
  profileStatus: string;
  verificationLevel: string;
};

type VerificationResult = {
  flags: { field: string; concern: string; severity: "low" | "medium" | "high" }[];
  overallAssessment: string;
};

type SourcingRequestSummary = {
  id: string;
  title: string | null;
  status: string;
  completenessScore: number;
};

export default function OnboardingPage() {
  const session = useSession();

  const [supplierProfile, setSupplierProfile] = useState<SupplierSummary | null | undefined>(undefined);
  const [buyerProfile, setBuyerProfile] = useState<BuyerSummary | null | undefined>(undefined);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequestSummary[]>([]);
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult | "loading">>({});

  async function requestVerification(profileType: "supplier" | "buyer", profileId: string) {
    setVerificationResults((r) => ({ ...r, [profileId]: "loading" }));
    const res = await authFetch("/api/verification-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileType, profileId }),
    });
    const body = await res.json().catch(() => null);
    setVerificationResults((r) => ({
      ...r,
      [profileId]:
        res.ok && body
          ? { flags: body.flags ?? [], overallAssessment: body.overallAssessment ?? "" }
          : { flags: [], overallAssessment: "Could not run the verification pre-screen. Please try again." },
    }));
  }

  function renderVerification(profileType: "supplier" | "buyer", profileId: string, verificationLevel: string) {
    const result = verificationResults[profileId];
    return (
      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--warm-100)" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span className={styles.helpText}>Verification: {verificationLevel}</span>
          {result !== "loading" && (
            <button
              type="button"
              className={styles.helpText}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              onClick={() => requestVerification(profileType, profileId)}
            >
              Request verification pre-screen
            </button>
          )}
        </div>
        {result === "loading" && <p className={styles.helpText}>Running pre-screen...</p>}
        {result && result !== "loading" && (
          <div className={styles.formSuccess} style={{ marginTop: "0.5rem" }}>
            <p>{result.overallAssessment}</p>
            {result.flags.length > 0 && (
              <ul>
                {result.flags.map((f, i) => (
                  <li key={i}>
                    <strong>{f.field}</strong> ({f.severity}): {f.concern}
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.helpText} style={{ marginTop: "0.5rem" }}>
              Automated pre-screen only — a full trust-team review queue
              isn&apos;t built yet, so this is informational for now.
            </p>
          </div>
        )}
      </div>
    );
  }

  // No redirect here — the (portal) layout already guarantees an
  // authenticated session before this page renders.
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
        .then((profile) => {
          setBuyerProfile(profile);
          if (profile) {
            fetch(`/api/sourcing-requests?buyer_profile_id=${profile.id}`)
              .then((res) => res.json())
              .then((body) => setSourcingRequests(body.results ?? []));
          }
        });
    }
  }, [session]);

  if (!session) return null;

  const showSupplier = session.role === "supplier" || session.role === "both";
  const showBuyer = session.role === "buyer" || session.role === "both";

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Welcome, {session.email}</h1>
              <p className={styles.heroSub}>
                Let&apos;s build your profile so Gracera can start matching you.
              </p>
            </div>
            <div className={styles.formCard}>
              {showSupplier &&
                (supplierProfile === undefined ? (
                  <div className={styles.formSection}>
                    <p className={styles.helpText}>Loading your supplier profile...</p>
                  </div>
                ) : supplierProfile ? (
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Supplier</div>
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                      {supplierProfile.companyName || "(unnamed)"}
                    </p>
                    {supplierProfile.tagline && (
                      <p className={styles.helpText} style={{ marginBottom: "0.75rem" }}>
                        {supplierProfile.tagline}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                      <span className={styles.pctW}>{supplierProfile.completenessScore}% complete</span>
                      <span className={styles.helpText}>Status: {supplierProfile.profileStatus}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <Link href="/onboarding/supplier" className={styles.btnTealWarm}>
                        Edit profile
                      </Link>
                    </div>
                    {renderVerification("supplier", supplierProfile.id, supplierProfile.verificationLevel)}
                  </div>
                ) : (
                  // Defensive fallback only — every account gets a (empty)
                  // supplier profile row at registration, so this should be
                  // unreachable in practice; kept in case an older account
                  // hasn't been backfilled yet.
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Supplier</div>
                    <p style={{ marginBottom: "1rem" }}>
                      Your profile is empty — add your company details to
                      start matching.
                    </p>
                    <Link href="/onboarding/supplier" className={styles.btnTealWarm}>
                      Business Profile
                    </Link>
                  </div>
                ))}

              {showBuyer &&
                (buyerProfile === undefined ? (
                  <div className={styles.formSection}>
                    <p className={styles.helpText}>Loading your buyer profile...</p>
                  </div>
                ) : buyerProfile ? (
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Buyer</div>
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                      {buyerProfile.companyName || "(unnamed)"}
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                      <span className={styles.pctW}>{buyerProfile.completenessScore}% complete</span>
                      <span className={styles.helpText}>Status: {buyerProfile.profileStatus}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                      <Link href="/onboarding/buyer" className={styles.btnOrangeWarm}>
                        Edit profile
                      </Link>
                      <Link
                        href={`/onboarding/sourcing-request?buyerProfileId=${buyerProfile.id}`}
                        className={styles.btnTealWarm}
                      >
                        Post another sourcing request
                      </Link>
                    </div>
                    {renderVerification("buyer", buyerProfile.id, buyerProfile.verificationLevel)}
                    {sourcingRequests.length > 0 && (
                      <>
                        <div className={styles.formSectionTitle}>Your sourcing requests</div>
                        {sourcingRequests.map((sr) => (
                          <div
                            key={sr.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0.5rem 0",
                              borderBottom: "1px solid var(--warm-100)",
                            }}
                          >
                            <span>{sr.title || "(untitled)"}</span>
                            <span className={styles.helpText}>
                              {sr.status} · {sr.completenessScore}%
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  // Defensive fallback only — every account gets a (empty)
                  // buyer profile row at registration, so this should be
                  // unreachable in practice; kept in case an older account
                  // hasn't been backfilled yet.
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Buyer</div>
                    <p style={{ marginBottom: "1rem" }}>
                      Your profile is empty — add your company details, then
                      post what you&apos;re sourcing.
                    </p>
                    <Link href="/onboarding/buyer" className={styles.btnOrangeWarm}>
                      Business Profile
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
