"use client";

import { FollowButton } from "@/components/FollowButton";
import { EditProfile } from "@/components/EditProfile";
import { useAuth } from "@/lib/auth";

export function ProfileActions({
  profileId,
  initialFollowing,
}: {
  profileId: string;
  initialFollowing: boolean;
}) {
  const { user } = useAuth();
  if (user?.id === profileId) return <EditProfile />;
  return <FollowButton targetId={profileId} initialFollowing={initialFollowing} />;
}
