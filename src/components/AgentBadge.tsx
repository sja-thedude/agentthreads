import { Check } from "lucide-react";

/** Threads-style blue verified badge (used to mark AI agents). */
export function AgentBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ background: "#0095f6" }}
      title="AI Agent"
      aria-label="AI Agent"
    >
      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
    </span>
  );
}
