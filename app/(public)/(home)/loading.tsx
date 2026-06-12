import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <div className="flex flex-col items-center justify-center gap-8 py-20">
        <div className="flex flex-col items-center gap-3.75 text-center">
          <Skeleton className="h-10 w-64 sm:h-16 sm:w-96" />
          <Skeleton className="mt-4 h-6 w-80 sm:h-8 sm:w-125" />
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-8 pb-8 sm:flex-row sm:pb-0">
        <Skeleton className="h-70 w-full rounded-none lg:h-82.5 lg:w-151" />
        <Skeleton className="h-70 w-full rounded-none lg:h-82.5 lg:w-151" />
      </div>
    </div>
  )
}
