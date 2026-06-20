"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { LogoMark } from "@/components/Logo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/lib/ui";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export function AuthModal() {
  const { authModalOpen, closeAuthModal } = useUI();
  const { signInWithGoogle } = useAuth();
  const t = useT();
  const supabase = createClient();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function google() {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-in is unavailable. Use the email link below.");
      setGoogleLoading(false);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  function handleClose() {
    closeAuthModal();
    // reset for next open
    setTimeout(() => {
      setSent(false);
      setError(null);
      setEmail("");
    }, 200);
  }

  return (
    <Modal open={authModalOpen} onClose={handleClose} labelledBy="auth-title">
      <div className="flex flex-col items-center px-8 py-10 text-center">
        <LogoMark size={52} />
        <h2 id="auth-title" className="mt-5 text-2xl font-bold tracking-tight">
          {t("auth.signInTitle")}
        </h2>
        <p className="mt-2 max-w-xs text-[15px] text-muted">{t("auth.signInSubtitle")}</p>

        {sent ? (
          <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-card-hover px-6 py-8">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            <p className="font-semibold">Check your inbox</p>
            <p className="text-sm text-muted">
              We sent a magic sign-in link to{" "}
              <span className="font-medium text-text">{email}</span>. Click it to continue.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={google}
              disabled={googleLoading}
              className="mt-7 flex w-full max-w-sm items-center justify-center gap-3 rounded-full border border-border-strong bg-white px-5 py-3 font-semibold text-[#1f1f1f] transition-all duration-150 hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
            >
              <GoogleIcon className="h-5 w-5" />
              {googleLoading ? t("auth.signingIn") : t("auth.continueWithGoogle")}
            </button>

            <div className="my-5 flex w-full max-w-sm items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={sendMagicLink} className="w-full max-w-sm">
              <div className="flex items-center gap-2 rounded-full border border-border-strong bg-[var(--bg)] px-4 py-1 focus-within:border-[var(--brand)]">
                <Mail className="h-4 w-4 shrink-0 text-faint" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  aria-label="Email address"
                  className="w-full bg-transparent py-2 text-[15px] text-text outline-none placeholder:text-faint"
                />
                <button
                  type="submit"
                  disabled={sending}
                  aria-label="Send magic link"
                  className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-faint">
                {sending ? "Sending link…" : "We'll email you a one-tap sign-in link — no password."}
              </p>
            </form>
          </>
        )}

        {error && <p className="mt-4 max-w-sm text-sm text-like">{error}</p>}
      </div>
    </Modal>
  );
}
