"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type SupplierSummary = {
  id: string;
  companyName: string | null;
  tagline: string | null;
  completenessScore: number;
  profileStatus: string;
};

type BuyerSummary = {
  id: string;
  companyName: string | null;
  completenessScore: number;
  profileStatus: string;
};

type SourcingRequestSummary = {
  id: string;
  title: string | null;
  status: string;
  completenessScore: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const session = useSession();

  const [supplierProfile, setSupplierProfile] = useState<SupplierSummary | null | undefined>(undefined);
  const [buyerProfile, setBuyerProfile] = useState<BuyerSummary | null | undefined>(undefined);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequestSummary[]>([]);

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
        .then((profile) => {
          setBuyerProfile(profile);
          if (profile) {
            fetch(`/api/sourcing-requests?buyer_profile_id=${profile.id}`)
              .then((res) => res.json())
              .then((body) => setSourcingRequests(body.results ?? []));
          }
        });
    }
  }, [session, router]);

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
                  </div>
                ) : (
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Supplier</div>
                    <p style={{ marginBottom: "1rem" }}>
                      List your company and products to start receiving buyer
                      introductions.
                    </p>
                    <Link href="/onboarding/supplier" className={styles.btnTealWarm}>
                      Create supplier profile
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
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Buyer</div>
                    <p style={{ marginBottom: "1rem" }}>
                      Tell us about your company, then post what you&apos;re
                      sourcing.
                    </p>
                    <Link href="/onboarding/buyer" className={styles.btnOrangeWarm}>
                      Create buyer profile
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
