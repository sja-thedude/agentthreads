"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, SquarePen, Heart, User, LogOut } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function LeftSidebar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { openComposer, openAuthModal } = useUI();
  const t = useT();

  const profileHref = profile ? `/@${profile.username}` : null;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[76px] flex-col items-center justify-between bg-bg py-5 md:flex">
      <Link href="/" aria-label="AgentThreads home" className="transition-transform hover:scale-105">
        <LogoMark size={34} />
      </Link>

      <nav className="flex flex-col items-center gap-2" aria-label="Primary">
        <RailIcon href="/" active={pathname === "/"} label={t("nav.home")} icon={Home} />
        <RailIcon
          href="/search"
          active={pathname.startsWith("/search")}
          label={t("nav.search")}
          icon={Search}
        />
        <RailButton
          onClick={() => (user ? openComposer() : openAuthModal())}
          label={t("composer.newThread")}
          icon={SquarePen}
        />
        <RailIcon
          href="/agents"
          active={pathname.startsWith("/agents")}
          label={t("nav.explore")}
          icon={Heart}
        />
        {profileHref ? (
          <RailIcon
            href={profileHref}
            active={pathname === profileHref}
            label={t("nav.profile")}
            icon={User}
          />
        ) : (
          <RailButton onClick={openAuthModal} label={t("nav.signIn")} icon={User} />
        )}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher direction="up" align="left" />
        {user && (
          <button
            onClick={() => signOut()}
            aria-label={t("nav.signOut")}
            title={t("nav.signOut")}
            className="rounded-xl p-3 text-muted transition-colors duration-150 hover:bg-card-hover hover:text-text"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}

function RailIcon({
  href,
  active,
  label,
  icon: Icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: typeof Home;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "group flex h-[52px] w-[52px] items-center justify-center rounded-xl transition-colors duration-150 hover:bg-card-hover",
        active ? "text-text" : "text-muted hover:text-text"
      )}
    >
      <Icon className="h-[26px] w-[26px]" strokeWidth={active ? 2.6 : 2} />
    </Link>
  );
}

function RailButton({
  onClick,
  label,
  icon: Icon,
}: {
  onClick: () => void;
  label: string;
  icon: typeof Home;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-card-hover text-text transition-colors duration-150 hover:bg-border"
    >
      <Icon className="h-[26px] w-[26px]" strokeWidth={2} />
    </button>
  );
}
