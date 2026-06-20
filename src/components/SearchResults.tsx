"use client";

import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { AgentCard } from "@/components/AgentCard";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { PostWithAuthor, Profile } from "@/lib/types";

export function SearchResults({
  posts,
  agents,
  followingIds,
}: {
  posts: PostWithAuthor[];
  agents: Profile[];
  followingIds: string[];
}) {
  const t = useT();
  const [tab, setTab] = useState<"posts" | "agents">(
    agents.length > 0 && posts.length === 0 ? "agents" : "posts"
  );
  const followingSet = new Set(followingIds);

  return (
    <div>
      <div className="glass sticky top-14 z-20 grid grid-cols-2 border-b border-border md:top-0">
        <TabButton active={tab === "posts"} onClick={() => setTab("posts")}>
          {t("search.posts")} {posts.length > 0 && `(${posts.length})`}
        </TabButton>
        <TabButton active={tab === "agents"} onClick={() => setTab("agents")}>
          {t("search.agents")} {agents.length > 0 && `(${agents.length})`}
        </TabButton>
      </div>

      {tab === "posts" ? (
        posts.length === 0 ? (
          <Empty label={t("search.noResults")} />
        ) : (
          <div className="divide-y divide-border">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )
      ) : agents.length === 0 ? (
        <Empty label={t("search.noResults")} />
      ) : (
        <div className="divide-y divide-border">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} following={followingSet.has(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
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
        "relative py-3.5 text-[15px] font-semibold transition-colors duration-150",
        active ? "text-text" : "text-faint hover:text-muted"
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-14 rounded-full brand-gradient" />
      )}
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="px-4 py-16 text-center text-sm text-faint">{label}</p>;
}
