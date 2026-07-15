"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { authFetch, getSession } from "@/lib/auth-client";
import styles from "../../../warm.module.css";

const ORDER_FREQUENCIES = ["one_time", "monthly", "quarterly", "annual", "ongoing"];

const INITIAL_FORM = {
  title: "",
  category: "",
  expiresAt: "",
  description: "",
  productName: "",
  quantityRequired: "",
  quantityUnit: "",
  orderFrequency: "monthly",
  sampleRequired: true,
  idealSupplierDescription: "",
  requiredCertifications: "",
  maxLeadTimeDays: "",
  maxMoq: "",
  budgetRange: "",
};

function toArray(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function SourcingRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramBuyerProfileId = searchParams.get("buyerProfileId");
  const [buyerProfileId, setBuyerProfileId] = useState<string | null>(paramBuyerProfileId);
  const [checkingProfile, setCheckingProfile] = useState(!paramBuyerProfileId);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; completenessScore: number; status: string } | null>(null);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/get-started");
      return;
    }
    // Every buyer account already has a profile (created at registration —
    // see apps/web/src/app/api/auth/register/route.ts), so arriving here
    // straight from the sidebar (no ?buyerProfileId in the URL, unlike the
    // link the profile wizard's success screen gives) shouldn't be a dead
    // end. Only fall back to looking it up when the URL didn't already
    // supply it.
    if (paramBuyerProfileId) return;
    authFetch("/api/buyer-profiles/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => setBuyerProfileId(profile?.id ?? null))
      .finally(() => setCheckingProfile(false));
  }, [router, paramBuyerProfileId]);

  function field(name: keyof typeof form) {
    return {
      value: form[name] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [name]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!buyerProfileId) {
      setError("Missing buyer profile. Create a buyer profile first.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await authFetch("/api/sourcing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerProfileId,
          title: form.title,
          category: form.category,
          expiresAt: form.expiresAt,
          description: form.description,
          productName: form.productName,
          quantityRequired: Number(form.quantityRequired),
          quantityUnit: form.quantityUnit,
          orderFrequency: form.orderFrequency,
          sampleRequired: form.sampleRequired,
          idealSupplierDescription: form.idealSupplierDescription,
          requiredCertifications: form.requiredCertifications ? toArray(form.requiredCertifications) : undefined,
          maxLeadTimeDays: form.maxLeadTimeDays ? Number(form.maxLeadTimeDays) : undefined,
          maxMoq: form.maxMoq ? Number(form.maxMoq) : undefined,
          budgetRange: form.budgetRange || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setResult({ id: body.id, completenessScore: body.completenessScore, status: body.status });
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className={styles.formCard}>
        <div className={styles.formSuccess}>
          Sourcing request posted. Completeness score:{" "}
          <strong>{result.completenessScore}%</strong>
        </div>
        {result.status === "pending_moderation" ? (
          <p>
            This request has been held for a quick review by our trust team
            before it goes live — this is a standard check, not a decision
            about your account. You&apos;ll be notified once it publishes.
          </p>
        ) : (
          <p>Gracera will start surfacing matching suppliers for this request.</p>
        )}
      </div>
    );
  }

  if (checkingProfile) return null;

  return (
    <form className={styles.formCard} onSubmit={handleSubmit}>
      {error && <div className={styles.formError}>{error}</div>}
      {!buyerProfileId && (
        <div className={styles.formError}>
          Could not find your buyer profile — please refresh the page, or
          visit Business Profile first.
        </div>
      )}

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>What are you sourcing?</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="title">Request title</label>
            <input id="title" required className={styles.input} {...field("title")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="category">Category</label>
            <input id="category" required className={styles.input} {...field("category")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="productName">Product name</label>
            <input id="productName" required className={styles.input} {...field("productName")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="expiresAt">Request expires on</label>
            <input id="expiresAt" type="date" required className={styles.input} {...field("expiresAt")} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">Description</label>
          <textarea id="description" required className={styles.textarea} {...field("description")} />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Quantity &amp; Terms</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="quantityRequired">Quantity required</label>
            <input
              id="quantityRequired"
              type="number"
              required
              className={styles.input}
              {...field("quantityRequired")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="quantityUnit">Quantity unit</label>
            <input id="quantityUnit" required className={styles.input} {...field("quantityUnit")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="orderFrequency">Order frequency</label>
            <select id="orderFrequency" className={styles.select} {...field("orderFrequency")}>
              {ORDER_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.sampleRequired}
                onChange={(e) => setForm((f) => ({ ...f, sampleRequired: e.target.checked }))}
              />
              Sample required
            </label>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="maxLeadTimeDays">
              Max lead time (days) <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="maxLeadTimeDays" type="number" className={styles.input} {...field("maxLeadTimeDays")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="maxMoq">
              Max MOQ you&apos;ll accept <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="maxMoq" type="number" className={styles.input} {...field("maxMoq")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="requiredCertifications">
              Required certifications <span className={styles.labelHint}>(optional, comma-separated)</span>
            </label>
            <input id="requiredCertifications" className={styles.input} {...field("requiredCertifications")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="budgetRange">
              Budget range <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="budgetRange" className={styles.input} {...field("budgetRange")} />
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Ideal Supplier</div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="idealSupplierDescription">
            Describe the perfect supplier for this need
          </label>
          <textarea
            id="idealSupplierDescription"
            required
            className={styles.textarea}
            {...field("idealSupplierDescription")}
          />
        </div>
      </div>

      <div className={styles.submitRow}>
        <button type="submit" className={styles.btnSubmit} disabled={submitting}>
          {submitting ? "Posting request..." : "Post sourcing request"}
        </button>
      </div>
    </form>
  );
}

export default function SourcingRequestPage() {
  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.formH1}>Post a sourcing request</h1>
              <p className={styles.formHeroSub}>
                The more detail here, the better your AI-matched suppliers.
              </p>
            </div>
            <Suspense fallback={null}>
              <SourcingRequestForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
