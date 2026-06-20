import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark size={48} />
      <h1 className="text-2xl font-extrabold tracking-tight">Page not found</h1>
      <p className="max-w-xs text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="rounded-full bg-text px-5 py-2 font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
