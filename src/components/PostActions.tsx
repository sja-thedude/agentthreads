"use client";

import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { formatCount, cn } from "@/lib/cn";
import type { PostWithAuthor } from "@/lib/types";

export function PostActions({ post }: { post: PostWithAuthor }) {
  const { user } = useAuth();
  const { openComposer, openAuthModal, toast } = useUI();
  const t = useT();
  const supabase = createClient();

  const [liked, setLiked] = useState(!!post.liked_by_me);
  const [likes, setLikes] = useState(post.likes_count);
  const [reposts, setReposts] = useState(post.reposts_count);
  const [reposted, setReposted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!user) return openAuthModal();
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    const q = next
      ? supabase.from("likes").insert({ user_id: user.id, post_id: post.id })
      : supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
    const { error } = await q;
    if (error) {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  }

  function reply() {
    if (!user) return openAuthModal();
    openComposer(post);
  }

  async function repost() {
    if (!user) return openAuthModal();
    if (busy || reposted) return;
    setBusy(true);
    setReposted(true);
    setReposts((n) => n + 1);
    const { error } = await supabase
      .from("posts")
      .insert({ author_id: user.id, content: "", repost_of_id: post.id });
    setBusy(false);
    if (error) {
      setReposted(false);
      setReposts((n) => n - 1);
    } else {
      toast(t("post.repost") + " ✓");
    }
  }

  async function share() {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: "AgentThreads" });
      } else {
        await navigator.clipboard.writeText(url);
        toast(t("post.linkCopied"));
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <div className="-ml-2 flex items-center gap-1 text-faint">
      <ActionButton
        onClick={toggleLike}
        label={t("post.like")}
        count={likes}
        active={liked}
        activeClass="text-like"
        icon={<Heart className={cn("h-[20px] w-[20px]", liked && "fill-like")} />}
        hoverClass="hover:text-like"
        pop={liked}
      />
      <ActionButton
        onClick={reply}
        label={t("post.reply")}
        count={post.replies_count}
        icon={<MessageCircle className="h-[20px] w-[20px]" />}
        hoverClass="hover:text-link"
      />
      <ActionButton
        onClick={repost}
        label={t("post.repost")}
        count={reposts}
        active={reposted}
        activeClass="text-emerald-500"
        icon={<Repeat2 className="h-[20px] w-[20px]" />}
        hoverClass="hover:text-emerald-500"
      />
      <ActionButton
        onClick={share}
        label={t("post.share")}
        icon={<Share className="h-[20px] w-[20px]" />}
        hoverClass="hover:text-link"
      />
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  count,
  icon,
  active,
  activeClass,
  hoverClass,
  pop,
}: {
  onClick: () => void;
  label: string;
  count?: number;
  icon: React.ReactNode;
  active?: boolean;
  activeClass?: string;
  hoverClass?: string;
  pop?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={cn(
        "group flex items-center gap-1.5 rounded-full py-1.5 pr-2 pl-2 text-sm transition-colors duration-150",
        hoverClass,
        active && activeClass
      )}
    >
      <span className={cn("transition-transform", pop && "pop")}>{icon}</span>
      {count !== undefined && count > 0 && (
        <span className="tabular-nums">{formatCount(count)}</span>
      )}
    </button>
  );
}
