import { ErrorView } from "@/components/global/error-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Maintenance",
  description:
    "MOMIJI is currently undergoing system upgrades and maintenance.",
}

export default function MaintenancePage() {
  return (
    <ErrorView
      code="MNT"
      title="System Maintenance"
      description="MOMIJI is currently undergoing planned system upgrades to improve our wholesale orchestration and payment speed. We will be back online shortly."
      hint="Thank you for your patience. Please check back soon."
      icon="wrench"
      iconColorClass="text-[#2E7F9C]"
      iconBgClass="bg-[#2E7F9C]/10 ring-[#2E7F9C]/20"
      actions={[{ label: "Return to safety", href: "/", variant: "default" }]}
    />
  )
}
