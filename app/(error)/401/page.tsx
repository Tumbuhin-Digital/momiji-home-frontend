import { ErrorView } from "@/components/global/error-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unauthorized Access",
  description: "You must be logged in to access this page.",
}

export default function UnauthorizedPage() {
  return (
    <ErrorView
      code="401"
      title="Authentication Required"
      description="Access to this resource requires active user authentication. Your session may have expired or you are not currently signed in."
      hint="Please try logging in with your MOMIJI credentials."
      icon="lock"
      iconColorClass="text-[#2E7F9C]"
      iconBgClass="bg-[#2E7F9C]/10 ring-[#2E7F9C]/20"
    />
  )
}
