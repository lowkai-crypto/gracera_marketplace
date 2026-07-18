"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authFetch, clearSession, getSession } from "@/lib/auth-client";
import styles from "../warm.module.css";

type AdminRole =
  | "super_admin"
  | "trust_team"
  | "customer_success"
  | "finance_ops"
  | "content_mod"
  | "data_analyst";

type NavItem = {
  label: string;
  href?: string; // omitted => "Soon" (feature not built in this pass)
  // docs/20 §1 -- super_admin holds "all capabilities", so it can always see
  // every item regardless of a narrower primary audience below (docs/28's
  // Audience column names the primary role, not an exclusion list).
  audience: AdminRole[];
};

// docs/28-portal-navigation.md Admin context table, in that doc's order.
const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", audience: ["super_admin"] },
  { label: "Verification Queue", href: "/admin/verification", audience: ["trust_team"] },
  { label: "Dispute Queue", audience: ["trust_team"] },
  { label: "Wire Transfer Queue", audience: ["finance_ops"] },
  { label: "Match Override", audience: ["customer_success", "trust_team"] },
  { label: "Accounts", audience: ["customer_success"] },
  { label: "Content Moderation", href: "/admin/moderation", audience: ["content_mod"] },
  { label: "Platform Metrics", audience: ["data_analyst", "super_admin"] },
  { label: "Role & Feature Management", audience: ["super_admin"] },
  { label: "Staff Accounts", href: "/admin/staff", audience: ["super_admin"] },
  { label: "Audit Log", href: "/admin/audit-log", audience: ["super_admin"] },
];

type Me = { email: string; adminRole: AdminRole | null; mfaEnabled: boolean };

function canSee(item: NavItem, adminRole: AdminRole | null): boolean {
  if (adminRole === "super_admin") return true;
  return adminRole !== null && item.audience.includes(adminRole);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Belt-and-suspenders with proxy.ts's cookie-only optimistic redirect --
    // this is the client-side check that mirrors (portal)/layout.tsx's own
    // pattern, and it's the one that actually re-confirms role/mfa state
    // against the DB rather than a 7-day-old cookie.
    if (!getSession()) {
      router.replace("/sign-in");
      return;
    }
    authFetch("/api/admin/me")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/sign-in");
          return;
        }
        setMe(await res.json());
      })
      .finally(() => setChecked(true));
  }, [router]);

  if (!checked || !me) return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearSession();
    router.push("/sign-in");
  }

  return (
    <div className={styles.page}>
      <div className={styles.portalTopbar}>
        <Link href="/admin" className={styles.portalWordmark}>
          Gracera Admin
        </Link>
        <div className={styles.portalTopbarRight}>
          <span className={styles.adminBadge}>{me.adminRole ?? "no role assigned"}</span>
          <button type="button" className={styles.adminBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
      <div className={styles.portalBody}>
        <nav className={styles.portalSidebar}>
          {ADMIN_NAV.filter((item) => canSee(item, me.adminRole)).map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.portalNavLink} ${pathname === item.href ? styles.portalNavLinkActive : ""}`}
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className={styles.portalNavLinkSoon}>
                <span>{item.label}</span>
                <span className={styles.portalNavBadgeSoon}>Soon</span>
              </div>
            ),
          )}
          <Link
            href="/admin/settings"
            className={`${styles.portalNavLink} ${pathname === "/admin/settings" ? styles.portalNavLinkActive : ""}`}
          >
            Settings
          </Link>
        </nav>
        <main className={styles.portalMain}>{children}</main>
      </div>
    </div>
  );
}
