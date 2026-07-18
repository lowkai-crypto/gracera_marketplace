"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type QueueRow = {
  id: string;
  profileType: string;
  profileId: string;
  companyName: string | null;
  displayName: string | null;
  triageSummary: string;
  createdAt: string;
};

export default function VerificationQueuePage() {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    authFetch("/api/admin/verification-queue")
      .then((res) => res.json())
      .then((body) => setRows(body.results));
  }

  useEffect(load, []);

  async function markVerified(id: string) {
    setError(null);
    setBusyId(id);
    try {
      const res = await authFetch(`/api/admin/verification-queue/${id}/verify`, { method: "PATCH" });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Could not mark this profile verified.");
        return;
      }
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Verification Queue</h1>
      <p className={styles.adminSub}>
        trust_team. AI triage results for profiles still at verification level &quot;basic&quot;
        (docs/20 §3).
      </p>

      {error && <div className={styles.formError}>{error}</div>}

      <div className={styles.adminCard}>
        {!rows && <p className={styles.adminEmpty}>Loading…</p>}
        {rows && rows.length === 0 && <p className={styles.adminEmpty}>Nothing waiting on review.</p>}
        {rows && rows.length > 0 && (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Type</th>
                <th>AI triage summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.companyName ?? r.displayName ?? r.profileId}</td>
                  <td>{r.profileType}</td>
                  <td>{r.triageSummary}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.adminBtn}
                      onClick={() => markVerified(r.id)}
                      disabled={busyId === r.id}
                    >
                      Mark verified
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
