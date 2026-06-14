import { SalesReportClient } from "@/components/features/sales-report/sales-report-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sales Report",
  description: "View historical sales and order breakdowns.",
}

export default function SalesReportPage() {
  return <SalesReportClient />
}
