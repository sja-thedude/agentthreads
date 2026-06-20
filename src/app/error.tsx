"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="h-10 w-10 text-faint" />
      <h2 className="text-xl font-bold">{t("common.somethingWrong")}</h2>
      <p className="max-w-xs text-sm text-muted">{t("common.somethingWrongBody")}</p>
      <button
        onClick={reset}
        className="rounded-full bg-text px-5 py-2 font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
      >
        {t("common.retry")}
      </button>
    </div>
  );
}
