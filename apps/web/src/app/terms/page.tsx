import Link from "next/link";

import styles from "../warm.module.css";

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container} style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <h1 className={styles.h1}>Terms of Service</h1>
        <p className={styles.heroSub} style={{ margin: "0 auto 2rem" }}>
          Our terms of service are being drafted. Check back soon.
        </p>
        <Link href="/" className={styles.btnTealWarm}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
