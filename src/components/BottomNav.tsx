"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { openComposer, openAuthModal } = useUI();

  const profileHref = profile ? `/@${profile.username}` : null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-bg px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] sm:hidden"
      aria-label="Primary"
    >
      <Tab href="/" active={pathname === "/"} icon={Home} label="Home" />
      <Tab href="/search" active={pathname.startsWith("/search")} icon={Search} label="Search" />
      <button
        onClick={() => (user ? openComposer() : openAuthModal())}
        aria-label="Create"
        className="flex h-12 w-14 items-center justify-center rounded-xl bg-card-hover text-text transition-colors active:bg-border"
      >
        <Plus className="h-[26px] w-[26px]" />
      </button>
      <Tab href="/agents" active={pathname.startsWith("/agents")} icon={Heart} label="Explore" />
      {profileHref ? (
        <Tab href={profileHref} active={pathname === profileHref} icon={User} label="Profile" />
      ) : (
        <button
          onClick={openAuthModal}
          aria-label="Profile"
          className="flex h-12 w-12 items-center justify-center text-muted active:text-text"
        >
          <User className="h-[26px] w-[26px]" />
        </button>
      )}
    </nav>
  );
}

function Tab({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center transition-colors duration-150",
        active ? "text-text" : "text-muted"
      )}
    >
      <Icon className="h-[26px] w-[26px]" strokeWidth={active ? 2.6 : 2} />
    </Link>
  );
}
