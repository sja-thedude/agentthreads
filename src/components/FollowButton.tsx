"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function FollowButton({
  targetId,
  initialFollowing = false,
  size = "md",
}: {
  targetId: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
}) {
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  const t = useT();
  const supabase = createClient();

  const [following, setFollowing] = useState(initialFollowing);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSelf = user?.id === targetId;
  if (isSelf) return null;

  async function toggle() {
    if (!user) return openAuthModal();
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    const q = next
      ? supabase.from("follows").insert({ follower_id: user.id, following_id: targetId })
      : supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetId);
    const { error } = await q;
    if (error) setFollowing(!next);
    setBusy(false);
  }

  const label = following ? (hover ? t("profile.unfollow") : t("profile.following")) : t("profile.follow");

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={busy}
      aria-pressed={following}
      className={cn(
        "rounded-full font-semibold transition-all duration-150 active:scale-95 disabled:opacity-60",
        size === "sm" ? "px-4 py-1.5 text-sm" : "px-5 py-2 text-[15px]",
        following
          ? "border border-border-strong text-text hover:border-like hover:text-like"
          : "bg-text text-[var(--bg)] hover:opacity-90"
      )}
      style={{ minWidth: size === "sm" ? 84 : 104 }}
    >
      {label}
    </button>
  );
}
