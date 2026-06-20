"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { PostWithAuthor } from "@/lib/types";

export const MAX_LEN = 500;

/**
 * Reusable composer. Used standalone (inline reply box in thread view) and
 * inside the ComposeModal. Calls `onPosted` after a successful insert.
 */
export function Composer({
  replyTo,
  autoFocus = true,
  onPosted,
  compact = false,
}: {
  replyTo?: PostWithAuthor | null;
  autoFocus?: boolean;
  onPosted?: () => void;
  compact?: boolean;
}) {
  const { user, profile } = useAuth();
  const { toast } = useUI();
  const t = useT();
  const router = useRouter();
  const supabase = createClient();

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 360) + "px";
  }

  const remaining = MAX_LEN - content.length;
  const over = remaining < 0;
  const canPost = content.trim().length > 0 && !over && !posting;

  async function submit() {
    if (!user || !canPost) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      parent_id: replyTo?.id ?? null,
    });
    setPosting(false);
    if (error) {
      toast(t("common.somethingWrong"));
      return;
    }
    setContent("");
    if (ref.current) ref.current.style.height = "auto";
    toast(replyTo ? t("composer.reply") + " ✓" : t("composer.post") + " ✓");
    router.refresh();
    onPosted?.();
  }

  if (!profile) return null;

  return (
    <div className={cn("flex gap-3", compact ? "p-3" : "p-4")}>
      <Avatar profile={profile} size="md" link={false} />
      <div className="flex-1">
        {replyTo && (
          <p className="mb-1 text-sm text-muted">
            {t("post.replyingTo")}{" "}
            <span className="text-link">@{replyTo.author.username}</span>
          </p>
        )}
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            autoGrow(e.target);
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          rows={compact ? 1 : 2}
          placeholder={replyTo ? t("composer.replyPlaceholder") : t("composer.placeholder")}
          className="w-full resize-none bg-transparent text-[17px] leading-relaxed text-text placeholder:text-faint focus:outline-none"
          aria-label={replyTo ? t("composer.replyPlaceholder") : t("composer.placeholder")}
        />
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-3">
          <CharCounter remaining={remaining} />
          <button
            onClick={submit}
            disabled={!canPost}
            className="rounded-full bg-text px-5 py-1.5 text-[15px] font-semibold text-[var(--bg)] transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {posting ? t("composer.posting") : replyTo ? t("composer.reply") : t("composer.post")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CharCounter({ remaining }: { remaining: number }) {
  const pct = Math.min(1, (MAX_LEN - remaining) / MAX_LEN);
  const danger = remaining <= 20;
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2">
      {danger && (
        <span className={cn("text-xs tabular-nums", remaining < 0 ? "text-like" : "text-muted")}>
          {remaining}
        </span>
      )}
      <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={remaining < 0 ? "var(--color-like)" : "var(--brand)"}
          strokeWidth="2.5"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
