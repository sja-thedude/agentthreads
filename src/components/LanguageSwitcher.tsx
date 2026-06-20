"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ withLabel = false }: { withLabel?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("lang.label")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full p-2.5 text-muted transition-colors duration-150 hover:bg-card-hover hover:text-text"
      >
        <Globe className="h-5 w-5" />
        {withLabel && <span className="text-[15px]">{LOCALE_LABELS[locale]}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-in absolute right-0 bottom-full z-50 mb-2 w-44 overflow-hidden rounded-2xl border border-border bg-elevated p-1.5 shadow-2xl md:bottom-auto md:top-full md:mt-2 md:mb-0"
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-card-hover",
                l === locale ? "font-semibold text-text" : "text-muted"
              )}
            >
              <span className="text-base">{LOCALE_FLAGS[l]}</span>
              <span className="flex-1">{LOCALE_LABELS[l]}</span>
              {l === locale && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
