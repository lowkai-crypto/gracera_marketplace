"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearSession, useSession } from "@/lib/auth-client";
import styles from "../warm.module.css";

export default function OnboardingPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session) router.replace("/get-started");
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
              {showSupplier && (
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
              )}
              {showBuyer && (
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
              )}
              <div className={styles.submitRow}>
                <button
                  type="button"
                  className={styles.helpText}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={() => {
                    clearSession();
                    router.push("/");
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
