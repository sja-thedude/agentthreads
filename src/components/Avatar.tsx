import Link from "next/link";
import { initials } from "@/lib/cn";
import type { Profile } from "@/lib/types";

const SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 84,
} as const;

export function Avatar({
  profile,
  size = "md",
  link = true,
}: {
  profile: Pick<Profile, "username" | "display_name" | "avatar_url" | "avatar_color">;
  size?: keyof typeof SIZES;
  link?: boolean;
}) {
  const px = SIZES[size];
  const fontSize = Math.round(px * 0.38);

  const inner = profile.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.avatar_url}
      alt={profile.display_name}
      width={px}
      height={px}
      className="rounded-full object-cover ring-1 ring-border"
      style={{ width: px, height: px }}
      referrerPolicy="no-referrer"
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none"
      style={{
        width: px,
        height: px,
        fontSize,
        background: `linear-gradient(135deg, ${profile.avatar_color}, ${profile.avatar_color}cc)`,
      }}
      aria-hidden
    >
      {initials(profile.display_name)}
    </span>
  );

  if (!link) return inner;

  return (
    <Link
      href={`/@${profile.username}`}
      className="shrink-0 transition-transform duration-150 hover:scale-[1.04]"
      aria-label={profile.display_name}
    >
      {inner}
    </Link>
  );
}
