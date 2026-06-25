import type { CurrencyCode } from "@/types/core"

export interface CartStore {
  cartDirty: boolean
  clearCartDirty: () => void
  clearPendingSync: (variantId?: string) => void
  consumeShippingRefresh: () => boolean
  expiresAt: string | null
  getPendingSync: () => Record<string, number>
  isGlobalPending: boolean
  isOpen: boolean
  markCartDirty: () => void
  market: CurrencyCode
  markPendingSync: (variantId: string, totalQuantity: number) => void
  pendingSync: Record<string, number>
  requestShippingRefresh: () => void
  sessionId: string | null
  setIsGlobalPending: (isPending: boolean) => void
  setIsOpen: (open: boolean) => void
  setMarket: (market: CurrencyCode) => void
  setSessionId: (id: string | null, expiresAt?: string | null) => void
  shouldRefreshShipping: boolean
}
