import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartStore } from "@/types/cart"

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      expiresAt: null,
      isGlobalPending: false,
      isOpen: false,
      market: "USD",
      pendingSync: {},
      sessionId: null,
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
      markPendingSync: (variantId, totalQuantity) =>
        set((state) => ({
          pendingSync: {
            ...state.pendingSync,
            [variantId]: totalQuantity,
          },
        })),
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
