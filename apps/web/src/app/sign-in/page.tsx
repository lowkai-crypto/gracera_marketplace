"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveSession } from "@/lib/auth-client";
import styles from "../warm.module.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      saveSession({
        userId: body.user_id,
        email: body.email,
        role: body.role,
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
      });
      router.push(body.role === "admin" ? "/admin" : "/onboarding");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.formSec}>
        <div className={styles.container}>
          <div className={styles.formNarrow}>
            <div className={styles.formIntro}>
              <h1 className={styles.h1}>Sign in</h1>
              <p className={styles.heroSub}>Welcome back.</p>
            </div>
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
                <Link href="/get-started" className={styles.helpText}>
                  Don&apos;t have an account? Get started
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
