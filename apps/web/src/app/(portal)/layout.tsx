"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  ChartLine,
  Compass,
  Contact as ContactIcon,
  CreditCard,
  Eye,
  Handshake,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  PackageSearch,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { clearSession, getSession, useSession } from "@/lib/auth-client";
import AccountMenu from "@/components/AccountMenu";
import Logo from "@/components/Logo";
import styles from "../warm.module.css";

type NavItem = {
  label: string;
  href?: string; // omitted => "Soon" (feature not built yet)
  // "Messages" shares a destination with "Deals" — without this, both
  // light up together whenever either is active, which reads as two
  // items being "selected" at once rather than "these are the same page."
  neverActive?: boolean;
  icon: LucideIcon;
  color: string;
};

// docs/28-portal-navigation.md Supplier context table, in that doc's order.
// Icon/color choices are shared across portals for concepts that appear in
// more than one (Dashboard, Matches, Deals, Messages, AI-Brain, Insights,
// Reviews, Contacts, Billing, Settings) so switching contexts/portals feels
// like the same mental model, not a re-skin.
const SUPPLIER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/onboarding", icon: LayoutDashboard, color: "#22c55e" },
  { label: "Business Profile", href: "/onboarding/supplier", icon: Building2, color: "#6366f1" },
  { label: "Matches", href: "/matches", icon: Handshake, color: "#f97316" },
  { label: "Deals", href: "/deals", icon: Briefcase, color: "#f59e0b" },
  { label: "Messages", href: "/deals", neverActive: true, icon: MessageSquare, color: "#0ea5e9" }, // same destination — messaging lives inside a deal, not its own page
  { label: "AI-Brain", icon: Sparkles, color: "#8b5cf6" },
  { label: "Insights", icon: ChartLine, color: "#10b981" },
  { label: "Certifications", icon: ShieldCheck, color: "#06b6d4" },
  { label: "Visibility (AEO)", icon: Eye, color: "#d946ef" },
  { label: "Broadcasts", icon: Megaphone, color: "#f43f5e" },
  { label: "Finance", icon: Wallet, color: "#84cc16" },
  { label: "Reviews", icon: Star, color: "#eab308" },
  { label: "Contacts", icon: ContactIcon, color: "#64748b" },
  { label: "Billing", icon: CreditCard, color: "#14b8a6" },
  { label: "Settings", icon: SettingsIcon, color: "#6b7280" },
];

// docs/28-portal-navigation.md Buyer context table, in that doc's order.
const BUYER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/onboarding", icon: LayoutDashboard, color: "#22c55e" },
  { label: "Business Profile", href: "/onboarding/buyer", icon: Building2, color: "#6366f1" },
  { label: "Sourcing Requests", href: "/onboarding/sourcing-request", icon: PackageSearch, color: "#ec4899" }, // create form — no list page exists yet
  { label: "Matches", href: "/matches", icon: Handshake, color: "#f97316" },
  { label: "Deals", href: "/deals", icon: Briefcase, color: "#f59e0b" },
  { label: "Messages", href: "/deals", neverActive: true, icon: MessageSquare, color: "#0ea5e9" },
  { label: "Group Buys", icon: Users, color: "#059669" },
  { label: "AI-Brain", icon: Sparkles, color: "#8b5cf6" },
  { label: "Price Compass", icon: Compass, color: "#06b6d4" },
  { label: "Insights", icon: ChartLine, color: "#10b981" },
  { label: "Logistics", icon: Truck, color: "#b45309" },
  { label: "Payment & Trust", icon: ShieldCheck, color: "#65a30d" },
  { label: "Reviews", icon: Star, color: "#eab308" },
  { label: "Contacts", icon: ContactIcon, color: "#64748b" },
  { label: "Billing", icon: CreditCard, color: "#14b8a6" },
  { label: "Settings", icon: SettingsIcon, color: "#6b7280" },
];

const ACTIVE_CONTEXT_KEY = "gracera.activeContext";
type Context = "supplier" | "buyer";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href === "/deals" && pathname.startsWith("/deals/"));
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const [logoKey, setLogoKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/platform-settings")
      .then((res) => res.json())
      .then((body) => setLogoKey(body.logoKey))
      .catch(() => {});
  }, []);

  // "both"/"admin"/no-session all fall back to "supplier" here -- "both"
  // resolves for real once the effect below reads the actual localStorage
  // preference, and "admin" never lingers since that same effect redirects
  // admin sessions to /admin before this fallback value is ever shown.
  const defaultContext: Context =
    session?.role === "supplier" || session?.role === "buyer" ? session.role : "supplier";
  const [activeContext, setActiveContext] = useState<Context>(defaultContext);

  useEffect(() => {
    // Read the session directly here rather than trusting the reactive
    // `session` value from useSession(). That hook is backed by
    // useSyncExternalStore with a `null` server snapshot, so right after
    // hydration there's a window where it still reads null even though
    // real localStorage already has a valid session — redirecting on that
    // stale read sent logged-in users back to /get-started on every
    // refresh. getSession() only ever runs client-side here, so it always
    // reflects the real, current value, no snapshot mismatch possible.
    const current = getSession();
    if (!current) {
      router.replace("/get-started");
      return;
    }
    // Admin accounts have their own portal at /admin -- this shell (and its
    // supplier/buyer Context type) doesn't apply to them at all.
    if (current.role === "admin") {
      router.replace("/admin");
      return;
    }
    // Single-role accounts: `defaultContext` (used to seed activeContext's
    // initial state) was computed from useSession(), which reads null on
    // the very first render — so a buyer-only account could get seeded
    // with the "supplier" fallback and never self-correct, since nothing
    // else re-derives activeContext from the real role after that. Always
    // resync here, once the real session is available.
    if (current.role !== "both") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveContext(current.role);
      return;
    }
    const stored = localStorage.getItem(ACTIVE_CONTEXT_KEY);
    if (stored !== "supplier" && stored !== "buyer") return;
    setActiveContext(stored);
  }, [router]);

  function switchContext(context: Context) {
    setActiveContext(context);
    localStorage.setItem(ACTIVE_CONTEXT_KEY, context);
  }

  if (!session) return null;

  const navItems = activeContext === "supplier" ? SUPPLIER_NAV : BUYER_NAV;
  const activeLinkClass = activeContext === "supplier" ? styles.portalNavLinkActive : styles.portalNavLinkActiveBuyer;

  return (
    <div className={styles.page}>
      <div className={styles.portalTopbar}>
        <Logo logoKey={logoKey} href="/onboarding" />
        <div className={styles.portalTopbarRight}>
          {session.role === "both" && (
            <div className={styles.portalSwitcher}>
              <button
                type="button"
                className={`${styles.portalSwitchBtn} ${activeContext === "supplier" ? styles.portalSwitchBtnActive : ""}`}
                onClick={() => switchContext("supplier")}
              >
                Supplier
              </button>
              <button
                type="button"
                className={`${styles.portalSwitchBtn} ${activeContext === "buyer" ? styles.portalSwitchBtnActive : ""}`}
                onClick={() => switchContext("buyer")}
              >
                Buyer
              </button>
            </div>
          )}
          <AccountMenu
            email={session.email}
            onLogout={() => {
              clearSession();
              router.push("/");
            }}
          />
        </div>
      </div>
      <div className={styles.portalBody}>
        <nav className={styles.portalSidebar}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.portalNavLink} ${!item.neverActive && isActive(pathname, item.href) ? activeLinkClass : ""}`}
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
        </nav>
        <main className={styles.portalMain}>{children}</main>
      </div>
    </div>
  );
}
