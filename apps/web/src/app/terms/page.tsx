import Link from "next/link";

import { getDb } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/platform-settings";
import styles from "../warm.module.css";

// See page.tsx's comment on force-dynamic -- same reasoning: admin edits
// must show up immediately, and this must never run at `next build` time.
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getOrCreatePlatformSettings(getDb());
  const content = settings.termsOfServiceContent;

  return (
    <div className={styles.page}>
      <div
        className={styles.container}
        style={content ? { padding: "6rem 2rem 4rem", maxWidth: "48rem" } : { padding: "6rem 2rem", textAlign: "center" }}
      >
        <h1 className={styles.h1}>Terms of Service</h1>
        {content ? (
          <p className={styles.heroSub} style={{ whiteSpace: "pre-wrap", textAlign: "left", margin: "1.5rem 0 2rem" }}>
            {content}
          </p>
        ) : (
          <p className={styles.heroSub} style={{ margin: "0 auto 2rem" }}>
            Our terms of service are being drafted. Check back soon.
          </p>
        )}
        <Link href="/" className={styles.btnTealWarm}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
