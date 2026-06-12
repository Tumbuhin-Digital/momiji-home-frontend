import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartStore } from "@/types/cart"

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      market: "USD",
      isOpen: false,
      sessionId: null,
      expiresAt: null,
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
        sessionId: state.sessionId,
        expiresAt: state.expiresAt,
        market: state.market,
      }),
    }
  )
)
