import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { BatchDepletionAcceptance, CartStore } from "@/types/cart"

function normalizeAcceptanceLevel(
  value: unknown
): BatchDepletionAcceptance | undefined {
  if (value === "next_batch" || value === "unlimited") return value
  // Legacy boolean from older localStorage shape
  if (value === true) return "next_batch"
  return undefined
}

function migrateAcceptedBatchDepletion(
  raw: unknown
): Record<string, BatchDepletionAcceptance> {
  if (!raw || typeof raw !== "object") return {}
  const next: Record<string, BatchDepletionAcceptance> = {}
  for (const [variantId, value] of Object.entries(
    raw as Record<string, unknown>
  )) {
    const level = normalizeAcceptanceLevel(value)
    if (level) next[variantId] = level
  }
  return next
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      acceptedBatchDepletion: {},
      cartDirty: false,
      expiresAt: null,
      isGlobalPending: false,
      isOpen: false,
      market: "USD",
      pendingSync: {},
      sessionId: null,
      shouldRefreshShipping: false,
      clearAcceptedBatchDepletion: (variantId) =>
        set((state) => {
          if (!variantId) {
            return { acceptedBatchDepletion: {} }
          }
          const next = { ...state.acceptedBatchDepletion }
          delete next[variantId]
          return { acceptedBatchDepletion: next }
        }),
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
      getAcceptedBatchDepletionLevel: (variantId) =>
        normalizeAcceptanceLevel(get().acceptedBatchDepletion[variantId]),
      getPendingSync: () => get().pendingSync,
      hasAcceptedBatchDepletion: (variantId) =>
        !!normalizeAcceptanceLevel(get().acceptedBatchDepletion[variantId]),
      markAcceptedBatchDepletion: (variantId, level = "next_batch") =>
        set((state) => {
          const current = normalizeAcceptanceLevel(
            state.acceptedBatchDepletion[variantId]
          )
          // Never downgrade unlimited → next_batch via mark
          if (current === "unlimited" && level === "next_batch") {
            return state
          }
          return {
            acceptedBatchDepletion: {
              ...state.acceptedBatchDepletion,
              [variantId]: level,
            },
          }
        }),
      setAcceptedBatchDepletionLevel: (variantId, level) =>
        set((state) => {
          const next = { ...state.acceptedBatchDepletion }
          if (!level) {
            delete next[variantId]
          } else {
            next[variantId] = level
          }
          return { acceptedBatchDepletion: next }
        }),
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
        acceptedBatchDepletion: state.acceptedBatchDepletion,
        expiresAt: state.expiresAt,
        market: state.market,
        sessionId: state.sessionId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<CartStore>
        return {
          ...currentState,
          ...persisted,
          acceptedBatchDepletion: migrateAcceptedBatchDepletion(
            persisted.acceptedBatchDepletion
          ),
        }
      },
    }
  )
)
