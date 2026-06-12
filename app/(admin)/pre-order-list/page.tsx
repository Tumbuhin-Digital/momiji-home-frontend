import { PreorderListClient } from "@/components/features/preorders/preorder-list-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pre-Order List",
  description: "Track and manage customer pre-orders and deposits.",
}

export default function PreOrderListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PreorderListClient />
    </div>
  )
}
