"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "@/app/warm.module.css";

export default function AccountMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // mousedown (not click/blur) so a click on a menu item still registers
    // before the menu closes -- blur alone would close the panel first and
    // swallow the click.
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={styles.accountMenu} ref={wrapperRef}>
      <button
        type="button"
        className={styles.accountMenuTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {email}
        <span className={`${styles.accountMenuChevron} ${open ? styles.accountMenuChevronOpen : ""}`}>▾</span>
      </button>
      {open && (
        <div className={styles.accountMenuPanel} role="menu">
          <span className={styles.accountMenuEmail}>{email}</span>
          <Link href="/account" role="menuitem" className={styles.accountMenuItem} onClick={() => setOpen(false)}>
            User Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className={styles.accountMenuItem}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
