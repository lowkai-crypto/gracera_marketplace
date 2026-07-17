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

  const [intentText, setIntentText] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Translations are computed on demand and only ever kept in local state
  // -- never sent back to the server, never persisted alongside the
  // original message.
  const [translations, setTranslations] = useState<Record<string, string | "loading">>({});

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
    // Match-coaching can suggest a specific message to send here
    // (?draftMessage=...) — pre-fills the composer, still fully editable,
    // never auto-sent. Read via window.location rather than
    // useSearchParams() to avoid a new Suspense boundary on this page.
    const draft = new URLSearchParams(window.location.search).get("draftMessage");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (draft) setBody((current) => current || draft);
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

  async function handleDraft() {
    if (!intentText.trim()) return;
    setDrafting(true);
    setDraftError(null);
    const res = await authFetch(`/api/deals/${params.id}/assist-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "draft", intent: intentText }),
    });
    const resBody = await res.json().catch(() => null);
    if (!res.ok || !resBody) {
      setDraftError(resBody?.error?.message ?? "Could not draft a message.");
      setDrafting(false);
      return;
    }
    // Drops the draft into the same composer the Send button already
    // uses -- fully editable, never sent automatically.
    setBody(resBody.draft);
    setDrafting(false);
  }

  async function handleTranslate(messageId: string, text: string) {
    setTranslations((t) => ({ ...t, [messageId]: "loading" }));
    const res = await authFetch(`/api/deals/${params.id}/assist-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "translate", text }),
    });
    const resBody = await res.json().catch(() => null);
    setTranslations((t) => ({
      ...t,
      [messageId]: res.ok && resBody ? resBody.draft : "(Could not translate this message.)",
    }));
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
                  {translations[m.id] ? (
                    <p className={styles.helpText}>
                      {translations[m.id] === "loading" ? "Translating..." : translations[m.id]}
                    </p>
                  ) : (
                    <button
                      type="button"
                      className={styles.helpText}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => handleTranslate(m.id, m.body)}
                    >
                      Translate
                    </button>
                  )}
                </div>
              ))}
              {error && <div className={styles.formError}>{error}</div>}
              <div className={styles.formGroup}>
                <label className={styles.label}>Draft with AI (optional)</label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    className={styles.input}
                    style={{ flex: "1 1 auto" }}
                    placeholder="e.g. ask about a bulk discount"
                    value={intentText}
                    onChange={(e) => setIntentText(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.btnSubmit}
                    style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                    onClick={handleDraft}
                    disabled={drafting || !intentText.trim()}
                  >
                    {drafting ? "Drafting..." : "Draft"}
                  </button>
                </div>
                {draftError && <div className={styles.formError} style={{ marginTop: "0.5rem" }}>{draftError}</div>}
              </div>
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
