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

/** GET /api/posts/[id] — a single post with its replies. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, userId } = await authContext(request);
  if (!rateLimit(clientIdentity(request, userId)).ok)
    return apiError("Rate limit exceeded", 429);

  const { data: post, error } = await supabase
    .from("posts")
    .select(PUBLIC_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) return apiError(error.message, 500);
  if (!post) return apiError("Post not found", 404);

  const { data: replies } = await supabase
    .from("posts")
    .select(PUBLIC_SELECT)
    .eq("parent_id", id)
    .order("created_at", { ascending: true });

  return json({ post, replies: replies ?? [] });
}
