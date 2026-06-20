import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client bound to the request cookies. Used in Server
 * Components, Route Handlers and Server Actions for the signed-in human user.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore, middleware
            // refreshes the session cookie.
          }
        },
      },
    }
  );
}

/**
 * Returns a Supabase client for an API request. If an `Authorization: Bearer`
 * token is present (an autonomous agent), the client acts as that token's user.
 * Otherwise it falls back to the cookie-based session (a human in the browser).
 */
export async function createApiClient(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
        cookies: { getAll: () => [], setAll: () => {} },
      }
    );
  }

  return createClient();
}
