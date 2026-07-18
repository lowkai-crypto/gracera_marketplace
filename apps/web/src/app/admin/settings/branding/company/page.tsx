"use client";

import { useEffect, useState } from "react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../../../warm.module.css";

type CompanyForm = {
  companyLegalName: string;
  supportEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

const EMPTY: CompanyForm = {
  companyLegalName: "",
  supportEmail: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
};

export default function CompanySettingsPage() {
  const [form, setForm] = useState<CompanyForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch("/api/admin/platform-settings")
      .then((res) => res.json())
      .then((body) =>
        setForm({
          companyLegalName: body.companyLegalName ?? "",
          supportEmail: body.supportEmail ?? "",
          addressLine1: body.addressLine1 ?? "",
          addressLine2: body.addressLine2 ?? "",
          city: body.city ?? "",
          region: body.region ?? "",
          postalCode: body.postalCode ?? "",
          country: body.country ?? "",
        }),
      )
      .catch(() => setError("Could not load company info."));
  }, []);

  function field(key: keyof CompanyForm, value: string) {
    setForm((prev) => ({ ...(prev ?? EMPTY), [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value === "" ? null : value]),
      );
      const res = await authFetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Could not save company info.");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className={styles.adminEmpty}>Loading…</p>;

  return (
    <div className={styles.adminCard}>
      <h2 className={styles.formSectionTitle}>Company Info</h2>
      {error && <div className={styles.formError}>{error}</div>}
      {saved && <div className={styles.formSuccess}>Saved.</div>}
      <form onSubmit={save}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="companyLegalName">
            Legal company name
          </label>
          <input
            id="companyLegalName"
            className={styles.input}
            value={form.companyLegalName}
            onChange={(e) => field("companyLegalName", e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="supportEmail">
            Support email
          </label>
          <input
            id="supportEmail"
            type="email"
            className={styles.input}
            value={form.supportEmail}
            onChange={(e) => field("supportEmail", e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="addressLine1">
            Address line 1
          </label>
          <input
            id="addressLine1"
            className={styles.input}
            value={form.addressLine1}
            onChange={(e) => field("addressLine1", e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="addressLine2">
            Address line 2
          </label>
          <input
            id="addressLine2"
            className={styles.input}
            value={form.addressLine2}
            onChange={(e) => field("addressLine2", e.target.value)}
          />
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="city">
              City
            </label>
            <input id="city" className={styles.input} value={form.city} onChange={(e) => field("city", e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="region">
              State / Region
            </label>
            <input
              id="region"
              className={styles.input}
              value={form.region}
              onChange={(e) => field("region", e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="postalCode">
              Postal code
            </label>
            <input
              id="postalCode"
              className={styles.input}
              value={form.postalCode}
              onChange={(e) => field("postalCode", e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="country">
              Country (2-letter code)
            </label>
            <input
              id="country"
              className={styles.input}
              value={form.country}
              maxLength={2}
              onChange={(e) => field("country", e.target.value.toUpperCase())}
            />
          </div>
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
