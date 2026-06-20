import { Skeleton } from "@/components/ui/skeleton"

export function PreorderListSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F7F7F7]"
        >
          {/* Group header skeleton */}
          <div className="flex items-start justify-between px-6 py-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-10 rounded" />
            </div>
          </div>

          {/* Inner table skeleton */}
          <div className="mx-4 mb-4 overflow-hidden rounded-md border border-[#E5E5E5] bg-white">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-4 border-b border-[#F0F0F0] px-5 py-2.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-10 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </div>
            {/* Data rows */}
            {Array.from({ length: i + 1 }).map((_, j) => (
              <div
                key={j}
                className="grid grid-cols-3 items-center gap-4 border-b border-[#F0F0F0] px-5 py-3 last:border-0"
              >
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
