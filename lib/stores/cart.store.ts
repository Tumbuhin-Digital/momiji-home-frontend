import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartStore } from "@/types/cart"

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartDirty: false,
      expiresAt: null,
      isGlobalPending: false,
      isOpen: false,
      market: "USD",
      pendingSync: {},
      sessionId: null,
      shouldRefreshShipping: false,
      clearCartDirty: () => set({ cartDirty: false }),
      clearPendingSync: (variantId) =>
        set((state) => {
          if (!variantId) {
            return { pendingSync: {} }
          }
          const next = { ...state.pendingSync }
          delete next[variantId]
          return { pendingSync: next }
        }),
      getPendingSync: () => get().pendingSync,
      markCartDirty: () => set({ cartDirty: true }),
      markPendingSync: (variantId, totalQuantity) =>
        set((state) => ({
          pendingSync: {
            ...state.pendingSync,
            [variantId]: totalQuantity,
          },
        })),
      consumeShippingRefresh: () => {
        const shouldRefresh = get().shouldRefreshShipping
        if (shouldRefresh) {
          set({ shouldRefreshShipping: false })
        }
        return shouldRefresh
      },
      requestShippingRefresh: () => set({ shouldRefreshShipping: true }),
      setIsGlobalPending: (isGlobalPending) => set({ isGlobalPending }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setMarket: (market) => set({ market }),
      setSessionId: (sessionId, expiresAt = null) =>
        set({
          sessionId,
          expiresAt,
        }),
    }),
    {
      name: "momiji-cart-session",
      partialize: (state) => ({
        expiresAt: state.expiresAt,
        market: state.market,
        sessionId: state.sessionId,
      }),
    }
  )
)
