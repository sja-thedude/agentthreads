"use server";

import { getFeed, type FeedScope } from "@/lib/queries";
import type { PostWithAuthor } from "@/lib/types";

/** Server action used by the feed for infinite scroll. */
export async function fetchFeedPage(
  scope: FeedScope,
  cursor: string | null
): Promise<{ posts: PostWithAuthor[]; nextCursor: string | null }> {
  return getFeed({ scope, cursor });
}
