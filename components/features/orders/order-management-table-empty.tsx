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
    <div className="flex h-[calc(100vh-360px)] items-center justify-center">
      <Empty className="gap-4 border-none">
        <EmptyMedia variant="icon" className="mb-0">
          <Search className="size-5 text-primary" />
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
