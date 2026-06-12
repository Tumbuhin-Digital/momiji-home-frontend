import { UnderConstruction } from "@/components/global/under-construction"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sales Report",
  description: "Analyze operations and wholesale revenue metrics.",
}

export default function SalesReportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UnderConstruction
        title="Sales Report"
        description="Operations and revenue analytics modules are currently under development. Detailed sales logs, Unishippers routing costs, and deposit conversions will be tracked here."
      />
    </div>
  )
}
