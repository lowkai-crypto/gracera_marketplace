"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, Palette, Building2, FileText, ScrollText, Share2, Search } from "lucide-react";

import styles from "../../warm.module.css";

const TABS = [
  { label: "Logo", href: "/admin/platform-settings/logo", icon: Palette },
  { label: "Company Info", href: "/admin/platform-settings/company", icon: Building2 },
  { label: "Privacy Policy", href: "/admin/platform-settings/privacy-policy", icon: FileText },
  { label: "Terms of Service", href: "/admin/platform-settings/terms-of-service", icon: ScrollText },
];

// Suggested follow-ons, not built in this pass -- shown so the IA is
// visible, same "Soon" convention as the main sidebar.
const SOON_TABS = [
  { label: "Cookie Policy", icon: Cookie },
  { label: "Social Links", icon: Share2 },
  { label: "SEO Defaults", icon: Search },
];

export default function PlatformSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Platform Settings</h1>
      <p className={styles.adminSub}>
        super_admin only. Organization-wide branding and legal content -- shown site-wide, not
        specific to any one staff account.
      </p>
      <nav className={styles.platformSettingsTabs}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`${styles.platformSettingsTab} ${pathname === tab.href ? styles.platformSettingsTabActive : ""}`}
            >
              <Icon size={15} />
              {tab.label}
            </Link>
          );
        })}
        {SOON_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <span key={tab.label} className={styles.platformSettingsTabSoon}>
              <Icon size={15} />
              {tab.label}
            </span>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
