import { CustomerDetailClient } from "@/components/features/customers/customer-detail-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Detail",
  description: "View customer details and order history.",
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  return <CustomerDetailClient customerId={resolvedParams.id} />
}
