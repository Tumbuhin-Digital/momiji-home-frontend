"use client"

import { useEffect } from "react"

import { ensureCartSession } from "@/lib/cart/ensure-cart-session"
import { useAuthStore } from "@/lib/stores/auth.store"
import { useCartStore } from "@/lib/stores/cart.store"

export function CartSessionBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionId = useCartStore((state) => state.sessionId)
  const expiresAt = useCartStore((state) => state.expiresAt)

  useEffect(() => {
    if (isAuthenticated) return

    const isExpired =
      expiresAt && new Date(expiresAt).getTime() < Date.now()

    if (sessionId && !isExpired) return

    void ensureCartSession()
  }, [isAuthenticated, sessionId, expiresAt])

  return null
}
