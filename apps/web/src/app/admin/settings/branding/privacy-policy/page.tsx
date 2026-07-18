"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../../../warm.module.css";

export default function PrivacyPolicySettingsPage() {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch("/api/admin/platform-settings")
      .then((res) => res.json())
      .then((body) => setContent(body.privacyPolicyContent ?? ""))
      .catch(() => setError("Could not load the privacy policy."));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await authFetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyPolicyContent: content || null }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Could not save the privacy policy.");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (content === null) return <p className={styles.adminEmpty}>Loading…</p>;

  return (
    <div className={styles.adminCard}>
      <h2 className={styles.formSectionTitle}>Privacy Policy</h2>
      <p className={styles.adminSub}>
        Plain text (line breaks are preserved). Published live at <code>/privacy</code> as soon as
        you save. Leave empty to show the &ldquo;being drafted&rdquo; placeholder instead.
      </p>
      {error && <div className={styles.formError}>{error}</div>}
      {saved && <div className={styles.formSuccess}>Saved.</div>}
      <form onSubmit={save}>
        <div className={styles.formGroup}>
          <textarea
            className={styles.textarea}
            rows={16}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className={styles.submitRow}>
          <button type="submit" className={styles.btnSubmit} disabled={saving}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
