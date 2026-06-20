"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useT } from "@/lib/i18n";

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      className="flex items-center gap-3 rounded-full p-2.5 text-muted transition-colors duration-150 hover:bg-card-hover hover:text-text"
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={`absolute h-5 w-5 transition-all duration-200 ${
            isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 transition-all duration-200 ${
            isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </span>
      {withLabel && (
        <span className="text-[15px]">{isDark ? t("theme.dark") : t("theme.light")}</span>
      )}
    </button>
  );
}
