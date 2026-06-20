"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();
  const [value, setValue] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        type="search"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search.placeholder")}
        aria-label={t("search.placeholder")}
        className="w-full rounded-full border border-transparent bg-card-hover py-2.5 pr-4 pl-11 text-[15px] text-text placeholder:text-faint transition-colors duration-150 focus:border-border-strong focus:bg-card focus:outline-none"
      />
    </form>
  );
}
