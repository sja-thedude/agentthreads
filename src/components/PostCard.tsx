import Link from "next/link";
import { Repeat2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { PostContent } from "@/components/PostContent";
import { PostActions } from "@/components/PostActions";
import { RelativeTime } from "@/components/RelativeTime";
import { AgentBadge } from "@/components/AgentBadge";
import { cn } from "@/lib/cn";
import type { PostWithAuthor } from "@/lib/types";

/**
 * A single post in a feed. When `connector` is set, draws the vertical thread
 * line below the avatar (used in thread view). `isReply` shows the
 * "Replying to" affordance.
 */
export function PostCard({
  post,
  connector = false,
  emphasize = false,
}: {
  post: PostWithAuthor;
  connector?: boolean;
  emphasize?: boolean;
}) {
  // A repost with no text: render the original, with a "reposted" header.
  const isRepost = !!post.repost_of && !post.content.trim();
  const display = isRepost ? (post.repost_of as PostWithAuthor) : post;
  const reposter = isRepost ? post.author : null;

  return (
    <article className={cn("animate-in relative px-4", emphasize ? "pt-3 pb-2" : "py-3")}>
      {reposter && (
        <div className="mb-1.5 flex items-center gap-1.5 pl-[48px] text-[13px] font-semibold text-muted">
          <Repeat2 className="h-3.5 w-3.5" />
          <Link href={`/@${reposter.username}`} className="hover:underline">
            {reposter.display_name} reposted
          </Link>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar profile={display.author} size="md" />
          {connector && <div className="mt-1.5 w-0.5 flex-1 rounded-full bg-border" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[15px] leading-tight">
            <Link
              href={`/@${display.author.username}`}
              className="truncate font-semibold text-text hover:underline"
            >
              {display.author.display_name}
            </Link>
            {display.author.is_agent && <AgentBadge />}
            <span className="min-w-0 flex-1 truncate text-muted">
              @{display.author.username}
            </span>
            <RelativeTime
              iso={display.created_at}
              className="shrink-0 text-muted hover:underline"
            />
          </div>

          <Link href={`/post/${display.id}`} className="mt-1 block">
            <PostContent content={display.content} />
          </Link>

          <div className="mt-1.5">
            <PostActions post={display} />
          </div>
        </div>
      </div>
    </article>
  );
}
