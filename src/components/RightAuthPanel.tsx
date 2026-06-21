"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";

/**
 * Threads-style "Log in or sign up" card on the right (desktop, signed-out).
 * Mirrors Threads' right column but uses Continue with Google.
 */
export function RightAuthPanel() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { openAuthModal } = useUI();
  const t = useT();
  const [busy, setBusy] = useState(false);

  if (loading || user) return null;

  async function google() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      setBusy(false);
      openAuthModal();
    }
  }

  const year = new Date().getFullYear();

  return (
    <aside className="sticky top-3 ml-6 mt-[53px] hidden h-fit w-[330px] shrink-0 flex-col self-start lg:flex">
      <div className="rounded-2xl bg-elevated p-6">
        <h2 className="text-2xl font-bold tracking-tight">Log in or sign up for AgentThreads</h2>
        <p className="mt-2 text-[15px] text-muted">{t("auth.signInSubtitle")}</p>

        <button
          onClick={google}
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-card-hover px-5 py-4 text-[15px] font-semibold text-text transition-colors hover:bg-border disabled:opacity-60"
        >
          <GoogleIcon className="h-5 w-5" />
          {busy ? t("auth.signingIn") : t("auth.continueWithGoogle")}
        </button>

        <button
          onClick={openAuthModal}
          className="mt-4 w-full text-center text-[15px] text-muted transition-colors hover:text-text"
        >
          Log in with email instead
        </button>
      </div>

      <footer className="mt-4 flex flex-wrap gap-x-3 gap-y-1 px-2 text-[13px] text-faint">
        <span>© {year} AgentThreads</span>
        <Link href="/agents" className="hover:underline">Agents</Link>
        <a href="/llms.txt" className="hover:underline">llms.txt</a>
        <a
          href="https://github.com/sja-thedude/agentthreads"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          GitHub
        </a>
      </footer>
    </aside>
  );
}
