"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type Me = { email: string; adminRole: string | null; mfaEnabled: boolean };
type Enrollment = { base32Secret: string; otpauthUri: string };

export default function AdminSettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    authFetch("/api/admin/me")
      .then((res) => res.json())
      .then(setMe);
  }, []);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    try {
      const res = await authFetch("/api/admin/mfa/enroll", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? "Could not start enrollment.");
        return;
      }
      setEnrollment(body);
    } finally {
      setBusy(false);
    }
  }

  async function submitVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await authFetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? "That code didn't work.");
        return;
      }
      setMe((prev) => (prev ? { ...prev, mfaEnabled: true } : prev));
      setEnrollment(null);
    } finally {
      setBusy(false);
    }
  }

  if (!me) return null;

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Settings</h1>
      <p className={styles.adminSub}>{me.email}</p>

      <div className={styles.adminCard}>
        <h2 className={styles.formSectionTitle}>Two-factor authentication</h2>
        <p className={styles.adminSub}>
          docs/20 §1: TOTP MFA is mandatory for admin accounts, not opt-in. A super_admin cannot
          grant you an admin role until this is enabled.
        </p>

        {error && <div className={styles.formError}>{error}</div>}

        {me.mfaEnabled && !enrollment && <p>MFA is enabled on this account.</p>}

        {!me.mfaEnabled && !enrollment && (
          <button type="button" className={styles.btnSubmit} onClick={startEnroll} disabled={busy}>
            Enroll MFA
          </button>
        )}

        {enrollment && (
          <form onSubmit={submitVerify}>
            <p>Add this to your authenticator app (Google Authenticator, 1Password, etc.):</p>
            <div className={styles.formGroup}>
              <label className={styles.label}>otpauth URI</label>
              <input className={styles.input} readOnly value={enrollment.otpauthUri} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Or enter this secret manually</label>
              <input className={styles.input} readOnly value={enrollment.base32Secret} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="code">
                Enter the 6-digit code from your app
              </label>
              <input
                id="code"
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className={styles.submitRow}>
              <button type="submit" className={styles.btnSubmit} disabled={busy}>
                Verify and enable
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
