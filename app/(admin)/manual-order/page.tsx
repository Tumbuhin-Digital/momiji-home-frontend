import { ManualOrderPageClient } from "@/components/features/manual-order/manual-order-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manual Order",
  description: "Create Shopify invoices on behalf of customers.",
}

export default function ManualOrderPage() {
  return <ManualOrderPageClient />
}
