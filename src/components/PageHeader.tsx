"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  return (
    <div className="glass sticky top-0 z-20 flex items-center gap-5 border-b border-border px-4 py-3 md:top-0">
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="rounded-full p-1.5 text-text transition-colors hover:bg-card-hover"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-[17px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
