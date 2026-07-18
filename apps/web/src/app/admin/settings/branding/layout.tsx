"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, Palette, Building2, FileText, ScrollText, Share2, Search } from "lucide-react";

import styles from "../../../warm.module.css";

const TABS = [
  { label: "Logo", href: "/admin/settings/branding/logo", icon: Palette },
  { label: "Company Info", href: "/admin/settings/branding/company", icon: Building2 },
  { label: "Privacy Policy", href: "/admin/settings/branding/privacy-policy", icon: FileText },
  { label: "Terms of Service", href: "/admin/settings/branding/terms-of-service", icon: ScrollText },
];

// Suggested follow-ons, not built in this pass -- shown so the IA is
// visible, same "Soon" convention as the main sidebar.
const SOON_TABS = [
  { label: "Cookie Policy", icon: Cookie },
  { label: "Social Links", icon: Share2 },
  { label: "SEO Defaults", icon: Search },
];

// Second-level tab bar, nested under Settings' own Account/Branding tabs
// (admin/settings/layout.tsx) -- no adminContent/H1 here, that's the outer
// layout's job, this just adds one more tab row underneath it.
export default function BrandingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <p className={styles.adminSub}>
        Organization-wide branding and legal content -- shown site-wide, not specific to any one
        staff account.
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
    </>
  );
}
