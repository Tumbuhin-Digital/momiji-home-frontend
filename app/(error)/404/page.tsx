import { ErrorView } from "@/components/global/error-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
}

export default function NotFoundPage() {
  return (
    <ErrorView
      code="404"
      title="Page Not Found"
      description="The page you requested could not be found. It may have been moved, deleted, or the URL might be mistyped."
      hint="Please double check the address link or return to safety using the options below."
      icon="file-question"
      iconColorClass="text-[#2E7F9C]"
      iconBgClass="bg-[#2E7F9C]/10 ring-[#2E7F9C]/20"
    />
  )
}
