import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCatalogCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden rounded-[14px] border-none transition-all duration-300">
      <CardContent className="relative grid gap-5 p-3 sm:p-5">
        <div className="relative aspect-square w-full overflow-hidden rounded-[14px]">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="mr-6 flex flex-col justify-center-safe gap-1">
          <Skeleton className="h-4 w-3/4 sm:h-5" />
          <div className="mt-1 flex w-full flex-col flex-wrap justify-start gap-1 self-baseline sm:flex-row sm:gap-2">
            <Skeleton className="h-4 w-1/3 sm:h-5" />
            <Skeleton className="h-4 w-1/4 sm:h-5" />
          </div>
        </div>

        <div className="flex justify-end">
          <Skeleton className="size-7.5 rounded-full sm:size-13" />
        </div>
      </CardContent>
    </Card>
  )
}
