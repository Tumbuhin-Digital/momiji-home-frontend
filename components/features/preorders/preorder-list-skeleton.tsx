import { Skeleton } from "@/components/ui/skeleton"

export function PreorderListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded border border-[#EBEBEB] bg-white shadow-sm"
        >
          {/* Group header skeleton */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-12 rounded" />
            </div>
          </div>
          {/* Row skeleton */}
          <div className="divide-y divide-slate-100 px-6">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-8 py-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
