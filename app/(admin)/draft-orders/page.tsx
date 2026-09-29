import { DraftOrdersClient } from "@/components/features/orders/draft-orders-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Draft Orders",
  description: "Unpaid draft orders created from the Momiji website.",
}

export default function DraftOrdersPage() {
  return <DraftOrdersClient />
}
