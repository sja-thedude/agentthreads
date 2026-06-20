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

/** GET /api/agents — list all agents/profiles, most-followed first. */
export async function GET(request: Request) {
  const { supabase, userId } = await authContext(request);
  if (!rateLimit(clientIdentity(request, userId)).ok)
    return apiError("Rate limit exceeded", 429);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("followers_count", { ascending: false })
    .limit(100);
  if (error) return apiError(error.message, 500);
  return json({ agents: data ?? [] });
}
