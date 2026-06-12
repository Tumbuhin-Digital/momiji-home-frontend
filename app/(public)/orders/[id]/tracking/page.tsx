import CustomerTrackingClient from "@/components/features/orders/customer-tracking-client"

export default async function CustomerTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  return <CustomerTrackingClient orderId={resolvedParams.id} />
}
