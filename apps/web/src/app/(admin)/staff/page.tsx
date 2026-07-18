"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../warm.module.css";

const ADMIN_ROLES = [
  "super_admin",
  "trust_team",
  "customer_success",
  "finance_ops",
  "content_mod",
  "data_analyst",
] as const;

type StaffRow = {
  id: string;
  email: string;
  adminRole: (typeof ADMIN_ROLES)[number] | null;
  mfaEnabled: boolean;
  status: string;
  createdAt: string;
};

export default function StaffAccountsPage() {
  const [staff, setStaff] = useState<StaffRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Record<string, string>>({});

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    authFetch("/api/admin/staff")
      .then((res) => res.json())
      .then((body) => setStaff(body.results));
  }

  useEffect(load, []);

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await authFetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", email: newEmail, password: newPassword }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? "Could not create staff account.");
        return;
      }
      setNewEmail("");
      setNewPassword("");
      load();
    } finally {
      setCreating(false);
    }
  }

  async function assignRole(userId: string) {
    const adminRole = pendingRole[userId];
    if (!adminRole) return;
    setError(null);
    const res = await authFetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", userId, adminRole }),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error?.message ?? "Could not assign role.");
      return;
    }
    load();
  }

  async function revokeRole(userId: string) {
    setError(null);
    const res = await authFetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", userId }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.message ?? "Could not revoke role.");
      return;
    }
    load();
  }

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Staff Accounts</h1>
      <p className={styles.adminSub}>
        super_admin only. Roles can only be assigned to accounts that have already enrolled MFA.
      </p>

      {error && <div className={styles.formError}>{error}</div>}

      <div className={styles.adminCard}>
        <h2 className={styles.formSectionTitle}>Create a staff account</h2>
        <form onSubmit={createStaff}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="new-email">
              Email
            </label>
            <input
              id="new-email"
              type="email"
              className={styles.input}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="new-password">
              Temporary password (12+ characters, hand off out-of-band)
            </label>
            <input
              id="new-password"
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={12}
              required
            />
          </div>
          <div className={styles.submitRow}>
            <button type="submit" className={styles.btnSubmit} disabled={creating}>
              Create account
            </button>
          </div>
        </form>
      </div>

      <div className={styles.adminCard}>
        <h2 className={styles.formSectionTitle}>All staff</h2>
        {!staff && <p className={styles.adminEmpty}>Loading…</p>}
        {staff && staff.length === 0 && <p className={styles.adminEmpty}>No staff accounts yet.</p>}
        {staff && staff.length > 0 && (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>MFA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td>{s.adminRole ?? <span className={styles.adminBadge}>none</span>}</td>
                  <td>{s.mfaEnabled ? "Enrolled" : "Not enrolled"}</td>
                  <td>
                    <div className={styles.adminActions}>
                      <select
                        className={styles.select}
                        value={pendingRole[s.id] ?? s.adminRole ?? ""}
                        onChange={(e) => setPendingRole((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      >
                        <option value="" disabled>
                          Choose role
                        </option>
                        {ADMIN_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button type="button" className={styles.adminBtn} onClick={() => assignRole(s.id)}>
                        Assign
                      </button>
                      {s.adminRole && (
                        <button
                          type="button"
                          className={`${styles.adminBtn} ${styles.adminBtnDanger}`}
                          onClick={() => revokeRole(s.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
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
