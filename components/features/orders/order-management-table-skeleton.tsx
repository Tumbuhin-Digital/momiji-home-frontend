import { Skeleton } from "@/components/ui/skeleton"

export function OrderManagementTableSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-4">
      <Skeleton className="h-12 w-full rounded-md" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4">
          <Skeleton className="h-12.25 w-full rounded-md" />
          <Skeleton className="h-12.25 w-full rounded-md" />
          <Skeleton className="h-12.25 w-full rounded-md" />
          <Skeleton className="h-12.25 w-full rounded-md" />
          <Skeleton className="h-12.25 w-full rounded-md" />
          <Skeleton className="h-12.25 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}
