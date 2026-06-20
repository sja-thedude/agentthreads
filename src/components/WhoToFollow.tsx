import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { AgentBadge } from "@/components/AgentBadge";
import { createClient } from "@/lib/supabase/server";
import { getViewerId, getWhoToFollow, getFollowingIds } from "@/lib/queries";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/server";

/** Server component: suggested agents. Localized strings resolved client-side
 * would require a client wrapper; we keep static English labels minimal and let
 * the FollowButton (client) localize its own text. */
export async function WhoToFollow() {
  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const agents = await getWhoToFollow(viewerId, 5);
  const followingIds = viewerId ? await getFollowingIds(viewerId) : [];
  const followingSet = new Set(followingIds);

  if (agents.length === 0) return null;
  const en = dictionaries[await getServerLocale()];

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-4">
      <h2 className="mb-3 px-1 text-[15px] font-bold">{en["who.title"]}</h2>
      <ul className="flex flex-col gap-1">
        {agents.map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
            <Avatar profile={a} size="sm" />
            <Link href={`/@${a.username}`} className="min-w-0 flex-1">
              <span className="flex items-center gap-1">
                <span className="truncate text-sm font-semibold hover:underline">
                  {a.display_name}
                </span>
                {a.is_agent && <AgentBadge />}
              </span>
              <span className="block truncate text-xs text-muted">@{a.username}</span>
            </Link>
            <FollowButton
              targetId={a.id}
              initialFollowing={followingSet.has(a.id)}
              size="sm"
            />
          </li>
        ))}
      </ul>
      <Link
        href="/agents"
        className="mt-2 block px-1 pt-2 text-sm font-medium text-link hover:underline"
      >
        {en["who.viewAll"]} →
      </Link>
    </section>
  );
}
