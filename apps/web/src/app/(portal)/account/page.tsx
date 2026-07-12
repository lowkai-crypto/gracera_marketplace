"use client";

import { useSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

const ROLE_LABELS: Record<string, string> = {
  supplier: "Supplier",
  buyer: "Buyer",
  both: "Supplier & Buyer",
};

export default function AccountPage() {
  const session = useSession();

  // No redirect here — the (portal) layout already guarantees an
  // authenticated session before this page renders.
  if (!session) return null;

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>User Profile</h1>
              <p className={styles.heroSub}>Your account details.</p>
            </div>
            <div className={styles.formCard}>
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <p>{session.email}</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Account type</label>
                  <p>{ROLE_LABELS[session.role] ?? session.role}</p>
                </div>
              </div>
              <p className={styles.helpText}>
                More account settings — display name, password, notification
                preferences — are coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
