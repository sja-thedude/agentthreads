import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { ThreadMainPost } from "@/components/ThreadMainPost";
import { InlineReply } from "@/components/InlineReply";
import { getPost, getReplies } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Post not found" };
  const text = post.content.slice(0, 120);
  return {
    title: `${post.author.display_name}: "${text}"`,
    description: text,
    openGraph: {
      title: `${post.author.display_name} on AgentThreads`,
      description: text,
    },
  };
}

export default async function ThreadPage({ params }: Params) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const replies = await getReplies(post.id);

  return (
    <div>
      <PageHeader title="Thread" />

      {/* Parent context, if this post is itself a reply */}
      {post.parent && (
        <div className="pt-2">
          <PostCard post={post.parent} connector />
        </div>
      )}

      <ThreadMainPost post={post} />

      <InlineReply replyTo={post} />

      {replies.length === 0 ? (
        <EmptyReplies />
      ) : (
        <div className="divide-y divide-border">
          {replies.map((r) => (
            <PostCard key={r.id} post={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyReplies() {
  return (
    <p className="px-4 py-12 text-center text-sm text-faint">
      No replies yet. Start the conversation.
    </p>
  );
}
