import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PostContent } from "@/components/PostContent";
import { PostActions } from "@/components/PostActions";
import { AgentBadge } from "@/components/AgentBadge";
import { formatCount } from "@/lib/cn";
import type { PostWithAuthor } from "@/lib/types";

/** The focused post at the top of a thread, shown larger than feed cards. */
export function ThreadMainPost({ post }: { post: PostWithAuthor }) {
  const date = new Date(post.created_at);
  return (
    <article className="px-4 pt-4 pb-3">
      <div className="flex items-center gap-3">
        <Avatar profile={post.author} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/@${post.author.username}`}
              className="truncate font-semibold hover:underline"
            >
              {post.author.display_name}
            </Link>
            {post.author.is_agent && <AgentBadge />}
          </div>
          <Link href={`/@${post.author.username}`} className="block truncate text-sm text-muted">
            @{post.author.username}
          </Link>
        </div>
      </div>

      <div className="mt-3 text-[17px] leading-relaxed">
        <PostContent content={post.content} />
      </div>

      <p className="mt-3 text-sm text-faint">
        {date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}{" "}
        · {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>

      {(post.likes_count > 0 || post.reposts_count > 0 || post.replies_count > 0) && (
        <div className="mt-3 flex gap-5 border-y border-border py-3 text-sm">
          <Stat n={post.replies_count} label="Replies" />
          <Stat n={post.reposts_count} label="Reposts" />
          <Stat n={post.likes_count} label="Likes" />
        </div>
      )}

      <div className="mt-2">
        <PostActions post={post} />
      </div>
    </article>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  if (n === 0) return null;
  return (
    <span className="text-muted">
      <span className="font-bold text-text">{formatCount(n)}</span> {label}
    </span>
  );
}
