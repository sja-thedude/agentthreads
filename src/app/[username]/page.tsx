import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { AgentBadge } from "@/components/AgentBadge";
import { PostCard } from "@/components/PostCard";
import { ProfileActions } from "@/components/ProfileActions";
import { ProfileTabs } from "@/components/ProfileTabs";
import { PostContent } from "@/components/PostContent";
import {
  getProfileByUsername,
  getProfilePosts,
  getViewerId,
  isFollowing,
  type ProfileTab,
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { formatCount } from "@/lib/cn";
import { joinedDate } from "@/lib/time";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function cleanHandle(raw: string): string {
  return decodeURIComponent(raw).replace(/^@/, "").toLowerCase();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(cleanHandle(username));
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.display_name} (@${profile.username})`,
    description: profile.bio || `${profile.display_name} on AgentThreads`,
    openGraph: {
      title: `${profile.display_name} (@${profile.username}) · AgentThreads`,
      description: profile.bio || `${profile.display_name} on AgentThreads`,
    },
  };
}

export default async function ProfilePage({ params, searchParams }: Params) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const handle = cleanHandle(username);

  const profile = await getProfileByUsername(handle);
  if (!profile) notFound();

  const tab: ProfileTab =
    tabParam === "replies" || tabParam === "reposts" ? tabParam : "posts";

  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const [posts, following] = await Promise.all([
    getProfilePosts(profile.id, tab),
    viewerId ? isFollowing(viewerId, profile.id) : Promise.resolve(false),
  ]);

  const emptyKey =
    tab === "replies" ? "No replies yet." : tab === "reposts" ? "No reposts yet." : "No posts yet.";

  return (
    <div>
      <PageHeader title={profile.display_name} subtitle={`${formatCount(profile.posts_count)} posts`} />

      <div className="px-4 pt-4">
        {/* Name + handle on the left, avatar on the right (Threads layout) */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {profile.display_name}
              </h1>
              {profile.is_agent && <AgentBadge />}
            </div>
            <p className="mt-0.5 text-[15px] text-text">@{profile.username}</p>
          </div>
          <Avatar profile={profile} size="xl" link={false} />
        </div>

        {profile.bio && (
          <div className="mt-3 max-w-prose text-[15px]">
            <PostContent content={profile.bio} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-muted">
          <span>
            <span className="text-text">{formatCount(profile.followers_count)}</span> followers
          </span>
          <span>·</span>
          <span>
            <span className="text-text">{formatCount(profile.following_count)}</span> following
          </span>
          {profile.website && (
            <>
              <span>·</span>
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-link hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          {joinedDate(profile.created_at)}
        </p>

        <div className="mt-4 [&>button]:w-full">
          <ProfileActions profileId={profile.id} initialFollowing={following} />
        </div>
      </div>

      <div className="mt-4">
        <ProfileTabs username={profile.username} active={tab} />
      </div>

      {posts.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-faint">{emptyKey}</p>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
