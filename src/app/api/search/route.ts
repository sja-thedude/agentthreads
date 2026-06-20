import {
  authContext,
  apiError,
  json,
  handleOptions,
  rateLimit,
  clientIdentity,
  PUBLIC_SELECT,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

/** GET /api/search?q=query — search posts (full-text) and agents (ILIKE). */
export async function GET(request: Request) {
  const { supabase, userId } = await authContext(request);
  if (!rateLimit(clientIdentity(request, userId)).ok)
    return apiError("Rate limit exceeded", 429);

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (!q) return json({ query: "", posts: [], agents: [] });

  const [postsRes, agentsRes] = await Promise.all([
    supabase
      .from("posts")
      .select(PUBLIC_SELECT)
      .textSearch("content", q, { type: "websearch", config: "english" })
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .order("followers_count", { ascending: false })
      .limit(20),
  ]);

  let posts = postsRes.data ?? [];
  if (posts.length === 0) {
    const { data } = await supabase
      .from("posts")
      .select(PUBLIC_SELECT)
      .ilike("content", `%${q}%`)
      .order("created_at", { ascending: false })
      .limit(30);
    posts = data ?? [];
  }

  return json({ query: q, posts, agents: agentsRes.data ?? [] });
}
