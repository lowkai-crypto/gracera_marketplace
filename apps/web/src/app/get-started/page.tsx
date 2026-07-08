"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveSession } from "@/lib/auth-client";
import styles from "../warm.module.css";

type Role = "supplier" | "buyer" | "both";

export default function GetStartedPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("supplier");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
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
      router.push("/onboarding");
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
              <h1 className={styles.h1}>Get started</h1>
              <p className={styles.heroSub}>
                Create your account — it takes less than a minute. You can
                build out your full profile after.
              </p>
            </div>
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="role">
                  I am a...
                </label>
                <div className={styles.roleOptions}>
                  {(["supplier", "buyer", "both"] as Role[]).map((r) => (
                    <label key={r} className={styles.roleOption}>
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={role === r}
                        onChange={() => setRole(r)}
                        className={styles.roleOptionInput}
                      />
                      {r === "both" ? "Both" : r === "supplier" ? "Supplier" : "Buyer"}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">
                  Work email
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
                  minLength={8}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className={styles.helpText}>At least 8 characters.</span>
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                  {submitting ? "Creating account..." : "Create account"}
                </button>
                <Link href="/sign-in" className={styles.helpText}>
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
