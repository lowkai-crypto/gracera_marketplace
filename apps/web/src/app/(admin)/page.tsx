"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../warm.module.css";

type Health = {
  activeUsers24h: number;
  totalMatches: number;
  aiServiceLatency: null;
  errorRate: null;
  note: string;
};

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/api/admin/dashboard/health")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.error?.message ?? "Could not load platform health.");
          return;
        }
        setHealth(await res.json());
      })
      .catch(() => setError("Could not reach the server."));
  }, []);

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Platform Health</h1>
      <p className={styles.adminSub}>super_admin only. docs/20-admin-ops-spec.md §2.</p>

      {error && <div className={styles.formError}>{error}</div>}

      {health && (
        <>
          <div className={styles.adminStatRow}>
            <div className={styles.adminStat}>
              <div className={styles.adminStatValue}>{health.activeUsers24h}</div>
              <div className={styles.adminStatLabel}>Active users (24h)</div>
            </div>
            <div className={styles.adminStat}>
              <div className={styles.adminStatValue}>{health.totalMatches}</div>
              <div className={styles.adminStatLabel}>Total matches</div>
            </div>
          </div>
          <p className={styles.adminSub}>{health.note}</p>
        </>
      )}
    </div>
  );
}
