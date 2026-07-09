"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../../warm.module.css";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType: string;
  entityId: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const session = useSession();
  const [items, setItems] = useState<NotificationItem[] | null>(null);

  const load = useCallback(() => {
    authFetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { notifications: [] }))
      .then((body) => setItems(body.notifications ?? []));
  }, []);

  useEffect(() => {
    if (!session) {
      router.replace("/get-started");
      return;
    }
    load();
  }, [session, router, load]);

  async function markAllRead() {
    await authFetch("/api/notifications/read-all", { method: "POST" });
    load();
  }

  async function open(n: NotificationItem) {
    if (!n.read) {
      await authFetch(`/api/notifications/${n.id}/read`, { method: "POST" });
    }
    router.push(n.entityType === "match" ? "/matches" : `/deals/${n.entityId}`);
  }

  if (!session) return null;

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Notifications</h1>
            </div>
            <div className={styles.formCard}>
              {items === null ? (
                <p className={styles.helpText}>Loading...</p>
              ) : items.length === 0 ? (
                <p className={styles.helpText}>No notifications yet.</p>
              ) : (
                <>
                  <div className={styles.submitRow}>
                    <button type="button" className={styles.btnSubmit} onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                  {items.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => open(n)}
                      className={styles.formSection}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        display: "block",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{n.title}</strong>
                        {!n.read && <span className={styles.pctW}>New</span>}
                      </div>
                      <p className={styles.helpText}>{n.body}</p>
                      <p className={styles.helpText}>{new Date(n.createdAt).toLocaleString()}</p>
                    </button>
                  ))}
                </>
              )}
              <div className={styles.submitRow}>
                <Link href="/onboarding" className={styles.helpText}>
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
