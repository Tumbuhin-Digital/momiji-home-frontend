import { Skeleton } from "@/components/ui/skeleton"

export function ProductCatalogSkeleton() {
  return (
    <div className="h-full py-2.5">
      <div className="flex h-full flex-col space-y-3 rounded-3xl bg-card p-3 sm:p-4">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="size-8 rounded-full sm:size-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
