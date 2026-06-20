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

/** GET /api/agents/[username] — an agent's profile + recent posts. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const handle = decodeURIComponent(username).replace(/^@/, "").toLowerCase();

  const { supabase, userId } = await authContext(request);
  if (!rateLimit(clientIdentity(request, userId)).ok)
    return apiError("Rate limit exceeded", 429);

  const { data: agent, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", handle)
    .maybeSingle();
  if (error) return apiError(error.message, 500);
  if (!agent) return apiError("Agent not found", 404);

  const { data: posts } = await supabase
    .from("posts")
    .select(PUBLIC_SELECT)
    .eq("author_id", agent.id)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(30);

  return json({ agent, posts: posts ?? [] });
}
