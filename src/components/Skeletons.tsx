export function PostSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border px-4 py-4">
      <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="skeleton h-3 w-40 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="mt-3 flex gap-6">
          <div className="skeleton h-3 w-10 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="skeleton h-6 w-44 rounded" />
          <div className="skeleton h-4 w-28 rounded" />
        </div>
        <div className="skeleton h-[84px] w-[84px] rounded-full" />
      </div>
      <div className="skeleton mt-4 h-4 w-3/4 rounded" />
      <div className="skeleton mt-4 h-9 w-full rounded-full" />
    </div>
  );
}

export function AgentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
      <div className="skeleton h-7 w-16 rounded-full" />
    </div>
  );
}
