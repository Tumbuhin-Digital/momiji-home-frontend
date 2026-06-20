import { Skeleton } from "@/components/ui/skeleton"

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Mobile Timer Skeleton */}
      <div className="mb-6 flex items-center justify-center lg:hidden">
        <Skeleton className="h-7.5 w-full max-w-89.5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column */}
        <div className="space-y-10 lg:col-span-7">
          <div className="space-y-8">
            {/* Contact */}
            <section className="space-y-4">
              <Skeleton className="h-8 w-24" />
              <div className="space-y-3">
                <Skeleton className="h-17.5 w-full rounded" />
                <Skeleton className="mt-2 h-4 w-48" />
              </div>
            </section>

            {/* Delivery */}
            <section className="space-y-4 pt-4">
              <Skeleton className="h-8 w-24" />
              <div className="space-y-4">
                <Skeleton className="h-14 w-full rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-14 w-full rounded" />
                  <Skeleton className="h-14 w-full rounded" />
                </div>
                <Skeleton className="h-14 w-full rounded" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-14 w-full rounded" />
                  <Skeleton className="h-14 w-full rounded" />
                  <Skeleton className="h-14 w-full rounded" />
                </div>
                <Skeleton className="h-14 w-full rounded" />
              </div>
            </section>

            {/* Shipping Method */}
            <section className="space-y-4 pt-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-17.5 w-full rounded" />
            </section>

            {/* Pay Button */}
            <div className="pt-4">
              <Skeleton className="h-16 w-full rounded" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-8">
            {/* Desktop Timer Skeleton */}
            <div className="hidden justify-end lg:flex">
              <Skeleton className="h-7.5 w-full max-w-89.5 rounded-full" />
            </div>

            {/* Items */}
            <div className="space-y-6">
              {/* Ship Ready */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-md sm:size-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-md sm:size-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Pre Order */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-md sm:size-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            {/* Order Summary Cards */}
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
