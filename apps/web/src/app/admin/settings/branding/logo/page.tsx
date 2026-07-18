"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import { LOGO_CANDIDATES } from "@/lib/logo-candidates";
import styles from "../../../../warm.module.css";

const DEFAULT_MARK = (
  <>
    <circle cx="5" cy="5" r="2.5" fill="white" opacity=".9" />
    <circle cx="11" cy="5" r="2.5" fill="white" opacity=".55" />
    <circle cx="5" cy="11" r="2.5" fill="white" opacity=".25" />
    <circle cx="11" cy="11" r="2.5" fill="white" opacity=".25" />
  </>
);

export default function LogoSettingsPage() {
  const [logoKey, setLogoKey] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/api/admin/platform-settings")
      .then((res) => res.json())
      .then((body) => setLogoKey(body.logoKey ?? null))
      .catch(() => setError("Could not load current logo."));
  }, []);

  async function select(key: string | null) {
    setError(null);
    setSaving(key ?? "default");
    try {
      const res = await authFetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoKey: key }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Could not save this logo.");
        return;
      }
      setLogoKey(key);
    } finally {
      setSaving(null);
    }
  }

  if (logoKey === undefined) return <p className={styles.adminEmpty}>Loading…</p>;

  return (
    <div className={styles.adminCard}>
      <h2 className={styles.formSectionTitle}>Choose the gracera.ai logo</h2>
      <p className={styles.adminSub}>
        20 placeholder marks -- pick one to use everywhere the logo appears (homepage,
        supplier/buyer portal, admin) until a real brand identity is designed.
      </p>
      {error && <div className={styles.formError}>{error}</div>}
      <div className={styles.logoGrid}>
        <button
          type="button"
          className={`${styles.logoOption} ${logoKey === null ? styles.logoOptionActive : ""}`}
          onClick={() => select(null)}
          disabled={saving !== null}
        >
          <span className={styles.logoOptionMark} style={{ background: "#22c55e" }}>
            <svg viewBox="0 0 16 16" fill="none" width={22} height={22}>
              {DEFAULT_MARK}
            </svg>
          </span>
          <span className={styles.logoOptionLabel}>Current default</span>
        </button>
        {LOGO_CANDIDATES.map((candidate) => (
          <button
            key={candidate.key}
            type="button"
            className={`${styles.logoOption} ${logoKey === candidate.key ? styles.logoOptionActive : ""}`}
            onClick={() => select(candidate.key)}
            disabled={saving !== null}
          >
            <span className={styles.logoOptionMark} style={{ background: candidate.background }}>
              <svg viewBox="0 0 16 16" fill="none" width={22} height={22}>
                {candidate.glyph()}
              </svg>
            </span>
            <span className={styles.logoOptionLabel}>{candidate.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
