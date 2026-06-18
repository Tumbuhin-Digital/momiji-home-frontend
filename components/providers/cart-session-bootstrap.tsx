"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"

import { ensureCartSession } from "@/lib/cart/ensure-cart-session"
import { useAuthStore } from "@/lib/stores/auth.store"
import { useCartStore } from "@/lib/stores/cart.store"

function useCartStoreHydrated() {
  return useSyncExternalStore(
    useCartStore.persist.onFinishHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  )
}

export function CartSessionBootstrap() {
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionId = useCartStore((state) => state.sessionId)
  const expiresAt = useCartStore((state) => state.expiresAt)
  const hasHydrated = useCartStoreHydrated()

  useEffect(() => {
    if (!hasHydrated) return
    if (isAuthenticated) return
    if (pathname.startsWith("/checkout")) return

    const isExpired = expiresAt && new Date(expiresAt).getTime() < Date.now()

    if (sessionId && !isExpired) return

    void ensureCartSession()
  }, [hasHydrated, isAuthenticated, sessionId, expiresAt, pathname])

  return null
}
