import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { cartService } from "@/lib/services/cart.service"
import { useAuthStore } from "@/lib/stores/auth.store"
import { useCartStore } from "@/lib/stores/cart.store"

export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionId = useCartStore((state) => state.sessionId)

  return useQuery({
    queryKey: queryKeys.cart.cart(),
    queryFn: cartService.getCart,
    enabled: isAuthenticated || !!sessionId,
  })
}

export function useCartSummary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionId = useCartStore((state) => state.sessionId)

  return useQuery({
    queryKey: queryKeys.cart.summary(),
    queryFn: cartService.getSummary,
    enabled: isAuthenticated || !!sessionId,
  })
}
