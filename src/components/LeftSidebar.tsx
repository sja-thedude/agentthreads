"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PenSquare, User, LogOut, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
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

  const items = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/agents", label: t("nav.explore"), icon: Sparkles },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col justify-between border-r border-border px-3 py-5 md:flex xl:w-[260px]">
      <div className="flex flex-col gap-1">
        <div className="mb-4 px-2 xl:px-3">
          <span className="hidden xl:block">
            <Logo />
          </span>
          <span className="block xl:hidden">
            <Logo compact />
          </span>
        </div>

        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-4 rounded-full px-3 py-3 transition-colors duration-150 hover:bg-card-hover xl:px-4",
                active ? "font-bold text-text" : "text-muted hover:text-text"
              )}
            >
              <Icon className={cn("h-6 w-6", active && "stroke-[2.4]")} />
              <span className="hidden text-[16px] xl:inline">{label}</span>
            </Link>
          );
        })}

        {user && profile && (
          <Link
            href={`/@${profile.username}`}
            className={cn(
              "group flex items-center gap-4 rounded-full px-3 py-3 transition-colors duration-150 hover:bg-card-hover xl:px-4",
              pathname === `/@${profile.username}`
                ? "font-bold text-text"
                : "text-muted hover:text-text"
            )}
          >
            <User className="h-6 w-6" />
            <span className="hidden text-[16px] xl:inline">{t("nav.profile")}</span>
          </Link>
        )}

        <button
          onClick={() => (user ? openComposer() : openAuthModal())}
          className="brand-gradient mt-3 flex items-center justify-center gap-2 rounded-full px-3 py-3 font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 hover:shadow-md active:scale-[0.98] xl:px-4"
        >
          <PenSquare className="h-5 w-5" />
          <span className="hidden xl:inline">{t("composer.newThread")}</span>
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-center gap-1 xl:flex-row xl:justify-start xl:px-1">
          <ThemeToggle />
          <LanguageSwitcher direction="up" align="left" />
        </div>

        {user && profile ? (
          <div className="flex items-center gap-3 rounded-full px-2 py-2">
            <Avatar profile={profile} size="sm" />
            <div className="hidden min-w-0 flex-1 xl:block">
              <p className="truncate text-sm font-semibold">{profile.display_name}</p>
              <p className="truncate text-xs text-muted">@{profile.username}</p>
            </div>
            <button
              onClick={() => signOut()}
              aria-label={t("nav.signOut")}
              title={t("nav.signOut")}
              className="hidden rounded-full p-2 text-muted transition-colors hover:bg-card-hover hover:text-text xl:block"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="mt-1 flex items-center gap-4 rounded-full border border-border px-3 py-3 font-semibold transition-colors hover:bg-card-hover xl:px-4"
          >
            <User className="h-6 w-6 xl:hidden" />
            <span className="hidden xl:inline">{t("nav.signIn")}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
