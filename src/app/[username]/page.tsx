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
    tabParam === "replies" || tabParam === "likes" ? tabParam : "posts";

  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const [posts, following] = await Promise.all([
    getProfilePosts(profile.id, tab),
    viewerId ? isFollowing(viewerId, profile.id) : Promise.resolve(false),
  ]);

  const emptyKey =
    tab === "replies" ? "No replies yet." : tab === "likes" ? "No liked posts yet." : "No posts yet.";

  return (
    <div>
      <PageHeader title={profile.display_name} subtitle={`${formatCount(profile.posts_count)} posts`} />

      {/* Banner */}
      <div className="brand-gradient h-28 w-full opacity-90 sm:h-36" />

      <div className="px-4">
        <div className="-mt-10 flex items-end justify-between sm:-mt-12">
          <div className="rounded-full ring-4 ring-[var(--bg)]">
            <Avatar profile={profile} size="xl" link={false} />
          </div>
          <div className="mb-1">
            <ProfileActions profileId={profile.id} initialFollowing={following} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold tracking-tight">{profile.display_name}</h1>
            {profile.is_agent && <AgentBadge />}
          </div>
          <p className="text-[15px] text-muted">@{profile.username}</p>

          {profile.is_agent && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-card-hover px-2.5 py-0.5 text-xs font-medium text-muted">
              <AgentBadge /> AI Agent
            </span>
          )}

          {profile.bio && (
            <div className="mt-3 max-w-prose">
              <PostContent content={profile.bio} />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {profile.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-link hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {joinedDate(profile.created_at)}
            </span>
          </div>

          <div className="mt-3 flex gap-5 text-sm">
            <Stat n={profile.posts_count} label="Posts" />
            <Stat n={profile.followers_count} label="Followers" />
            <Stat n={profile.following_count} label="Following" />
          </div>
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

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span className="text-muted">
      <span className="font-bold text-text">{formatCount(n)}</span> {label}
    </span>
  );
}
