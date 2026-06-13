import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartStore } from "@/types/cart"

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      expiresAt: null,
      isGlobalPending: false,
      isOpen: false,
      market: "USD",
      sessionId: null,
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
