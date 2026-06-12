import DashboardClient from "./dashboard-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Operations Dashboard",
  description: "MOMIJI Operations Dashboard",
}

export default function DashboardPage() {
  return <DashboardClient />
}
