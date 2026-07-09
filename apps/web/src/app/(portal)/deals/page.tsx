"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type DealItem = {
  id: string;
  stage: string;
  counterpartProfile: { companyName?: string | null; displayName?: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export default function DealsPage() {
  const router = useRouter();
  const session = useSession();
  const [deals, setDeals] = useState<DealItem[] | null>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/get-started");
      return;
    }
    authFetch("/api/deals")
      .then((res) => (res.ok ? res.json() : { deals: [] }))
      .then((body) => setDeals(body.deals ?? []));
  }, [session, router]);

  if (!session) return null;

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Your deals</h1>
              <p className={styles.heroSub}>Everyone you have mutually matched with.</p>
            </div>
            <div className={styles.formCard}>
              {deals === null ? (
                <p className={styles.helpText}>Loading deals...</p>
              ) : deals.length === 0 ? (
                <p className={styles.helpText}>
                  No deals yet — accept a match from both sides to start one.
                </p>
              ) : (
                deals.map((d) => (
                  <div key={d.id} className={styles.formSection}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>
                        {d.counterpartProfile?.companyName || d.counterpartProfile?.displayName || "(profile pending)"}
                      </strong>
                      <span className={styles.pctW}>{d.stage}</span>
                    </div>
                    <div className={styles.submitRow}>
                      <Link href={`/deals/${d.id}`} className={styles.btnTealWarm}>
                        Open
                      </Link>
                    </div>
                  </div>
                ))
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
