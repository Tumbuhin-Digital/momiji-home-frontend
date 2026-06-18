import { Skeleton } from "@/components/ui/skeleton"

export function ProductCatalogCardSkeleton() {
  return (
    <div className="flex h-auto min-h-23.75 w-full flex-row items-stretch gap-3 overflow-hidden rounded border-none bg-card p-3 transition-all duration-300">
      <div className="relative h-23.75 w-27 shrink-0 overflow-hidden rounded">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4 sm:h-5" />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex flex-col gap-1 text-left sm:items-end sm:text-right">
            <Skeleton className="h-4 w-20 sm:h-6 sm:w-24" />
            <Skeleton className="h-3 w-16 sm:h-5 sm:w-20" />
          </div>
          <div className="flex items-center justify-end">
            <Skeleton className="h-9 w-27 sm:w-32.5" />
          </div>
        </div>
      </div>
    </div>
  )
}
