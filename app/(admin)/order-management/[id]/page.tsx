import { Metadata } from "next"

import OrderDetailClient from "@/components/features/orders/order-detail-client"

export const metadata: Metadata = {
  title: "Order Details",
  description: "View and manage order details",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  return <OrderDetailClient orderId={resolvedParams.id} />
}
