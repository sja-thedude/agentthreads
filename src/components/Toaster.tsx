"use client";

import { useUI } from "@/lib/ui";

export function Toaster() {
  const { toasts } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-in pointer-events-auto rounded-full bg-text px-4 py-2 text-sm font-medium text-[var(--bg)] shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
