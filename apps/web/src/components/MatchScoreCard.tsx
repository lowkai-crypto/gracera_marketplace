"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/warm.module.css";

const DIMENSIONS = [
  { name: "Category", pct: 96 },
  { name: "Geography", pct: 88 },
  { name: "Scale", pct: 92 },
  { name: "Certifications", pct: 85 },
  { name: "Customer Fit", pct: 90 },
  { name: "Language", pct: 82 },
];

export default function MatchScoreCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired) {
          fired = true;
          setTimeout(() => setAnimated(true), 200);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className={styles.storyCard}>
      <div className={styles.scWTop}>
        <div className={styles.scWPair}>
          <div className={styles.avW}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.avImg}
              src="https://api.dicebear.com/7.x/initials/svg?seed=Jangdok+Foods&backgroundColor=d1fae5&fontColor=166534&fontSize=38"
              alt="Jangdok Foods"
              width={40}
              height={40}
            />
          </div>
          <div>
            <div className={styles.avName}>Jangdok Foods</div>
            <div className={styles.avCountry}>Supplier · South Korea</div>
          </div>
          <span className={styles.arrW}>→</span>
          <div className={styles.avW}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.avImg}
              src="https://api.dicebear.com/7.x/initials/svg?seed=Lone+Star+Specialty&backgroundColor=ffedd5&fontColor=9a3412&fontSize=38"
              alt="Lone Star Specialty"
              width={40}
              height={40}
            />
          </div>
          <div>
            <div className={styles.avName}>Lone Star Specialty</div>
            <div className={styles.avCountry}>Buyer · United States</div>
          </div>
        </div>
        <span className={styles.pctW}>89%</span>
      </div>
      <div className={styles.dimsW}>
        {DIMENSIONS.map((dim) => (
          <div key={dim.name} className={styles.dimW}>
            <span className={styles.dnW}>{dim.name}</span>
            <div className={styles.dtW}>
              <div
                className={styles.dfW}
                style={{ width: animated ? `${dim.pct}%` : "0%" }}
              />
            </div>
            <span className={styles.dpW}>{dim.pct}%</span>
          </div>
        ))}
      </div>
      <div className={styles.ratW}>
        <div className={styles.ratWLabel}>AI Rationale</div>
        <p className={styles.ratWText}>
          &quot;Strong category alignment in Korean fermented condiments. FDA and
          HACCP certification confirmed. MOQ aligns with pilot order range.
          English communication capacity confirmed.&quot;
        </p>
      </div>
    </div>
  );
}
