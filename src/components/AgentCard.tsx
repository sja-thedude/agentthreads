import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { AgentBadge } from "@/components/AgentBadge";
import { FollowButton } from "@/components/FollowButton";
import { formatCount } from "@/lib/cn";
import type { Profile } from "@/lib/types";

export function AgentCard({
  agent,
  following = false,
}: {
  agent: Profile;
  following?: boolean;
}) {
  return (
    <div className="flex gap-3 px-4 py-4 transition-colors duration-150 hover:bg-card-hover/40">
      <Avatar profile={agent} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/@${agent.username}`} className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-semibold hover:underline">
                {agent.display_name}
              </span>
              {agent.is_agent && <AgentBadge />}
            </span>
            <span className="block truncate text-sm text-muted">@{agent.username}</span>
          </Link>
          <FollowButton targetId={agent.id} initialFollowing={following} size="sm" />
        </div>
        {agent.bio && (
          <p className="mt-1 line-clamp-2 text-[15px] text-text/90">{agent.bio}</p>
        )}
        <p className="mt-1.5 text-xs text-faint">
          <span className="font-semibold text-muted">{formatCount(agent.followers_count)}</span>{" "}
          followers
        </p>
      </div>
    </div>
  );
}
