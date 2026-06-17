import { Fragment } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductTableSkeleton() {
  const rows = Array.from({ length: 5 }, (_, i) => i)

  return (
    <>
      {rows.map((index) => (
        <Fragment key={`skeleton-row-${index}`}>
          <tr className="border-b border-primary/50 bg-white last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center justify-start gap-4">
                <Skeleton className="size-12 rounded-md" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-4 w-8" />
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-10 w-40 rounded-lg" />
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-4 w-32" />
            </td>
            <td className="px-6 py-4">
              <Skeleton className="h-4 w-32" />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-start gap-2">
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </td>
          </tr>
        </Fragment>
      ))}
    </>
  )
}
