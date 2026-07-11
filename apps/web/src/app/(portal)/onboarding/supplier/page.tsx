"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, getSession } from "@/lib/auth-client";
import Tooltip from "@/components/Tooltip";
import styles from "../../../warm.module.css";

const SUPPLIER_TYPES = ["Manufacturer", "Distributor", "Trading Company", "Service Provider", "Agent/Rep"];
const CUSTOMER_TYPES = [
  "Retailer",
  "Distributor",
  "Wholesaler",
  "OEM",
  "Government",
  "E-commerce Seller",
  "Restaurant/Foodservice",
  "Direct Consumer Brand",
  "Other",
];
const DEAL_TYPES = ["Annual contract", "Spot purchase", "Trial order", "Distributor agreement"];
const COMPANY_SIZES = ["micro", "small", "medium", "large"];
const CONTACT_ROLES = [
  "owner_ceo",
  "export_sales_director",
  "sales_manager",
  "quality_compliance",
  "operations_manager",
  "other",
];

const EXTRACTABLE_FIELD_LABELS: Record<string, string> = {
  companyName: "Company name",
  displayName: "Display name",
  tagline: "Tagline",
  description: "Description",
  country: "Country",
  categories: "Categories",
  targetGeographies: "Target countries",
  languagesSpoken: "Languages spoken",
  certifications: "Certifications",
  primaryContactEmail: "Contact email",
  primaryContactPhone: "Contact phone",
};

const INITIAL_FORM = {
  companyName: "",
  displayName: "",
  country: "",
  headquartersCity: "",
  yearEstablished: "",
  companySize: "medium",
  businessRegNumber: "",
  tagline: "",
  description: "",
  categories: "",
  targetGeographies: "",
  idealCustomerDescription: "",
  languagesSpoken: "",
  annualRevenueRange: "",
  productionCapacityMonthly: "",
  qualityControlProcess: "",
  certifications: "",
  notableCustomers: "",
  referencesAvailable: false,
  primaryContactName: "",
  primaryContactRole: "export_sales_director",
  primaryContactEmail: "",
  primaryContactPhone: "",
  productName: "",
  productDescription: "",
  productUnit: "",
  productMoq: "",
  productMoqUnit: "",
  productLeadTimeDays: "",
  productSampleAvailable: false,
};

// Wizard steps, keyed (not just indexed) so a step can be conditionally
// excluded — see ALL_STEPS/CREATE_STEPS below — without renumbering the
// rest. `required` only drives the "done" indicator on the progress bar —
// navigation itself is unrestricted, and the API's create schema only ever
// requires companyName/country. The publish gate (canPublishSupplierProfile)
// is the real completeness check, so nothing here needs to be stricter than
// what's actually needed to make a useful profile. businessRegNumber/tagline
// are collected on step 1 but no longer block it — the publish gate still
// requires them (and already surfaces that by name) before a profile can go
// live, so nothing is lost, it's
// just no longer forced during first-time creation.
const ALL_STEPS: { key: string; title: string; required: (keyof typeof INITIAL_FORM)[] }[] = [
  {
    key: "basics",
    title: "Basics",
    required: ["companyName", "displayName", "country", "headquartersCity"],
  },
  {
    key: "about",
    title: "About Your Company",
    required: ["description"],
  },
  {
    key: "category",
    title: "Category & Type",
    required: ["categories"],
  },
  {
    key: "product",
    title: "Your First Product",
    required: ["productName", "productUnit", "productMoq", "productMoqUnit", "productLeadTimeDays", "productDescription"],
  },
  {
    key: "market",
    title: "Target Market",
    required: ["targetGeographies", "languagesSpoken", "idealCustomerDescription"],
  },
  {
    key: "additional",
    title: "Additional Details",
    required: [],
  },
  {
    key: "contact",
    title: "Contact",
    required: ["primaryContactName", "primaryContactEmail"],
  },
];

// First-time creation skips "Additional Details" entirely — none of its
// fields are required, so it was pure optional padding in the middle of
// onboarding. It's still fully editable afterward, since editing an
// existing profile uses ALL_STEPS.
const CREATE_STEPS = ALL_STEPS.filter((s) => s.key !== "additional");

function toArray(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [supplierType, setSupplierType] = useState<string[]>([]);
  const [targetCustomerTypes, setTargetCustomerTypes] = useState<string[]>([]);
  const [preferredDealTypes, setPreferredDealTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; completenessScore: number } | null>(null);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published" | "rejected">("idle");
  const [publishReasons, setPublishReasons] = useState<string | null>(null);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);
  const [extractInfo, setExtractInfo] = useState<{
    sourceUrl: string;
    filledFields: string[];
    needsReview: string[];
  } | null>(null);

  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Every step is freely navigable in both create and edit mode — nothing
  // here requires filling a step to move on, so gating navigation would
  // only get in the way, not prevent invalid data (the create/update APIs
  // are the actual validation boundary).
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/get-started");
      return;
    }
    authFetch("/api/supplier-profiles/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (!profile) return;
        setExistingProfileId(profile.id);
        setForm((f) => ({
          ...f,
          companyName: profile.companyName ?? "",
          displayName: profile.displayName ?? "",
          country: profile.country ?? "",
          headquartersCity: profile.headquartersCity ?? "",
          yearEstablished: profile.yearEstablished != null ? String(profile.yearEstablished) : "",
          companySize: profile.companySize ?? f.companySize,
          businessRegNumber: profile.businessRegNumber ?? "",
          tagline: profile.tagline ?? "",
          description: profile.description ?? "",
          categories: (profile.categories ?? []).join(", "),
          targetGeographies: (profile.targetGeographies ?? []).join(", "),
          idealCustomerDescription: profile.idealCustomerDescription ?? "",
          languagesSpoken: (profile.languagesSpoken ?? []).join(", "),
          annualRevenueRange: profile.annualRevenueRange ?? "",
          productionCapacityMonthly: profile.productionCapacityMonthly ?? "",
          qualityControlProcess: profile.qualityControlProcess ?? "",
          certifications: (profile.certifications ?? []).join(", "),
          notableCustomers: (profile.notableCustomers ?? []).join(", "),
          referencesAvailable: !!profile.referencesAvailable,
          primaryContactName: profile.primaryContactName ?? "",
          primaryContactRole: profile.primaryContactRole ?? f.primaryContactRole,
          primaryContactEmail: profile.primaryContactEmail ?? "",
          primaryContactPhone: profile.primaryContactPhone ?? "",
          productName: profile.productLines?.[0]?.name ?? "",
          productDescription: profile.productLines?.[0]?.description ?? "",
          productUnit: profile.productLines?.[0]?.unit ?? "",
          productMoq: profile.productLines?.[0]?.moq != null ? String(profile.productLines[0].moq) : "",
          productMoqUnit: profile.productLines?.[0]?.moqUnit ?? "",
          productLeadTimeDays:
            profile.productLines?.[0]?.leadTimeDays != null ? String(profile.productLines[0].leadTimeDays) : "",
          productSampleAvailable: !!profile.productLines?.[0]?.sampleAvailable,
        }));
        setSupplierType(profile.supplierType ?? []);
        setTargetCustomerTypes(profile.targetCustomerTypes ?? []);
        setPreferredDealTypes(profile.preferredDealTypes ?? []);
      })
      .finally(() => setCheckingExisting(false));
  }, [router]);

  async function handleExtract() {
    if (!websiteUrl) return;
    setExtracting(true);
    setExtractError(null);
    setExtractWarnings([]);
    setExtractInfo(null);
    try {
      const response = await authFetch("/api/onboarding/extract-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const body = await response.json();
      if (!response.ok) {
        setExtractError(body.error?.message ?? "Could not extract from that URL.");
        return;
      }

      const filledFields: string[] = [];
      const needsReview: string[] = [];
      setForm((f) => {
        const next = { ...f };
        const mutable = next as unknown as Record<string, string | boolean>;
        for (const [name, extracted] of Object.entries(body.fields ?? {}) as [
          string,
          { value: string | string[]; confidence: string },
        ][]) {
          if (!(name in next)) continue;
          const value = Array.isArray(extracted.value) ? extracted.value.join(", ") : extracted.value;
          mutable[name] = value;
          filledFields.push(EXTRACTABLE_FIELD_LABELS[name] ?? name);
          if (extracted.confidence !== "high") {
            needsReview.push(EXTRACTABLE_FIELD_LABELS[name] ?? name);
          }
        }
        return next;
      });
      setExtractInfo({ sourceUrl: body.sourceUrl, filledFields, needsReview });
      setExtractWarnings(body.warnings ?? []);
    } catch {
      setExtractError("Could not reach the server. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  function field(name: keyof typeof form) {
    return {
      value: form[name] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  // Edit mode shows all 5 steps (Additional Details included, since real
  // data may already be there); first-time creation skips straight past it.
  const STEPS = existingProfileId ? ALL_STEPS : CREATE_STEPS;

  function stepIsComplete(index: number): boolean {
    return STEPS[index].required.every((key) => {
      const value = form[key];
      return typeof value === "string" && value.trim().length > 0;
    });
  }

  function goToStep(index: number) {
    setCurrentStep(index);
  }

  function handleNext() {
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await authFetch(
        existingProfileId ? `/api/supplier-profiles/${existingProfileId}` : "/api/supplier-profiles",
        {
        method: existingProfileId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          displayName: form.displayName,
          country: form.country.toUpperCase(),
          headquartersCity: form.headquartersCity,
          yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : undefined,
          companySize: form.companySize,
          businessRegNumber: form.businessRegNumber,
          tagline: form.tagline,
          description: form.description,
          supplierType,
          categories: toArray(form.categories),
          targetGeographies: toArray(form.targetGeographies).map((c) => c.toUpperCase()),
          targetCustomerTypes,
          idealCustomerDescription: form.idealCustomerDescription,
          preferredDealTypes,
          languagesSpoken: toArray(form.languagesSpoken),
          annualRevenueRange: form.annualRevenueRange || undefined,
          productionCapacityMonthly: form.productionCapacityMonthly || undefined,
          qualityControlProcess: form.qualityControlProcess || undefined,
          certifications: form.certifications ? toArray(form.certifications) : undefined,
          notableCustomers: form.notableCustomers ? toArray(form.notableCustomers) : undefined,
          referencesAvailable: form.referencesAvailable,
          primaryContactName: form.primaryContactName,
          primaryContactRole: form.primaryContactRole,
          primaryContactEmail: form.primaryContactEmail,
          primaryContactPhone: form.primaryContactPhone || undefined,
          productLines: form.productName
            ? [
                {
                  name: form.productName,
                  description: form.productDescription,
                  unit: form.productUnit,
                  moq: Number(form.productMoq),
                  moqUnit: form.productMoqUnit,
                  leadTimeDays: Number(form.productLeadTimeDays),
                  sampleAvailable: form.productSampleAvailable,
                },
              ]
            : undefined,
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

  async function handlePublish() {
    if (!result) return;
    setPublishState("publishing");
    setPublishReasons(null);
    const response = await authFetch(`/api/supplier-profiles/${result.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileStatus: "active" }),
    });
    const body = await response.json();
    if (!response.ok) {
      setPublishState("rejected");
      setPublishReasons(body.error?.message ?? "Could not publish.");
      return;
    }
    setPublishState("published");
  }

  if (result) {
    return (
      <div className={styles.page}>
        <section className={styles.formSec}>
          <div className={styles.container}>
            <div className={styles.formNarrow}>
              <div className={styles.formCard}>
                <div className={styles.formSuccess}>
                  Supplier profile {existingProfileId ? "updated" : "created"}. Completeness score:{" "}
                  <strong>{result.completenessScore}%</strong>
                </div>
                {publishState === "published" ? (
                  <p>Your profile is live. Buyers can now be matched with you.</p>
                ) : (
                  <>
                    <p style={{ marginBottom: "1rem" }}>
                      Publish your profile to start receiving buyer introductions.
                      {result.completenessScore < 60 &&
                        " Profiles need at least 60% completeness to publish."}
                    </p>
                    {publishReasons && <div className={styles.formError}>{publishReasons}</div>}
                    <button
                      type="button"
                      className={styles.btnSubmit}
                      onClick={handlePublish}
                      disabled={publishState === "publishing"}
                    >
                      {publishState === "publishing" ? "Publishing..." : "Publish profile"}
                    </button>
                  </>
                )}
                <div className={styles.submitRow}>
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
              <h1 className={styles.formH1}>
                {existingProfileId ? "Edit your supplier profile" : "Create your supplier profile"}
              </h1>
              <p className={styles.formHeroSub}>
                The more complete your profile, the better your matches.
              </p>
            </div>

            <div className={styles.wizardProgress}>
              {STEPS.map((step, i) => {
                // Any non-current step whose own required fields are already
                // filled reads as "done" — true for steps already passed in
                // create mode, and for every pre-filled step in edit mode.
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

            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error && <div className={styles.formError}>{error}</div>}

              {STEPS[currentStep]?.key === "basics" && (
                <>
                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>
                      Start faster (optional)
                      <Tooltip text="Websites rarely list MOQ, lead time, or pricing, so you'll still want to fill in Products & Services yourself." />
                    </div>
                    <p className={styles.helpText} style={{ marginBottom: "0.75rem" }}>
                      Paste your company website and we&apos;ll pre-fill what we can find.
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <input
                        type="url"
                        placeholder="https://yourcompany.com"
                        className={styles.input}
                        style={{ flex: "1 1 auto", minWidth: 0 }}
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.btnSubmit}
                        style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                        onClick={handleExtract}
                        disabled={extracting || !websiteUrl}
                      >
                        {extracting ? "Reading..." : "Pre-fill from website"}
                      </button>
                    </div>
                    {extractError && (
                      <div className={styles.formError} style={{ marginTop: "0.75rem" }}>
                        {extractError}
                      </div>
                    )}
                    {extractWarnings.length > 0 && (
                      <div className={styles.formError} style={{ marginTop: "0.75rem" }}>
                        {extractWarnings.join(" ")}
                      </div>
                    )}
                    {extractInfo && (
                      <div className={styles.formSuccess} style={{ marginTop: "0.75rem" }}>
                        {extractInfo.filledFields.length > 0 ? (
                          <>
                            Pre-filled from {extractInfo.sourceUrl}: {extractInfo.filledFields.join(", ")}.
                            {" "}(Some of these may be on a later step.)
                            {extractInfo.needsReview.length > 0 && (
                              <> Please double-check: {extractInfo.needsReview.join(", ")}.</>
                            )}
                          </>
                        ) : (
                          <>
                            Checked {extractInfo.sourceUrl}, but couldn&apos;t confidently identify any profile
                            fields there — you&apos;ll need to fill in the form manually.
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.formSection}>
                    <div className={styles.formSectionTitle}>Basics</div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="companyName">Company name</label>
                        <input id="companyName" required className={styles.input} {...field("companyName")} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="displayName">Display / brand name</label>
                        <input id="displayName" required className={styles.input} {...field("displayName")} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="country">Country (ISO code, e.g. KR)</label>
                        <input id="country" required maxLength={2} className={styles.input} {...field("country")} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="headquartersCity">Headquarters city</label>
                        <input id="headquartersCity" required className={styles.input} {...field("headquartersCity")} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {STEPS[currentStep]?.key === "about" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>About Your Company</div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="description">Company description</label>
                    <textarea id="description" required className={styles.textarea} {...field("description")} />
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="yearEstablished">
                        Year established <span className={styles.labelHint}>(optional)</span>
                      </label>
                      <input id="yearEstablished" type="number" className={styles.input} {...field("yearEstablished")} />
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
                      <label className={styles.label} htmlFor="businessRegNumber">
                        Business registration number <span className={styles.labelHint}>(optional)</span>
                        <Tooltip text="Needed before you can publish your profile — not required to save now." />
                      </label>
                      <input id="businessRegNumber" className={styles.input} {...field("businessRegNumber")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="tagline">
                        Tagline <span className={styles.labelHint}>(optional)</span>
                        <Tooltip text="Needed before you can publish your profile — not required to save now." />
                      </label>
                      <input id="tagline" maxLength={120} className={styles.input} {...field("tagline")} />
                    </div>
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "category" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Category &amp; Type</div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Supplier type</label>
                    <div className={styles.roleOptions}>
                      {SUPPLIER_TYPES.map((t) => (
                        <label key={t} className={styles.roleOption}>
                          <input
                            type="checkbox"
                            checked={supplierType.includes(t)}
                            onChange={() => setSupplierType((v) => toggle(v, t))}
                            className={styles.roleOptionInput}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="categories">
                      Categories
                      <Tooltip text="Comma-separated, up to 5 categories." />
                    </label>
                    <input id="categories" required className={styles.input} {...field("categories")} />
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "product" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Your First Product</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="productName">Product name</label>
                      <input id="productName" required className={styles.input} {...field("productName")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="productUnit">Unit (e.g. case, kg)</label>
                      <input id="productUnit" required className={styles.input} {...field("productUnit")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="productMoq">MOQ</label>
                      <input id="productMoq" type="number" required className={styles.input} {...field("productMoq")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="productMoqUnit">MOQ unit</label>
                      <input id="productMoqUnit" required className={styles.input} {...field("productMoqUnit")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="productLeadTimeDays">Lead time (days)</label>
                      <input
                        id="productLeadTimeDays"
                        type="number"
                        required
                        className={styles.input}
                        {...field("productLeadTimeDays")}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={form.productSampleAvailable}
                          onChange={(e) => setForm((f) => ({ ...f, productSampleAvailable: e.target.checked }))}
                        />
                        Samples available
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="productDescription">Product description</label>
                    <textarea
                      id="productDescription"
                      required
                      className={styles.textarea}
                      {...field("productDescription")}
                    />
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "market" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Target Market &amp; Ideal Customer</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="targetGeographies">
                        Target countries
                        <Tooltip text="Comma-separated ISO country codes, e.g. US, CA, MX." />
                      </label>
                      <input id="targetGeographies" required className={styles.input} {...field("targetGeographies")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="languagesSpoken">
                        Languages spoken
                        <Tooltip text="Comma-separated, e.g. en, ko." />
                      </label>
                      <input id="languagesSpoken" required className={styles.input} {...field("languagesSpoken")} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Target customer types</label>
                    <div className={styles.roleOptions}>
                      {CUSTOMER_TYPES.map((t) => (
                        <label key={t} className={styles.roleOption}>
                          <input
                            type="checkbox"
                            checked={targetCustomerTypes.includes(t)}
                            onChange={() => setTargetCustomerTypes((v) => toggle(v, t))}
                            className={styles.roleOptionInput}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Preferred deal types</label>
                    <div className={styles.roleOptions}>
                      {DEAL_TYPES.map((t) => (
                        <label key={t} className={styles.roleOption}>
                          <input
                            type="checkbox"
                            checked={preferredDealTypes.includes(t)}
                            onChange={() => setPreferredDealTypes((v) => toggle(v, t))}
                            className={styles.roleOptionInput}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="idealCustomerDescription">
                      Describe your ideal customer
                    </label>
                    <textarea
                      id="idealCustomerDescription"
                      required
                      className={styles.textarea}
                      {...field("idealCustomerDescription")}
                    />
                  </div>
                </div>
              )}

              {STEPS[currentStep]?.key === "additional" && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    Additional details <span className={styles.labelHint}>(optional)</span>
                    <Tooltip text="None of this is required, but filling it in improves match quality." />
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="annualRevenueRange">Annual revenue range</label>
                      <input id="annualRevenueRange" className={styles.input} {...field("annualRevenueRange")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="productionCapacityMonthly">Monthly production capacity</label>
                      <input id="productionCapacityMonthly" className={styles.input} {...field("productionCapacityMonthly")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="certifications">
                        Certifications
                        <Tooltip text="Comma-separated." />
                      </label>
                      <input id="certifications" className={styles.input} {...field("certifications")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="notableCustomers">
                        Notable customers
                        <Tooltip text="Comma-separated." />
                      </label>
                      <input id="notableCustomers" className={styles.input} {...field("notableCustomers")} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="qualityControlProcess">Quality control process</label>
                    <textarea id="qualityControlProcess" className={styles.textarea} {...field("qualityControlProcess")} />
                  </div>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={form.referencesAvailable}
                      onChange={(e) => setForm((f) => ({ ...f, referencesAvailable: e.target.checked }))}
                    />
                    References available on request
                  </label>
                </div>
              )}

              {STEPS[currentStep]?.key === "contact" && (
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
              )}

              <div className={styles.wizardNav}>
                {currentStep > 0 ? (
                  <button type="button" className={styles.wizardBtnBack} onClick={handleBack}>
                    Back
                  </button>
                ) : (
                  <span />
                )}
                {currentStep < STEPS.length - 1 ? (
                  <button type="button" className={styles.btnSubmit} onClick={handleNext}>
                    Next
                  </button>
                ) : (
                  <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                    {submitting
                      ? existingProfileId
                        ? "Updating profile..."
                        : "Creating profile..."
                      : existingProfileId
                        ? "Update profile"
                        : "Create profile"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
