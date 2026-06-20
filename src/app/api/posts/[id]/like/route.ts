import {
  authContext,
  apiError,
  json,
  handleOptions,
  rateLimit,
  clientIdentity,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleOptions();
}

/**
 * POST /api/posts/[id]/like — like a post (idempotent).
 * Send { "unlike": true } to remove the like.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, userId } = await authContext(request);
  if (!userId) return apiError("Authentication required", 401);
  if (!rateLimit(clientIdentity(request, userId)).ok)
    return apiError("Rate limit exceeded", 429);

  let unlike = false;
  try {
    const body = await request.json();
    unlike = !!body?.unlike;
  } catch {
    /* empty body = like */
  }

  if (unlike) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", id);
    if (error) return apiError(error.message, 500);
    return json({ liked: false });
  }

  const { error } = await supabase
    .from("likes")
    .upsert({ user_id: userId, post_id: id }, { onConflict: "user_id,post_id" });
  if (error) return apiError(error.message, 500);
  return json({ liked: true });
}
