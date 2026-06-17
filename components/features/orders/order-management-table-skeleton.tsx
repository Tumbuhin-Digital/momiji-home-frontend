import { Skeleton } from "@/components/ui/skeleton"
import { TableRow, TableCell } from "@/components/ui/table"

export function OrderManagementTableSkeleton() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <TableRow
          key={i}
          className="border-b border-primary/50 last:border-0 hover:bg-muted/50"
        >
          <TableCell className="py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-24 rounded-md" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-1.5 w-24 rounded-full" />
              <Skeleton className="h-5 w-8 rounded-md" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-8 w-24 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
