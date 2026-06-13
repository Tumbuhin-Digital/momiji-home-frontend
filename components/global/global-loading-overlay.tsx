"use client"

import { useEffect, useState } from "react"

import { useIsFetching, useIsMutating } from "@tanstack/react-query"

import { Progress } from "@/components/ui/progress"

import { queryKeys } from "@/lib/query/query-keys"
import { useCartStore } from "@/lib/stores/cart.store"

export function GlobalLoadingOverlay() {
  const isGlobalPending = useCartStore((state) => state.isGlobalPending)
  const isMutatingCart = useIsMutating({ mutationKey: queryKeys.cart.all() })
  const isFetchingCart = useIsFetching({ queryKey: queryKeys.cart.all() })

  const isActive = isGlobalPending || isMutatingCart > 0 || isFetchingCart > 0

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let hideTimer: NodeJS.Timeout | null = null

    if (isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0)
      setVisible(true)

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev
          const increment = Math.random() * 12 + 3
          return Math.min(85, Math.round(prev + increment))
        })
      }, 400)
    } else if (visible) {
      if (interval) clearInterval(interval)
      setProgress(100)

      hideTimer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 400)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (hideTimer) clearTimeout(hideTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-300">
      <div className="flex w-64 flex-col items-center gap-4 rounded-xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
        <Progress className="w-full" value={progress} />
        <p className="text-sm font-medium text-slate-600">Updating cart...</p>
      </div>
    </div>
  )
}
