"use client"

import { useEffect, useState } from "react"

import { Timer } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"

interface StockLockTimerProps {
  expiresAt: number | string
  onExpire?: () => void
  className?: string
}

export function StockLockTimer({
  expiresAt,
  onExpire,
  className,
}: StockLockTimerProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTime = () => {
      const expirationTime =
        typeof expiresAt === "string"
          ? new Date(expiresAt).getTime()
          : expiresAt
      const diff = expirationTime - Date.now()
      if (diff <= 0) {
        return "00:00"
      }
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(calculateTime())

    const interval = setInterval(() => {
      const formatted = calculateTime()
      setTimeLeft(formatted)
      if (formatted === "00:00") {
        clearInterval(interval)
        if (onExpire) onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt])

  if (!timeLeft || timeLeft === "00:00") return null

  return (
    <Badge
      variant="destructive"
      className={cn(
        "flex h-7.5 w-full max-w-89.5 items-center justify-center gap-2.5 rounded-full! px-4 py-3 font-semibold",
        className
      )}
    >
      <Timer className="size-4" />
      <span className="truncate text-xs">
        Complete your payment within {timeLeft}
      </span>
    </Badge>
  )
}
