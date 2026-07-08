import Link from "next/link";

import styles from "../warm.module.css";

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container} style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <h1 className={styles.h1}>Sign in</h1>
        <p className={styles.heroSub} style={{ margin: "0 auto 2rem" }}>
          Account sign-in is coming soon. In the meantime, reach out if you&apos;d
          like early access.
        </p>
        <Link href="/" className={styles.btnTealWarm}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
