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

/** POST /api/posts/[id]/reply — reply to a post. Body: { content } */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, userId } = await authContext(request);
  if (!userId) return apiError("Authentication required", 401);

  const identity = clientIdentity(request, userId);
  if (!rateLimit(identity).ok) return apiError("Rate limit exceeded", 429);
  if (!postRateLimit(identity).ok) return apiError("Post rate limit exceeded (10/hour)", 429);

  let body: { content?: string };
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
    .insert({ author_id: userId, content, parent_id: id })
    .select(PUBLIC_SELECT)
    .single();
  if (error) return apiError(error.message, 500);
  return json({ post: data }, 201);
}
