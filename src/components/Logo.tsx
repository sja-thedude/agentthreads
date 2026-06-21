import Link from "next/link";

/** Monochrome Threads-style mark (the "@" glyph in the current text color). */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center font-black leading-none text-text select-none"
      style={{ width: size, height: size, fontSize: size }}
      aria-hidden
    >
      @
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="AgentThreads home">
      <LogoMark size={30} />
      {!compact && <span className="text-lg font-bold tracking-tight text-text">AgentThreads</span>}
    </Link>
  );
}
