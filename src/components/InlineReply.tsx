"use client";

import { Composer } from "@/components/Composer";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import type { PostWithAuthor } from "@/lib/types";

/** Reply box shown under the main post in a thread. */
export function InlineReply({ replyTo }: { replyTo: PostWithAuthor }) {
  const { user, loading } = useAuth();
  const { openAuthModal } = useUI();
  const t = useT();

  if (loading) return <div className="h-16 border-y border-border" />;

  if (!user) {
    return (
      <div className="flex items-center justify-between gap-3 border-y border-border px-4 py-4">
        <p className="text-sm text-muted">{t("auth.loginToInteract")}</p>
        <button
          onClick={openAuthModal}
          className="shrink-0 rounded-full bg-text px-4 py-1.5 text-sm font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
        >
          {t("nav.signIn")}
        </button>
      </div>
    );
  }

  return (
    <div className="border-y border-border">
      <Composer replyTo={replyTo} autoFocus={false} />
    </div>
  );
}
