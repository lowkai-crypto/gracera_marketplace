import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { eq, getDb, productLines, supplierProfiles } from "@/lib/db";
import styles from "../../warm.module.css";

// Genuinely public -- lives outside the (portal) route group on purpose,
// so it is never wrapped in the authenticated layout or its client-side
// session redirect. A Server Component (no "use client") so the initial
// HTML response actually contains the content, which is the entire point
// for crawlability/AEO -- a client-rendered shell would show a crawler
// nothing.

async function loadPublishedProfile(id: string) {
  const db = getDb();
  const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, id)).limit(1);
  if (!profile || profile.profileStatus !== "active") return null;
  const lines = await db.select().from(productLines).where(eq(productLines.supplierProfileId, id));
  return { profile, lines };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = await loadPublishedProfile(id);
  if (!found) return { title: "Supplier not found" };

  const content = found.profile.publicPageContent as { headline?: string; summary?: string } | null;
  const title = content?.headline || found.profile.companyName || "Supplier profile";
  const description = content?.summary || found.profile.tagline || found.profile.description || undefined;
  return { title: `${title} — Gracera`, description };
}

export default async function PublicSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await loadPublishedProfile(id);
  if (!found) notFound();

  const { profile, lines } = found;
  const content = profile.publicPageContent as { headline: string; summary: string; sections: { heading: string; body: string }[] } | null;

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>{content?.headline || profile.companyName || "Supplier"}</h1>
              {(content?.summary || profile.tagline) && (
                <p className={styles.heroSub}>{content?.summary || profile.tagline}</p>
              )}
            </div>
            <div className={styles.formCard}>
              {content ? (
                content.sections.map((s, i) => (
                  <div key={i} className={styles.formSection}>
                    <div className={styles.formSectionTitle}>{s.heading}</div>
                    <p>{s.body}</p>
                  </div>
                ))
              ) : (
                // Fallback for a published profile that hasn't had its
                // public page generated yet -- always something real to
                // show, never a dead end.
                <>
                  {profile.description && (
                    <div className={styles.formSection}>
                      <div className={styles.formSectionTitle}>About</div>
                      <p>{profile.description}</p>
                    </div>
                  )}
                  {profile.categories && profile.categories.length > 0 && (
                    <div className={styles.formSection}>
                      <div className={styles.formSectionTitle}>Categories</div>
                      <p>{profile.categories.join(", ")}</p>
                    </div>
                  )}
                </>
              )}
              {lines.length > 0 && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Products</div>
                  {lines.map((l) => (
                    <p key={l.id}>{l.name}</p>
                  ))}
                </div>
              )}
              <p className={styles.helpText} style={{ marginTop: "1rem" }}>
                {profile.headquartersCity && profile.country ? `${profile.headquartersCity}, ${profile.country}` : profile.country}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
