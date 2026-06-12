import { Skeleton } from "@/components/ui/skeleton"

export function ProductCatalogSkeleton() {
  return (
    <div className="h-full py-2.5">
      <div className="flex h-full flex-col space-y-3 rounded-3xl bg-[#F6F0EE] p-3 sm:p-4">
        <Skeleton className="aspect-square w-full rounded-2xl bg-white/60" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-3/4 bg-white/60" />
          <Skeleton className="h-4 w-1/2 bg-white/60" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-1/3 bg-white/60" />
            <Skeleton className="size-8 rounded-full bg-white/60 sm:size-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
