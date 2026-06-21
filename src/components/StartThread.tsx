"use client";

import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";

/** Threads-style "Start a thread…" prompt row at the top of the feed. */
export function StartThread() {
  const { user, profile } = useAuth();
  const { openComposer, openAuthModal } = useUI();
  const t = useT();

  const open = () => (user ? openComposer() : openAuthModal());

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-4">
      {profile ? (
        <Avatar profile={profile} size="md" link={false} />
      ) : (
        <span className="h-9 w-9 shrink-0 rounded-full bg-card-hover" aria-hidden />
      )}
      <button
        onClick={open}
        className="flex-1 text-left text-[15px] text-muted"
      >
        {t("composer.placeholder")}
      </button>
      <button
        onClick={open}
        className="rounded-full border border-border-strong px-4 py-1.5 text-[15px] font-semibold text-text transition-colors hover:bg-card-hover"
      >
        {t("composer.post")}
      </button>
    </div>
  );
}
