"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type QueueRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  buyerCompanyName: string | null;
  createdAt: string;
};

export default function ModerationQueuePage() {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  function load() {
    authFetch("/api/admin/moderation/sourcing-requests")
      .then((res) => res.json())
      .then((body) => setRows(body.results));
  }

  useEffect(load, []);

  async function approve(id: string) {
    setError(null);
    setBusyId(id);
    try {
      const res = await authFetch(`/api/admin/moderation/sourcing-requests/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Could not approve this sourcing request.");
        return;
      }
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const reason = reasonById[id]?.trim();
    if (!reason) {
      setError("A reason is required to reject a sourcing request.");
      return;
    }
    setError(null);
    setBusyId(id);
    try {
      const res = await authFetch(`/api/admin/moderation/sourcing-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Could not reject this sourcing request.");
        return;
      }
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Content Moderation — Sourcing Requests</h1>
      <p className={styles.adminSub}>
        content_mod. Requests the prohibited-goods scan flagged at creation time (docs/20 §8.3).
      </p>

      {error && <div className={styles.formError}>{error}</div>}

      <div className={styles.adminCard}>
        {!rows && <p className={styles.adminEmpty}>Loading…</p>}
        {rows && rows.length === 0 && <p className={styles.adminEmpty}>Nothing pending moderation.</p>}
        {rows &&
          rows.map((r) => (
            <div key={r.id} className={styles.adminCard}>
              <p>
                <strong>{r.title ?? "(untitled)"}</strong> — {r.buyerCompanyName ?? "unknown buyer"}
              </p>
              <p className={styles.adminSub}>
                {r.category ?? "no category"} · {r.description ?? ""}
              </p>
              <div className={styles.formGroup}>
                <label className={styles.label}>Reason (required to reject)</label>
                <input
                  className={styles.input}
                  value={reasonById[r.id] ?? ""}
                  onChange={(e) => setReasonById((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
              </div>
              <div className={styles.adminActions}>
                <button type="button" className={styles.adminBtn} onClick={() => approve(r.id)} disabled={busyId === r.id}>
                  Approve
                </button>
                <button
                  type="button"
                  className={`${styles.adminBtn} ${styles.adminBtnDanger}`}
                  onClick={() => reject(r.id)}
                  disabled={busyId === r.id}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
