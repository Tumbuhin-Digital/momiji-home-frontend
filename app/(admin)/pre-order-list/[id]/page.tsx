import { PreorderDetailClient } from "@/components/features/preorders/preorder-detail-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pre-Order Settlement Detail",
  description: "View details and manage status for pre-order settlements.",
}

export default async function PreorderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  return <PreorderDetailClient settlementId={resolvedParams.id} />
}
