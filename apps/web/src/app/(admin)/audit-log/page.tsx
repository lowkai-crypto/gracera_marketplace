"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type AuditLogRow = {
  id: string;
  actorType: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  reason: string | null;
  createdAt: string;
};

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditLogRow[] | null>(null);

  useEffect(() => {
    authFetch("/api/admin/audit-log")
      .then((res) => res.json())
      .then((body) => setRows(body.results));
  }, []);

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Audit Log</h1>
      <p className={styles.adminSub}>
        super_admin only. Append-only record of every admin action (docs/20 §12).
      </p>

      <div className={styles.adminCard}>
        {!rows && <p className={styles.adminEmpty}>Loading…</p>}
        {rows && rows.length === 0 && <p className={styles.adminEmpty}>No admin actions logged yet.</p>}
        {rows && rows.length > 0 && (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    {r.actorType}:{r.actorId}
                  </td>
                  <td>{r.action}</td>
                  <td>
                    {r.entityType}:{r.entityId}
                  </td>
                  <td>{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
