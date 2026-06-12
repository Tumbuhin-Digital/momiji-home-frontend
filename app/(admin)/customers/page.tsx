import { CustomerListClient } from "@/components/features/customers/customer-list-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers Management",
  description: "Manage wholesale B2B and retail customers.",
}

export default function CustomersPage() {
  return <CustomerListClient />
}
