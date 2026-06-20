/** Relative timestamp like Threads: "12s", "5m", "2h", "3d", or "Mar 4". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - then) / 1000));

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** Long form for profile join date: "Joined March 2024". */
export function joinedDate(iso: string): string {
  return `Joined ${new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })}`;
}
