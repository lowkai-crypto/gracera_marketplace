"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, getSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

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

  useEffect(() => {
    if (!getSession()) router.replace("/get-started");
  }, [router]);

  function field(name: keyof typeof form) {
    return {
      value: form[name] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await authFetch("/api/supplier-profiles", {
        method: "POST",
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
                  Supplier profile created. Completeness score:{" "}
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

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Create your supplier profile</h1>
              <p className={styles.heroSub}>
                The more complete your profile, the better your matches.
              </p>
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
                    <label className={styles.label} htmlFor="businessRegNumber">Business registration number</label>
                    <input id="businessRegNumber" required className={styles.input} {...field("businessRegNumber")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="tagline">Tagline</label>
                    <input id="tagline" required maxLength={120} className={styles.input} {...field("tagline")} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="description">Company description</label>
                  <textarea id="description" required className={styles.textarea} {...field("description")} />
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Products &amp; Services</div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Supplier type</label>
                  <div className={styles.roleOptions} style={{ flexWrap: "wrap" }}>
                    {SUPPLIER_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.roleOption} ${supplierType.includes(t) ? styles.roleOptionActive : ""}`}
                        onClick={() => setSupplierType((v) => toggle(v, t))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="categories">
                    Categories <span className={styles.labelHint}>(comma-separated, up to 5)</span>
                  </label>
                  <input id="categories" required className={styles.input} {...field("categories")} />
                </div>

                <div className={styles.formSectionTitle} style={{ marginTop: "1.5rem" }}>
                  One product to get started
                </div>
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

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Target Market &amp; Ideal Customer</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="targetGeographies">
                      Target countries <span className={styles.labelHint}>(comma-separated ISO codes)</span>
                    </label>
                    <input id="targetGeographies" required className={styles.input} {...field("targetGeographies")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="languagesSpoken">
                      Languages spoken <span className={styles.labelHint}>(comma-separated)</span>
                    </label>
                    <input id="languagesSpoken" required className={styles.input} {...field("languagesSpoken")} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Target customer types</label>
                  <div className={styles.roleOptions} style={{ flexWrap: "wrap" }}>
                    {CUSTOMER_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.roleOption} ${targetCustomerTypes.includes(t) ? styles.roleOptionActive : ""}`}
                        onClick={() => setTargetCustomerTypes((v) => toggle(v, t))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred deal types</label>
                  <div className={styles.roleOptions} style={{ flexWrap: "wrap" }}>
                    {DEAL_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.roleOption} ${preferredDealTypes.includes(t) ? styles.roleOptionActive : ""}`}
                        onClick={() => setPreferredDealTypes((v) => toggle(v, t))}
                      >
                        {t}
                      </button>
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

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>
                  Additional details <span className={styles.labelHint}>(optional, improves match quality)</span>
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
                      Certifications <span className={styles.labelHint}>(comma-separated)</span>
                    </label>
                    <input id="certifications" className={styles.input} {...field("certifications")} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="notableCustomers">
                      Notable customers <span className={styles.labelHint}>(comma-separated)</span>
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
