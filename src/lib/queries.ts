import { createClient } from "@/lib/supabase/server";
import type { Post, PostWithAuthor, Profile } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PAGE_SIZE = 15;

const POST_SELECT = "*, author:profiles!posts_author_id_fkey(*)";

/**
 * Attaches the original post (with author) for any reposts in the list.
 * Done as a separate query because PostgREST can't disambiguate the two
 * self-referencing FKs on `posts` in a single embed.
 */
async function attachReposts(
  supabase: Client,
  posts: PostWithAuthor[]
): Promise<PostWithAuthor[]> {
  const originalIds = posts
    .map((p) => p.repost_of_id)
    .filter((id): id is string => !!id);
  if (originalIds.length === 0) return posts;

  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("id", originalIds);
  const byId = new Map(
    (data ?? []).map((o) => [(o as PostWithAuthor).id, o as PostWithAuthor])
  );
  return posts.map((p) =>
    p.repost_of_id ? { ...p, repost_of: byId.get(p.repost_of_id) ?? null } : p
  );
}

type Client = SupabaseClient;

/** Returns the signed-in viewer's profile id, or null. */
export async function getViewerId(supabase: Client): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Marks which of the given posts the viewer has liked. */
async function attachLikes(
  supabase: Client,
  posts: PostWithAuthor[],
  viewerId: string | null
): Promise<PostWithAuthor[]> {
  if (!viewerId || posts.length === 0) return posts;
  const ids = posts.map((p) => p.id);
  const { data } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", viewerId)
    .in("post_id", ids);
  const liked = new Set((data ?? []).map((l) => l.post_id));
  return posts.map((p) => ({ ...p, liked_by_me: liked.has(p.id) }));
}

/** Attaches viewer like-state and repost originals to a list of posts. */
async function enrich(
  supabase: Client,
  posts: PostWithAuthor[],
  viewerId: string | null
): Promise<PostWithAuthor[]> {
  return attachReposts(supabase, await attachLikes(supabase, posts, viewerId));
}

export type FeedScope = "for-you" | "following";

/** Top-level posts (no replies) for the main timeline, newest first. */
export async function getFeed(opts: {
  scope?: FeedScope;
  cursor?: string | null;
  limit?: number;
  viewerId?: string | null;
  followingIds?: string[];
}): Promise<{ posts: PostWithAuthor[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const limit = opts.limit ?? PAGE_SIZE;
  const viewerId = opts.viewerId ?? (await getViewerId(supabase));

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (opts.cursor) query = query.lt("created_at", opts.cursor);

  if (opts.scope === "following") {
    const ids = opts.followingIds ?? (viewerId ? await getFollowingIds(viewerId) : []);
    if (ids.length === 0) return { posts: [], nextCursor: null };
    query = query.in("author_id", ids);
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as unknown as PostWithAuthor[];
  let nextCursor: string | null = null;
  if (rows.length > limit) {
    nextCursor = rows[limit - 1].created_at;
    rows = rows.slice(0, limit);
  }

  rows = await enrich(supabase, rows, viewerId);
  return { posts: rows, nextCursor };
}

export async function getFollowingIds(viewerId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId);
  return (data ?? []).map((f) => f.following_id);
}

/** A single post with its author and (if it's a reply) its parent. */
export async function getPost(id: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  let post = data as unknown as PostWithAuthor;
  if (post.parent_id) {
    const { data: parent } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("id", post.parent_id)
      .maybeSingle();
    post.parent = (parent as unknown as PostWithAuthor) ?? null;
  }
  const [enriched] = await enrich(supabase, [post], viewerId);
  return enriched;
}

/** Direct replies to a post, oldest first (reads as a conversation). */
export async function getReplies(postId: string): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("parent_id", postId)
    .order("created_at", { ascending: true });
  return enrich(supabase, (data ?? []) as unknown as PostWithAuthor[], viewerId);
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return (data as Profile) ?? null;
}

export type ProfileTab = "posts" | "replies" | "likes";

export async function getProfilePosts(
  authorId: string,
  tab: ProfileTab
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);

  if (tab === "likes") {
    const { data: liked } = await supabase
      .from("likes")
      .select("post_id, created_at")
      .eq("user_id", authorId)
      .order("created_at", { ascending: false })
      .limit(50);
    const ids = (liked ?? []).map((l) => l.post_id);
    if (ids.length === 0) return [];
    const { data } = await supabase.from("posts").select(POST_SELECT).in("id", ids);
    const byId = new Map((data ?? []).map((p) => [(p as Post).id, p]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter(Boolean) as unknown as PostWithAuthor[];
    return enrich(supabase, ordered, viewerId);
  }

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(50);

  query = tab === "replies" ? query.not("parent_id", "is", null) : query.is("parent_id", null);

  const { data } = await query;
  return enrich(supabase, (data ?? []) as unknown as PostWithAuthor[], viewerId);
}

/** Whether the viewer follows the given profile. */
export async function isFollowing(viewerId: string, targetId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", viewerId)
    .eq("following_id", targetId)
    .maybeSingle();
  return !!data;
}

export async function getAgents(limit = 50): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("followers_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as Profile[];
}

/** Suggested agents to follow, excluding those the viewer already follows. */
export async function getWhoToFollow(viewerId: string | null, limit = 5): Promise<Profile[]> {
  const supabase = await createClient();
  let exclude: string[] = [];
  if (viewerId) {
    exclude = [...(await getFollowingIds(viewerId)), viewerId];
  }
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("is_agent", true)
    .order("followers_count", { ascending: false })
    .limit(limit + exclude.length);
  const { data } = await query;
  return ((data ?? []) as Profile[]).filter((p) => !exclude.includes(p.id)).slice(0, limit);
}

export async function searchAll(q: string): Promise<{
  posts: PostWithAuthor[];
  agents: Profile[];
}> {
  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const term = q.trim();
  if (!term) return { posts: [], agents: [] };

  const [{ data: posts }, { data: agents }] = await Promise.all([
    supabase
      .from("posts")
      .select(POST_SELECT)
      .textSearch("content", term, { type: "websearch", config: "english" })
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
      .order("followers_count", { ascending: false })
      .limit(20),
  ]);

  // Fallback to ILIKE if full-text returns nothing (e.g. partial words).
  let postRows = (posts ?? []) as unknown as PostWithAuthor[];
  if (postRows.length === 0) {
    const { data: fallback } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .ilike("content", `%${term}%`)
      .order("created_at", { ascending: false })
      .limit(30);
    postRows = (fallback ?? []) as unknown as PostWithAuthor[];
  }

  return {
    posts: await enrich(supabase, postRows, viewerId),
    agents: (agents ?? []) as Profile[],
  };
}
