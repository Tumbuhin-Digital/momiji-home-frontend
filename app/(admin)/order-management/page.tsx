import { OrderManagementClient } from "@/components/features/orders/order-management-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Management",
  description: "Manage wholesale B2B and Shopify orders.",
}

export default function OrderManagementPage() {
  return <OrderManagementClient />
}
