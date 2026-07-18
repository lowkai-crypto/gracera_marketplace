"use client";

import { usePathname } from "next/navigation";

import styles from "../../warm.module.css";

// Account vs Branding is chosen in the sidebar itself now
// (admin/layout.tsx's Settings group), not a tab bar here -- this layout
// just supplies the shared adminContent wrapper and a heading that matches
// whichever sub-section is active.
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const heading = pathname.startsWith("/admin/settings/branding") ? "Branding" : "Account";

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>{heading}</h1>
      {children}
    </div>
  );
}
