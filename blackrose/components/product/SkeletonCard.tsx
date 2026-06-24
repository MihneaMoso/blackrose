export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-zinc-800" />
      <div className="mt-4 space-y-2 px-1">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
  )
}
