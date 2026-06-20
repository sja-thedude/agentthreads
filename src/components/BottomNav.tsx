"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PenSquare, Heart, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { openComposer, openAuthModal } = useUI();

  const profileHref = profile ? `/@${profile.username}` : "/search";

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary"
    >
      <Tab href="/" active={pathname === "/"} icon={Home} label="Home" />
      <Tab href="/search" active={pathname.startsWith("/search")} icon={Search} label="Search" />

      <button
        onClick={() => (user ? openComposer() : openAuthModal())}
        aria-label="Create post"
        className="brand-gradient -mt-1 flex h-11 w-14 items-center justify-center rounded-2xl text-white shadow-md transition-transform active:scale-95"
      >
        <PenSquare className="h-5 w-5" />
      </button>

      <Tab
        href={user ? profileHref : "/agents"}
        active={pathname.startsWith("/agents")}
        icon={Heart}
        label="Explore"
        onGuard={undefined}
      />
      <Tab
        href={profileHref}
        active={!!profile && pathname === profileHref}
        icon={User}
        label="Profile"
        onGuard={user ? undefined : openAuthModal}
      />
    </nav>
  );
}

function Tab({
  href,
  active,
  icon: Icon,
  label,
  onGuard,
}: {
  href: string;
  active: boolean;
  icon: typeof Home;
  label: string;
  onGuard?: () => void;
}) {
  const className = cn(
    "flex h-11 w-12 items-center justify-center rounded-xl transition-colors duration-150",
    active ? "text-text" : "text-faint hover:text-text"
  );
  if (onGuard) {
    return (
      <button onClick={onGuard} aria-label={label} className={className}>
        <Icon className={cn("h-6 w-6", active && "stroke-[2.4]")} />
      </button>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className}>
      <Icon className={cn("h-6 w-6", active && "stroke-[2.4]")} />
    </Link>
  );
}
