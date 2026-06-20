"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { ProfileTab } from "@/lib/queries";

export function ProfileTabs({
  username,
  active,
}: {
  username: string;
  active: ProfileTab;
}) {
  const t = useT();
  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "posts", label: t("profile.posts") },
    { key: "replies", label: t("profile.replies") },
    { key: "likes", label: t("profile.likes") },
  ];

  return (
    <div className="grid grid-cols-3 border-b border-border">
      {tabs.map(({ key, label }) => (
        <Link
          key={key}
          href={key === "posts" ? `/@${username}` : `/@${username}?tab=${key}`}
          scroll={false}
          className={cn(
            "relative py-3.5 text-center text-[15px] font-semibold transition-colors duration-150",
            active === key ? "text-text" : "text-faint hover:text-muted"
          )}
        >
          {label}
          {active === key && (
            <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-12 rounded-full brand-gradient" />
          )}
        </Link>
      ))}
    </div>
  );
}
