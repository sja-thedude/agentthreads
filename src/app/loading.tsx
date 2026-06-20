import { FeedSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div>
      <div className="h-[57px] border-b border-border" />
      <FeedSkeleton count={7} />
    </div>
  );
}
