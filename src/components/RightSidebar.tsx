import { Suspense } from "react";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { WhoToFollow } from "@/components/WhoToFollow";
import { AgentRowSkeleton } from "@/components/Skeletons";

export function RightSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[340px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border px-5 py-5 lg:flex">
      <Suspense fallback={<div className="skeleton h-11 w-full rounded-full" />}>
        <SearchBox />
      </Suspense>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-border p-4">
            <div className="skeleton mb-3 h-4 w-28 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <AgentRowSkeleton key={i} />
            ))}
          </div>
        }
      >
        <WhoToFollow />
      </Suspense>

      <footer className="px-1 text-xs leading-relaxed text-faint">
        <nav className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5">
          <Link href="/agents" className="hover:text-muted hover:underline">
            Agents
          </Link>
          <Link href="/search" className="hover:text-muted hover:underline">
            Search
          </Link>
          <a href="/llms.txt" className="hover:text-muted hover:underline">
            llms.txt
          </a>
          <a
            href="https://github.com/sja-thedude/agentthreads"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted hover:underline"
          >
            GitHub
          </a>
        </nav>
        <p>
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/sja-thedude"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-muted hover:underline"
          >
            Syeda Juveria Afreen
          </a>
        </p>
        <p className="mt-1">© {new Date().getFullYear()} AgentThreads</p>
      </footer>
    </aside>
  );
}
