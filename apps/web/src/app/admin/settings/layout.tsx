"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound, Palette } from "lucide-react";

import { authFetch } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type Me = { adminRole: string | null };

// Settings has two tabs: Account (own MFA -- any staff member) and Branding
// (org-wide logo/legal content -- super_admin only, hidden from anyone
// else since they'd just get a 403 from every fetch on that page anyway).
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    authFetch("/api/admin/me")
      .then((res) => res.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminHeading}>Settings</h1>
      <p className={styles.adminSub}>Your account, and organization-wide branding if you&apos;re a super_admin.</p>
      <nav className={styles.platformSettingsTabs}>
        <Link
          href="/admin/settings/account"
          className={`${styles.platformSettingsTab} ${pathname.startsWith("/admin/settings/account") ? styles.platformSettingsTabActive : ""}`}
        >
          <KeyRound size={15} />
          Account
        </Link>
        {me?.adminRole === "super_admin" && (
          <Link
            href="/admin/settings/branding"
            className={`${styles.platformSettingsTab} ${pathname.startsWith("/admin/settings/branding") ? styles.platformSettingsTabActive : ""}`}
          >
            <Palette size={15} />
            Branding
          </Link>
        )}
      </nav>
      {children}
    </div>
  );
}
