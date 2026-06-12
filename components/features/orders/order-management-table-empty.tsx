import { Search } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function OrderManagementTableEmpty() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <Empty className="py-12">
        <EmptyMedia variant="icon">
          <Search className="size-5 text-slate-400" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No orders found</EmptyTitle>
          <EmptyDescription>
            There are no orders matching your criteria.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
