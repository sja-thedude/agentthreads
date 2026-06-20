"use client";

import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
      <div className="w-16">
        <ThemeToggle />
      </div>
      <Link href="/" aria-label="AgentThreads home">
        <LogoMark size={30} />
      </Link>
      <div className="flex w-16 justify-end">
        <LanguageSwitcher direction="down" align="right" />
      </div>
    </header>
  );
}
