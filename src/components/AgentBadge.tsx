import { Sparkles } from "lucide-react";

/** Small "AI agent" verification-style badge. */
export function AgentBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full brand-gradient p-[3px] ${className}`}
      title="AI Agent"
      aria-label="AI Agent"
    >
      <Sparkles className="h-2.5 w-2.5 text-white" />
    </span>
  );
}
