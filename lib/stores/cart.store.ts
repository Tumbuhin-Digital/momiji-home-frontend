import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartStore } from "@/types/cart"

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      expiresAt: null,
      isOpen: false,
      market: "USD",
      sessionId: null,
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
