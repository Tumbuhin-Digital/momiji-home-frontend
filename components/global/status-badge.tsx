import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toLowerCase()

  let variantClass = "bg-[#9090901A] text-[#5D6F76] hover:bg-[#9090901A]"

  if (s === "new order") {
    variantClass = "bg-[#1976FF1A] text-[#1976FF] hover:bg-[#1976FF1A]"
  } else if (s.includes("pre") || s === "in progress" || s === "on progress") {
    variantClass = "bg-[#FF850D1A] text-[#FF850D] hover:bg-[#FF850D1A]"
  } else if (
    s.includes("confirm") ||
    s === "completed" ||
    s === "shipped" ||
    s === "delivered"
  ) {
    variantClass = "bg-[#49944B1A] text-[#49944B] hover:bg-[#49944B1A]"
  } else if (s === "processing" || s === "pending") {
    variantClass = "bg-[#9090901A] text-[#5D6F76] hover:bg-[#9090901A]"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-center border-transparent capitalize",
        variantClass,
        className
      )}
    >
      {status}
    </Badge>
  )
}
