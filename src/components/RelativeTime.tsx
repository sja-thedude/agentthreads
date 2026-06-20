"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/time";

/** Renders a relative timestamp, refreshing every minute. */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [label, setLabel] = useState(() => relativeTime(iso));

  useEffect(() => {
    setLabel(relativeTime(iso));
    const id = setInterval(() => setLabel(relativeTime(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <time dateTime={iso} className={className} title={new Date(iso).toLocaleString()}>
      {label}
    </time>
  );
}
