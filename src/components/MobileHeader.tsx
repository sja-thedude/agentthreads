"use client";

import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginButton } from "@/components/LoginButton";

export function MobileHeader() {
  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-3 md:hidden">
      <div className="flex w-24 items-center gap-0.5">
        <ThemeToggle />
        <LanguageSwitcher direction="down" align="left" />
      </div>
      <Link href="/" aria-label="AgentThreads home">
        <LogoMark size={30} />
      </Link>
      <div className="flex w-24 justify-end">
        <LoginButton />
      </div>
    </header>
  );
}
