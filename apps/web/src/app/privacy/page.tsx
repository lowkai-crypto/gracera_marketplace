import Link from "next/link";

import { getDb } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/platform-settings";
import styles from "../warm.module.css";

export default async function PrivacyPage() {
  const settings = await getOrCreatePlatformSettings(getDb());
  const content = settings.privacyPolicyContent;

  return (
    <div className={styles.page}>
      <div
        className={styles.container}
        style={content ? { padding: "6rem 2rem 4rem", maxWidth: "48rem" } : { padding: "6rem 2rem", textAlign: "center" }}
      >
        <h1 className={styles.h1}>Privacy Policy</h1>
        {content ? (
          <p className={styles.heroSub} style={{ whiteSpace: "pre-wrap", textAlign: "left", margin: "1.5rem 0 2rem" }}>
            {content}
          </p>
        ) : (
          <p className={styles.heroSub} style={{ margin: "0 auto 2rem" }}>
            Our privacy policy is being drafted. Check back soon.
          </p>
        )}
        <Link href="/" className={styles.btnTealWarm}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
