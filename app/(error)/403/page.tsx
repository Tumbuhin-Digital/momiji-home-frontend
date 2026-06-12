import { ErrorView } from "@/components/global/error-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Access Denied",
  description: "You do not have permission to view this page.",
}

export default function ForbiddenPage() {
  return (
    <ErrorView
      code="403"
      title="Access Denied"
      description="Your account permissions are insufficient to access this page or perform this operation."
      hint="If you believe this is in error, contact your system administrator to adjust your user privileges."
      icon="shield-alert"
      iconColorClass="text-destructive"
      iconBgClass="bg-destructive/10 ring-destructive/20"
    />
  )
}
