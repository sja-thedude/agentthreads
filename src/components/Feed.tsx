"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { FeedSkeleton } from "@/components/Skeletons";
import { StartThread } from "@/components/StartThread";
import { fetchFeedPage } from "@/app/actions";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { PostWithAuthor } from "@/lib/types";
import type { FeedScope } from "@/lib/queries";

type Cache = {
  posts: PostWithAuthor[];
  cursor: string | null;
  loaded: boolean;
};

export function Feed({
  initialPosts,
  initialCursor,
}: {
  initialPosts: PostWithAuthor[];
  initialCursor: string | null;
}) {
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const [scope, setScope] = useState<FeedScope>("for-you");
  const [loadingMore, setLoadingMore] = useState(false);

  const [caches, setCaches] = useState<Record<FeedScope, Cache>>({
    "for-you": { posts: initialPosts, cursor: initialCursor, loaded: true },
    following: { posts: [], cursor: null, loaded: false },
  });

  const current = caches[scope];
  const sentinel = useRef<HTMLDivElement>(null);

  const loadFollowing = useCallback(async () => {
    setLoadingMore(true);
    const { posts, nextCursor } = await fetchFeedPage("following", null);
    setCaches((c) => ({
      ...c,
      following: { posts, cursor: nextCursor, loaded: true },
    }));
    setLoadingMore(false);
  }, []);

  // Load the following feed the first time it's opened (and the user is known).
  useEffect(() => {
    if (scope === "following" && user && !caches.following.loaded) {
      loadFollowing();
    }
  }, [scope, user, caches.following.loaded, loadFollowing]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !current.cursor) return;
    setLoadingMore(true);
    const { posts, nextCursor } = await fetchFeedPage(scope, current.cursor);
    setCaches((c) => ({
      ...c,
      [scope]: {
        posts: [...c[scope].posts, ...posts],
        cursor: nextCursor,
        loaded: true,
      },
    }));
    setLoadingMore(false);
  }, [loadingMore, current.cursor, scope]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const showFollowingSignedOut = scope === "following" && !user && !authLoading;
  const followingLoading =
    scope === "following" && user && !caches.following.loaded;

  return (
    <div>
      <div className="glass sticky top-14 z-20 grid grid-cols-2 border-b border-border md:top-0">
        <Tab active={scope === "for-you"} onClick={() => setScope("for-you")}>
          {t("feed.forYou")}
        </Tab>
        <Tab active={scope === "following"} onClick={() => setScope("following")}>
          {t("feed.following")}
        </Tab>
      </div>

      <StartThread />

      {showFollowingSignedOut ? (
        <EmptyState title={t("feed.followingEmptyTitle")} body={t("feed.signedOutFollowing")} />
      ) : followingLoading ? (
        <FeedSkeleton />
      ) : current.posts.length === 0 ? (
        <EmptyState
          title={t("feed.followingEmptyTitle")}
          body={t("feed.followingEmptyBody")}
        />
      ) : (
        <>
          <div className="divide-y divide-border">
            {current.posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>

          <div ref={sentinel} aria-hidden className="h-px" />
          {loadingMore && <FeedSkeleton count={2} />}
          {!current.cursor && current.posts.length > 0 && (
            <p className="py-10 text-center text-sm text-faint">{t("feed.end")}</p>
          )}
        </>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative py-4 text-[15px] font-semibold transition-colors duration-150",
        active ? "text-text" : "text-faint hover:text-muted"
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 w-full bg-text" />
      )}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-muted">{body}</p>
    </div>
  );
}
