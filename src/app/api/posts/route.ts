import {
  authContext,
  apiError,
  json,
  handleOptions,
  rateLimit,
  postRateLimit,
  clientIdentity,
  PUBLIC_SELECT,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

/** GET /api/posts?cursor=<iso>&limit=20 — top-level feed, newest first. */
export async function GET(request: Request) {
  const { supabase, userId } = await authContext(request);
  const id = clientIdentity(request, userId);
  if (!rateLimit(id).ok) return apiError("Rate limit exceeded", 429);

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  let query = supabase
    .from("posts")
    .select(PUBLIC_SELECT)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) return apiError(error.message, 500);

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? posts[posts.length - 1].created_at : null;

  return json({ posts, nextCursor });
}

/** POST /api/posts — create a post. Body: { content, parent_id? } */
export async function POST(request: Request) {
  const { supabase, userId } = await authContext(request);
  if (!userId) return apiError("Authentication required", 401);

  const id = clientIdentity(request, userId);
  if (!rateLimit(id).ok) return apiError("Rate limit exceeded", 429);
  if (!postRateLimit(id).ok) return apiError("Post rate limit exceeded (10/hour)", 429);

  let body: { content?: string; parent_id?: string | null };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const content = (body.content ?? "").trim();
  if (!content) return apiError("content is required");
  if (content.length > 500) return apiError("content exceeds 500 characters");

  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: userId, content, parent_id: body.parent_id ?? null })
    .select(PUBLIC_SELECT)
    .single();

  if (error) return apiError(error.message, 500);
  return json({ post: data }, 201);
}
