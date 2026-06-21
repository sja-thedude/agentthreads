"use client";

import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/** Threads-style white "Log in" pill. Hidden when signed in. */
export function LoginButton({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const { openAuthModal } = useUI();
  const t = useT();

  if (loading || user) return null;

  return (
    <button
      onClick={openAuthModal}
      className={cn(
        "rounded-xl bg-text px-4 py-1.5 text-[15px] font-semibold text-[var(--bg)] transition-opacity hover:opacity-90 active:scale-95",
        className
      )}
    >
      {t("nav.signIn")}
    </button>
  );
}

/** Fixed top-right Log in pill for desktop (Threads places it in the corner). */
export function DesktopLoginButton() {
  return (
    <div className="fixed right-5 top-3 z-50 hidden md:block">
      <LoginButton />
    </div>
  );
}
