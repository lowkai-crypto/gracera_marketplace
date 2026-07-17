"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { authFetch, getSession } from "@/lib/auth-client";
import styles from "../../../warm.module.css";

const ORDER_FREQUENCIES = ["one_time", "monthly", "quarterly", "annual", "ongoing"];

const EXTRACTABLE_FIELD_LABELS: Record<string, string> = {
  title: "Request title",
  category: "Category",
  productName: "Product name",
  quantityRequired: "Quantity required",
  quantityUnit: "Quantity unit",
  orderFrequency: "Order frequency",
  budgetRange: "Budget range",
  maxLeadTimeDays: "Max lead time",
  requiredCertifications: "Required certifications",
  idealSupplierDescription: "Ideal supplier description",
  description: "Description",
};

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

  const [describeText, setDescribeText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);
  const [extractInfo, setExtractInfo] = useState<{ filledFields: string[]; needsReview: string[] } | null>(null);

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

  async function handleExtractText() {
    if (!describeText.trim() || !buyerProfileId) return;
    setExtracting(true);
    setExtractError(null);
    setExtractWarnings([]);
    setExtractInfo(null);
    try {
      const response = await authFetch("/api/onboarding/extract-sourcing-request-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: describeText, buyerProfileId }),
      });
      const body = await response.json();
      if (!response.ok) {
        setExtractError(body.error?.message ?? "Could not extract from that description.");
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
      setExtractInfo({ filledFields, needsReview });
      setExtractWarnings(body.warnings ?? []);
    } catch {
      setExtractError("Could not reach the server. Please try again.");
    } finally {
      setExtracting(false);
    }
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
      // Blank fields are left out entirely rather than sent as "" / 0 / an
      // invalid date -- those would trip the schema's own type validation
      // (a confusing raw "Invalid date" or "must be positive" on whichever
      // field happens to come first) instead of the clean, complete
      // "Missing required fields: ..." message the server's real
      // completeness check (canPublishSourcingRequest) already produces.
      const response = await authFetch("/api/sourcing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerProfileId,
          ...(form.title.trim() && { title: form.title }),
          ...(form.category.trim() && { category: form.category }),
          ...(form.expiresAt && { expiresAt: form.expiresAt }),
          ...(form.description.trim() && { description: form.description }),
          ...(form.productName.trim() && { productName: form.productName }),
          ...(form.quantityRequired && { quantityRequired: Number(form.quantityRequired) }),
          ...(form.quantityUnit.trim() && { quantityUnit: form.quantityUnit }),
          orderFrequency: form.orderFrequency,
          sampleRequired: form.sampleRequired,
          ...(form.idealSupplierDescription.trim() && {
            idealSupplierDescription: form.idealSupplierDescription,
          }),
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
        <div className={styles.formSectionTitle}>Describe what you&apos;re sourcing (optional)</div>
        <p className={styles.helpText} style={{ marginBottom: "0.75rem" }}>
          Type a sentence or two and we&apos;ll fill in the fields below.
          Won&apos;t invent quantities or budgets you didn&apos;t mention.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <textarea
            className={styles.textarea}
            style={{ flex: "1 1 auto" }}
            rows={2}
            placeholder="e.g. Need 5000 units of eco-friendly hotel amenities, budget around $2/unit, within 6 weeks"
            value={describeText}
            onChange={(e) => setDescribeText(e.target.value)}
          />
          <button
            type="button"
            className={styles.btnSubmit}
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            onClick={handleExtractText}
            disabled={extracting || !describeText.trim()}
          >
            {extracting ? "Reading..." : "Fill in from description"}
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
                Filled in: {extractInfo.filledFields.join(", ")}.
                {extractInfo.needsReview.length > 0 && (
                  <> Please double-check: {extractInfo.needsReview.join(", ")}.</>
                )}
              </>
            ) : (
              <>Couldn&apos;t confidently identify any fields from that description.</>
            )}
          </div>
        )}
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>What are you sourcing?</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="title">
              Request title <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="title" className={styles.input} {...field("title")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="category">
              Category <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="category" className={styles.input} {...field("category")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="productName">
              Product name <span className={styles.labelHint}>(required)</span>
            </label>
            <input id="productName" className={styles.input} {...field("productName")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="expiresAt">
              Request expires on <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="expiresAt" type="date" className={styles.input} {...field("expiresAt")} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">
            Description <span className={styles.labelHint}>(optional)</span>
          </label>
          <textarea id="description" className={styles.textarea} {...field("description")} />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Quantity &amp; Terms</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="quantityRequired">
              Quantity required <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="quantityRequired" type="number" className={styles.input} {...field("quantityRequired")} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="quantityUnit">
              Quantity unit <span className={styles.labelHint}>(optional)</span>
            </label>
            <input id="quantityUnit" className={styles.input} {...field("quantityUnit")} />
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
            Describe the perfect supplier for this need <span className={styles.labelHint}>(optional)</span>
          </label>
          <textarea
            id="idealSupplierDescription"
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
