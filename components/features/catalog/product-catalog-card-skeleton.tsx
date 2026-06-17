import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCatalogCardSkeleton() {
  return (
    <Card className="flex h-auto min-h-23.75 w-full flex-row items-stretch overflow-hidden rounded-lg border-none bg-card transition-all duration-300">
      {/* Image */}
      <div className="relative h-23.75 w-27 shrink-0 overflow-hidden rounded-l-lg">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="mb-2 flex-1 sm:mb-0 sm:pr-4">
          <Skeleton className="h-4 w-3/4 sm:h-5" />
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
          <div className="flex flex-col gap-1 text-left sm:items-end sm:text-right">
            <Skeleton className="h-4 w-20 sm:h-6 sm:w-24" />
            <Skeleton className="h-3 w-16 sm:h-5 sm:w-20" />
          </div>
          <div className="flex items-center justify-end">
            <Skeleton className="h-9 w-27 rounded-full sm:w-32.5" />
          </div>
        </div>
      </div>
    </Card>
  )
}
