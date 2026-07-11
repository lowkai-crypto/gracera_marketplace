"use client";

import { useState } from "react";
import styles from "@/app/warm.module.css";

/**
 * Small "i" trigger next to a label that reveals a popup with more detail.
 * Shows on hover/focus via CSS alone (zero JS latency on desktop); the
 * click-toggle state below is what makes it work on touch, where hover
 * doesn't exist.
 */
export default function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={styles.tooltipWrap}>
      <button
        type="button"
        className={styles.tooltipTrigger}
        aria-label="More info"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span className={`${styles.tooltipPopup} ${open ? styles.tooltipPopupOpen : ""}`} role="tooltip">
        {text}
      </span>
    </span>
  );
}
