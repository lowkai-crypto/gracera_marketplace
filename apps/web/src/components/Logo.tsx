import Link from "next/link";

import { findLogoCandidate } from "@/lib/logo-candidates";
import styles from "@/app/warm.module.css";

const DEFAULT_MARK = (
  <>
    <circle cx="5" cy="5" r="2.5" fill="white" opacity=".9" />
    <circle cx="11" cy="5" r="2.5" fill="white" opacity=".55" />
    <circle cx="5" cy="11" r="2.5" fill="white" opacity=".55" />
    <circle cx="11" cy="11" r="2.5" fill="white" opacity=".25" />
  </>
);

/**
 * The site-wide brand mark + "gracera.ai" wordmark -- reused on the
 * marketing homepage nav and the supplier/buyer/admin portal topbars.
 * `logoKey` comes from platform_settings (via /api/platform-settings or a
 * direct DB read); null/unknown falls back to the original default mark.
 */
export default function Logo({
  logoKey,
  href = "/",
  className,
}: {
  logoKey?: string | null;
  href?: string;
  className?: string;
}) {
  const candidate = findLogoCandidate(logoKey);

  return (
    <Link href={href} className={className ?? styles.logo}>
      <span className={styles.lm} style={candidate ? { background: candidate.background } : undefined}>
        <svg viewBox="0 0 16 16" fill="none" width={16} height={16}>
          {candidate ? candidate.glyph() : DEFAULT_MARK}
        </svg>
      </span>
      gracera<span className={styles.logoDot}>.</span>ai
    </Link>
  );
}
