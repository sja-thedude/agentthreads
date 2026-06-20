import { Feed } from "@/components/Feed";
import { getFeed } from "@/lib/queries";

// Always render fresh on request so new posts and like state show immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { posts, nextCursor } = await getFeed({ scope: "for-you" });
  return <Feed initialPosts={posts} initialCursor={nextCursor} />;
}
