"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Banknote,
  ChartColumn,
  Flag,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings as SettingsIcon,
  Shuffle,
  ShieldCheck,
  TriangleAlert,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { authFetch, clearSession, getSession } from "@/lib/auth-client";
import Logo from "@/components/Logo";
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
  icon: LucideIcon;
  color: string;
};

// docs/28-portal-navigation.md Admin context table, in that doc's order.
// Org-wide branding/legal config (new, not in docs/28's original table)
// lives at /admin/settings/branding -- a sub-tab under Settings, not its
// own top-level item, so it isn't listed here.
const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", audience: ["super_admin"], icon: LayoutDashboard, color: "#22c55e" },
  {
    label: "Verification Queue",
    href: "/admin/verification",
    audience: ["trust_team"],
    icon: ShieldCheck,
    color: "#06b6d4",
  },
  { label: "Dispute Queue", audience: ["trust_team"], icon: TriangleAlert, color: "#f43f5e" },
  { label: "Wire Transfer Queue", audience: ["finance_ops"], icon: Banknote, color: "#10b981" },
  { label: "Match Override", audience: ["customer_success", "trust_team"], icon: Shuffle, color: "#f97316" },
  { label: "Accounts", audience: ["customer_success"], icon: UserCog, color: "#6366f1" },
  { label: "Content Moderation", href: "/admin/moderation", audience: ["content_mod"], icon: Flag, color: "#d946ef" },
  { label: "Platform Metrics", audience: ["data_analyst", "super_admin"], icon: ChartColumn, color: "#8b5cf6" },
  { label: "Role & Feature Management", audience: ["super_admin"], icon: KeyRound, color: "#f59e0b" },
  { label: "Staff Accounts", href: "/admin/staff", audience: ["super_admin"], icon: UsersRound, color: "#64748b" },
  { label: "Audit Log", href: "/admin/audit-log", audience: ["super_admin"], icon: ScrollText, color: "#a855f7" },
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
  const [logoKey, setLogoKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/platform-settings")
      .then((res) => res.json())
      .then((body) => setLogoKey(body.logoKey))
      .catch(() => {});
  }, []);

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
        <div className={styles.portalTopbarLeft}>
          <Logo logoKey={logoKey} href="/admin" />
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <div className={styles.portalTopbarRight}>
          <span className={styles.adminBadge}>{me.adminRole ?? "no role assigned"}</span>
          <button type="button" className={styles.adminBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
      <div className={styles.portalBody}>
        <nav className={styles.portalSidebar}>
          {ADMIN_NAV.filter((item) => canSee(item, me.adminRole)).map((item) => {
            const Icon = item.icon;
            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.portalNavLink} ${pathname === item.href ? styles.portalNavLinkActive : ""}`}
              >
                <Icon size={18} color={item.color} className={styles.portalNavIcon} />
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className={styles.portalNavLinkSoon}>
                <span className={styles.portalNavSoonLabel}>
                  <Icon size={18} color={item.color} className={styles.portalNavIcon} />
                  {item.label}
                </span>
                <span className={styles.portalNavBadgeSoon}>Soon</span>
              </div>
            );
          })}
          <Link
            href="/admin/settings"
            className={`${styles.portalNavLink} ${pathname.startsWith("/admin/settings") ? styles.portalNavLinkActive : ""}`}
          >
            <SettingsIcon size={18} color="#6b7280" className={styles.portalNavIcon} />
            Settings
          </Link>
        </nav>
        <main className={styles.portalMain}>{children}</main>
      </div>
    </div>
  );
}
