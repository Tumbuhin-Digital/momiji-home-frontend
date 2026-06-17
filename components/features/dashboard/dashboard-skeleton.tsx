import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-[8px] border-slate-200 bg-white shadow-none"
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="mb-2.5 h-5 w-24" />
                  <div className="flex flex-col gap-2.5">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="size-10.5 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[8px] border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <CardContent className="space-y-3 pt-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-1.75 rounded-[8px] border border-slate-200 bg-slate-50 p-3"
              >
                <div className="w-full space-y-1">
                  <Skeleton className="mb-1 h-3 w-16" />
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-3 rounded-[8px] border-slate-200 bg-white shadow-none">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between gap-1.75 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <Skeleton className="mb-2 h-5 w-28" />
                  <span className="flex flex-col gap-2">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </span>
                </div>
                <Skeleton className="size-10 rounded-full" />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center justify-between gap-2.5">
                <Skeleton className="h-6 w-36" />
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <Skeleton className="h-57 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
