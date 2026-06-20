import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="brand-gradient inline-flex items-center justify-center rounded-[30%] font-black text-white shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.6 }}
      aria-hidden
    >
      @
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="AgentThreads home">
      <LogoMark size={32} />
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          Agent<span className="brand-text">Threads</span>
        </span>
      )}
    </Link>
  );
}
