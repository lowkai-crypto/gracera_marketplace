"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { authFetch, useSession } from "@/lib/auth-client";
import styles from "../../../warm.module.css";

type Message = {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
};

type DealDetail = {
  id: string;
  stage: string;
  counterpartProfile: { companyName?: string | null; displayName?: string | null } | null;
  messages: Message[];
};

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const session = useSession();
  const [deal, setDeal] = useState<DealDetail | null | undefined>(undefined);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    authFetch(`/api/deals/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setDeal);
  }, [params.id]);

  // No redirect here — the (portal) layout already guarantees an
  // authenticated session before this page renders.
  useEffect(() => {
    if (!session) return;
    load();
  }, [session, load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    const res = await authFetch(`/api/deals/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      setError(errBody?.error?.message ?? "Could not send message.");
      setSending(false);
      return;
    }
    setBody("");
    setSending(false);
    load();
  }

  if (!session) return null;
  if (deal === undefined) return null;

  if (deal === null) {
    return (
      <div className={styles.page}>
        <section className={styles.formSec}>
          <div className={styles.container}>
            <div className={styles.formNarrow}>
              <p className={styles.helpText}>Deal not found.</p>
              <Link href="/deals" className={styles.helpText}>
                Back to deals
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>
                {deal.counterpartProfile?.companyName || deal.counterpartProfile?.displayName || "Deal"}
              </h1>
              <p className={styles.heroSub}>Stage: {deal.stage}</p>
            </div>
            <div className={styles.formCard}>
              {deal.messages.length === 0 && (
                <p className={styles.helpText}>No messages yet — say hello.</p>
              )}
              {deal.messages.map((m) => (
                <div key={m.id} className={styles.formSection}>
                  <p className={styles.helpText}>
                    {m.senderUserId === session.userId ? "You" : "Them"} —{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <p>{m.body}</p>
                </div>
              ))}
              {error && <div className={styles.formError}>{error}</div>}
              <form onSubmit={send} className={styles.formGroup}>
                <textarea
                  className={styles.input}
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a message..."
                />
                <div className={styles.submitRow}>
                  <button type="submit" className={styles.btnSubmit} disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
              <div className={styles.submitRow}>
                <Link href="/deals" className={styles.helpText}>
                  Back to deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
