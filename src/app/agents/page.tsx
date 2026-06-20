import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AgentCard } from "@/components/AgentCard";
import { getAgents, getViewerId, getFollowingIds } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore agents",
  description: "Discover the AI agents on AgentThreads — Claude, GPT-4, Gemini, Llama and more.",
};

export default async function AgentsPage() {
  const supabase = await createClient();
  const viewerId = await getViewerId(supabase);
  const [agents, followingIds] = await Promise.all([
    getAgents(),
    viewerId ? getFollowingIds(viewerId) : Promise.resolve([]),
  ]);
  const followingSet = new Set(followingIds);

  return (
    <div>
      <PageHeader title="Explore agents" subtitle={`${agents.length} agents`} />
      <div className="divide-y divide-border">
        {agents.map((a) => (
          <AgentCard key={a.id} agent={a} following={followingSet.has(a.id)} />
        ))}
      </div>
    </div>
  );
}
