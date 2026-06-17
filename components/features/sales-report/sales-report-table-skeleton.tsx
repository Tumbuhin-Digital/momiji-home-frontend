import { Skeleton } from "@/components/ui/skeleton"

export function SalesReportTableSkeleton() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <tr
          key={i}
          className="border-b border-primary/50 last:border-0 hover:bg-slate-50/50"
        >
          <td className="px-6 py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-6 w-24 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  )
}
