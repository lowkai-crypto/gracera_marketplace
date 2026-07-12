"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession, getSession, useSession } from "@/lib/auth-client";
import AccountMenu from "@/components/AccountMenu";
import styles from "../warm.module.css";

type NavItem = {
  label: string;
  href?: string; // omitted => "Soon" (feature not built yet)
  // "Messages" shares a destination with "Deals" — without this, both
  // light up together whenever either is active, which reads as two
  // items being "selected" at once rather than "these are the same page."
  neverActive?: boolean;
};

// docs/28-portal-navigation.md Supplier context table, in that doc's order.
const SUPPLIER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/onboarding" },
  { label: "Business Profile", href: "/onboarding/supplier" },
  { label: "Matches", href: "/matches" },
  { label: "Deals", href: "/deals" },
  { label: "Messages", href: "/deals", neverActive: true }, // same destination — messaging lives inside a deal, not its own page
  { label: "AI-Brain" },
  { label: "Insights" },
  { label: "Certifications" },
  { label: "Visibility (AEO)" },
  { label: "Broadcasts" },
  { label: "Finance" },
  { label: "Reviews" },
  { label: "Contacts" },
  { label: "Billing" },
  { label: "Settings" },
];

// docs/28-portal-navigation.md Buyer context table, in that doc's order.
const BUYER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/onboarding" },
  { label: "Business Profile", href: "/onboarding/buyer" },
  { label: "Sourcing Requests", href: "/onboarding/sourcing-request" }, // create form — no list page exists yet
  { label: "Matches", href: "/matches" },
  { label: "Deals", href: "/deals" },
  { label: "Messages", href: "/deals", neverActive: true },
  { label: "Group Buys" },
  { label: "AI-Brain" },
  { label: "Price Compass" },
  { label: "Insights" },
  { label: "Logistics" },
  { label: "Payment & Trust" },
  { label: "Reviews" },
  { label: "Contacts" },
  { label: "Billing" },
  { label: "Settings" },
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

  const defaultContext: Context = session?.role === "both" ? "supplier" : (session?.role ?? "supplier");
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
        <Link href="/onboarding" className={styles.portalWordmark}>
          Gracera
        </Link>
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
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.portalNavLink} ${!item.neverActive && isActive(pathname, item.href) ? activeLinkClass : ""}`}
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
        </nav>
        <main className={styles.portalMain}>{children}</main>
      </div>
    </div>
  );
}
