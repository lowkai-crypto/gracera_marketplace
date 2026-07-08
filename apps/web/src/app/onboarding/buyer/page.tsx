"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, getSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

const BUYER_TYPES = [
  "Retailer",
  "Distributor",
  "Wholesaler",
  "OEM",
  "Reseller",
  "E-commerce Seller",
  "Restaurant/Foodservice",
  "Government/Institutional",
  "End User / SME",
];
const COMPANY_SIZES = ["micro", "small", "medium", "large"];
const CONTACT_ROLES = [
  "owner_founder",
  "cpo",
  "procurement_manager",
  "category_manager",
  "supply_chain_director",
  "operations_manager",
  "other",
];

const INITIAL_FORM = {
  companyName: "",
  displayName: "",
  country: "",
  headquartersCity: "",
  companySize: "medium",
  businessRegNumber: "",
  industry: "",
  annualPurchasingVolume: "",
  preferredSupplierCountries: "",
  languagesSpoken: "",
  primaryContactName: "",
  primaryContactRole: "procurement_manager",
  primaryContactEmail: "",
  primaryContactPhone: "",
};

function toArray(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function BuyerOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [buyerType, setBuyerType] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; completenessScore: number } | null>(null);

  useEffect(() => {
    if (!getSession()) router.replace("/get-started");
  }, [router]);

  function field(name: keyof typeof form) {
    return {
      value: form[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await authFetch("/api/buyer-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          displayName: form.displayName,
          country: form.country.toUpperCase(),
          headquartersCity: form.headquartersCity,
          companySize: form.companySize,
          businessRegNumber: form.businessRegNumber,
          industry: form.industry,
          buyerType,
          annualPurchasingVolume: form.annualPurchasingVolume || undefined,
          preferredSupplierCountries: form.preferredSupplierCountries
            ? toArray(form.preferredSupplierCountries).map((c) => c.toUpperCase())
            : undefined,
          languagesSpoken: toArray(form.languagesSpoken),
          primaryContactName: form.primaryContactName,
          primaryContactRole: form.primaryContactRole,
          primaryContactEmail: form.primaryContactEmail,
          primaryContactPhone: form.primaryContactPhone || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setResult({ id: body.id, completenessScore: body.completenessScore });
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className={styles.page}>
        <section className={styles.formSec}>
          <div className={styles.container}>
            <div className={styles.formNarrow}>
              <div className={styles.formCard}>
                <div className={styles.formSuccess}>
                  Buyer profile created. Completeness score:{" "}
                  <strong>{result.completenessScore}%</strong>
                </div>
                <p style={{ marginBottom: "1rem" }}>
                  Now post what you&apos;re sourcing so Gracera can start
                  matching you with suppliers.
                </p>
                <a
                  href={`/onboarding/sourcing-request?buyerProfileId=${result.id}`}
                  className={styles.btnOrangeWarm}
                >
                  Post a sourcing request
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Create your buyer profile</h1>
              <p className={styles.heroSub}>Tell us about your company.</p>
            </div>
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Company Identity</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="companyName">Company name</label>
                    <input id="companyName" required className={styles.input} {...field("companyName")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="displayName">Display / trade name</label>
                    <input id="displayName" required className={styles.input} {...field("displayName")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="country">Country (ISO code, e.g. US)</label>
                    <input id="country" required maxLength={2} className={styles.input} {...field("country")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="headquartersCity">Headquarters city</label>
                    <input id="headquartersCity" required className={styles.input} {...field("headquartersCity")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="companySize">Company size</label>
                    <select id="companySize" className={styles.select} {...field("companySize")}>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="businessRegNumber">Business registration number</label>
                    <input id="businessRegNumber" required className={styles.input} {...field("businessRegNumber")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="industry">Industry</label>
                    <input id="industry" required className={styles.input} {...field("industry")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="annualPurchasingVolume">
                      Annual purchasing volume <span className={styles.labelHint}>(optional)</span>
                    </label>
                    <input id="annualPurchasingVolume" className={styles.input} {...field("annualPurchasingVolume")} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Buyer type</label>
                  <div className={styles.roleOptions} style={{ flexWrap: "wrap" }}>
                    {BUYER_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.roleOption} ${buyerType.includes(t) ? styles.roleOptionActive : ""}`}
                        onClick={() => setBuyerType((v) => toggle(v, t))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Purchasing Preferences</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="preferredSupplierCountries">
                      Preferred supplier countries <span className={styles.labelHint}>(optional, comma-separated)</span>
                    </label>
                    <input id="preferredSupplierCountries" className={styles.input} {...field("preferredSupplierCountries")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="languagesSpoken">
                      Languages spoken <span className={styles.labelHint}>(comma-separated)</span>
                    </label>
                    <input id="languagesSpoken" required className={styles.input} {...field("languagesSpoken")} />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Contact</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="primaryContactName">Contact name</label>
                    <input id="primaryContactName" required className={styles.input} {...field("primaryContactName")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="primaryContactRole">Contact role</label>
                    <select id="primaryContactRole" className={styles.select} {...field("primaryContactRole")}>
                      {CONTACT_ROLES.map((r) => (
                        <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="primaryContactEmail">Contact email</label>
                    <input
                      id="primaryContactEmail"
                      type="email"
                      required
                      className={styles.input}
                      {...field("primaryContactEmail")}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="primaryContactPhone">
                      Contact phone <span className={styles.labelHint}>(optional)</span>
                    </label>
                    <input id="primaryContactPhone" className={styles.input} {...field("primaryContactPhone")} />
                  </div>
                </div>
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                  {submitting ? "Creating profile..." : "Create profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
