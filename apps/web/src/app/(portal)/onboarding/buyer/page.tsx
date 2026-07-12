"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, getSession } from "@/lib/auth-client";
import Tooltip from "@/components/Tooltip";
import styles from "../../../warm.module.css";

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

// Wizard steps, keyed (not indexed) so JSX can reference a step without
// depending on its position — matches the supplier onboarding page's
// pattern. `required` only drives the "done" indicator on the progress
// bar; navigation itself is unrestricted and every field is optional at
// the API layer.
const STEPS: { key: string; title: string; required: (keyof typeof INITIAL_FORM)[] }[] = [
  {
    key: "basics",
    title: "Basics",
    required: ["companyName", "displayName", "country", "headquartersCity"],
  },
  {
    key: "about",
    title: "About Your Company",
    required: ["industry"],
  },
  {
    key: "preferences",
    title: "Buyer Type & Preferences",
    required: ["languagesSpoken"],
  },
  {
    key: "contact",
    title: "Contact",
    required: ["primaryContactName", "primaryContactEmail"],
  },
];

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

  // A profile row always exists from the moment the account registered
  // (apps/web/src/app/api/auth/register/route.ts) — this page always edits
  // it, there is no separate "create" state. `null` only appears briefly
  // while loading, or as a defensive fallback for an account that predates
  // that change; see the .catch below.
  const [profileId, setProfileId] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Every step is freely navigable — nothing here requires filling a step
  // to move on, so gating navigation would only get in the way, not
  // prevent invalid data (the update API is the actual validation
  // boundary).
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/get-started");
      return;
    }
    authFetch("/api/buyer-profiles/me")
      .then(async (res) => {
        if (res.ok) return res.json();
        // Defensive fallback only — every account should already have a
        // profile row from registration. Covers accounts that predate that
        // change and haven't been backfilled yet.
        const created = await authFetch("/api/buyer-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        return created.ok ? created.json() : null;
      })
      .then((profile) => {
        if (!profile) return;
        setProfileId(profile.id);
        setForm((f) => ({
          ...f,
          companyName: profile.companyName ?? "",
          displayName: profile.displayName ?? "",
          country: profile.country ?? "",
          headquartersCity: profile.headquartersCity ?? "",
          companySize: profile.companySize ?? f.companySize,
          businessRegNumber: profile.businessRegNumber ?? "",
          industry: profile.industry ?? "",
          annualPurchasingVolume: profile.annualPurchasingVolume ?? "",
          preferredSupplierCountries: (profile.preferredSupplierCountries ?? []).join(", "),
          languagesSpoken: (profile.languagesSpoken ?? []).join(", "),
          primaryContactName: profile.primaryContactName ?? "",
          primaryContactRole: profile.primaryContactRole ?? f.primaryContactRole,
          primaryContactEmail: profile.primaryContactEmail ?? "",
          primaryContactPhone: profile.primaryContactPhone ?? "",
        }));
        setBuyerType(profile.buyerType ?? []);
      })
      .finally(() => setCheckingExisting(false));
  }, [router]);

  function field(name: keyof typeof form) {
    return {
      value: form[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  function stepIsComplete(index: number): boolean {
    return STEPS[index].required.every((key) => {
      const value = form[key];
      return typeof value === "string" && value.trim().length > 0;
    });
  }

  function goToStep(index: number) {
    setCurrentStep(index);
  }

  // Saves happen per-step now, potentially well before every field is
  // filled in — so unlike a one-shot final submit, this can't just send
  // the whole form verbatim. Fields with a min-length/format constraint
  // (companyName, country, primaryContactEmail, etc.) are only included
  // once they actually satisfy it; skipped ones are simply left out of this
  // save (the update schema is fully optional) rather than sent as invalid
  // empty values, and picked up automatically on a later save once filled.
  function buildUpdatePayload() {
    const languagesSpoken = toArray(form.languagesSpoken);

    return {
      ...(form.companyName.trim() && { companyName: form.companyName }),
      ...(form.displayName.trim() && { displayName: form.displayName }),
      ...(form.country.trim().length === 2 && { country: form.country.toUpperCase() }),
      ...(form.headquartersCity.trim() && { headquartersCity: form.headquartersCity }),
      companySize: form.companySize,
      ...(form.businessRegNumber.trim() && { businessRegNumber: form.businessRegNumber }),
      ...(form.industry.trim() && { industry: form.industry }),
      ...(buyerType.length > 0 && { buyerType }),
      annualPurchasingVolume: form.annualPurchasingVolume || undefined,
      preferredSupplierCountries: form.preferredSupplierCountries
        ? toArray(form.preferredSupplierCountries).map((c) => c.toUpperCase())
        : undefined,
      ...(languagesSpoken.length > 0 && { languagesSpoken }),
      ...(form.primaryContactName.trim() && { primaryContactName: form.primaryContactName }),
      primaryContactRole: form.primaryContactRole,
      ...(form.primaryContactEmail.trim() && { primaryContactEmail: form.primaryContactEmail }),
      primaryContactPhone: form.primaryContactPhone || undefined,
    };
  }

  async function handleSave() {
    if (!profileId) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await authFetch(`/api/buyer-profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUpdatePayload()),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      if (currentStep === STEPS.length - 1) {
        setResult({ id: body.id, completenessScore: body.completenessScore });
      } else {
        setCurrentStep((s) => s + 1);
      }
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
                  Profile saved. Completeness score: <strong>{result.completenessScore}%</strong>
                </div>
                <p style={{ marginBottom: "1rem" }}>
                  Now post what you&apos;re sourcing so Gracera can start
                  matching you with suppliers.
                </p>
                <div className={styles.submitRow}>
                  <a
                    href={`/onboarding/sourcing-request?buyerProfileId=${result.id}`}
                    className={styles.btnOrangeWarm}
                  >
                    Post a sourcing request
                  </a>
                  <Link href="/onboarding" className={styles.helpText}>
                    Back to onboarding
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (checkingExisting) return null;

  return (
    <div className={styles.page}>
      <section className={styles.wizardSec}>
        <div className={styles.container}>
          <div className={styles.wizardWide}>
            <div className={styles.formIntro}>
              <h1 className={styles.formH1}>My Buyer Profile</h1>
              <p className={styles.formHeroSub}>Tell us about your company.</p>
            </div>

            <div className={styles.wizardProgress}>
              {STEPS.map((step, i) => {
                const done = i !== currentStep && stepIsComplete(i);
                return (
                  <button
                    key={step.title}
                    type="button"
                    className={styles.wizardStep}
                    onClick={() => goToStep(i)}
                  >
                    <span
                      className={`${styles.wizardStepDot} ${
                        i === currentStep ? styles.wizardStepDotActive : done ? styles.wizardStepDotDone : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`${styles.wizardStepLabel} ${i === currentStep ? styles.wizardStepLabelActive : ""}`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <form
              className={styles.formCard}
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {error && <div className={styles.formError}>{error}</div>}

              {STEPS[currentStep]?.key === "basics" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Basics</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="companyName">Company name</label>
                      <input id="companyName" className={styles.input} {...field("companyName")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="displayName">Display / trade name</label>
                      <input id="displayName" className={styles.input} {...field("displayName")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="country">Country (ISO code, e.g. US)</label>
                      <input id="country" maxLength={2} className={styles.input} {...field("country")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="headquartersCity">Headquarters city</label>
                      <input id="headquartersCity" className={styles.input} {...field("headquartersCity")} />
                    </div>
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "about" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>About Your Company</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="companySize">Company size</label>
                      <select id="companySize" className={styles.select} {...field("companySize")}>
                        {COMPANY_SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="industry">Industry</label>
                      <input id="industry" className={styles.input} {...field("industry")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="businessRegNumber">
                        Business registration number <span className={styles.labelHint}>(optional)</span>
                        <Tooltip text="Helps us verify your company — not required to save now." />
                      </label>
                      <input id="businessRegNumber" className={styles.input} {...field("businessRegNumber")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="annualPurchasingVolume">
                        Annual purchasing volume <span className={styles.labelHint}>(optional)</span>
                      </label>
                      <input id="annualPurchasingVolume" className={styles.input} {...field("annualPurchasingVolume")} />
                    </div>
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "preferences" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Buyer Type &amp; Preferences</div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Buyer type</label>
                    <div className={styles.roleOptions}>
                      {BUYER_TYPES.map((t) => (
                        <label key={t} className={styles.roleOption}>
                          <input
                            type="checkbox"
                            checked={buyerType.includes(t)}
                            onChange={() => setBuyerType((v) => toggle(v, t))}
                            className={styles.roleOptionInput}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="preferredSupplierCountries">
                        Preferred supplier countries <span className={styles.labelHint}>(optional)</span>
                        <Tooltip text="Comma-separated ISO country codes, e.g. US, CA, MX." />
                      </label>
                      <input id="preferredSupplierCountries" className={styles.input} {...field("preferredSupplierCountries")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="languagesSpoken">
                        Languages spoken
                        <Tooltip text="Comma-separated, e.g. en, ko." />
                      </label>
                      <input id="languagesSpoken" className={styles.input} {...field("languagesSpoken")} />
                    </div>
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "contact" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Contact</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="primaryContactName">Contact name</label>
                      <input id="primaryContactName" className={styles.input} {...field("primaryContactName")} />
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
              )}

              <div className={styles.wizardNav}>
                <span />
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : currentStep === STEPS.length - 1 ? "Save" : "Save & Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
