import type { CurrencyCode } from "@/types/core"

export interface CartStore {
  acceptedBatchDepletion: Record<string, boolean>
  cartDirty: boolean
  clearAcceptedBatchDepletion: (variantId?: string) => void
  clearCartDirty: () => void
  clearPendingSync: (variantId?: string) => void
  consumeShippingRefresh: () => boolean
  expiresAt: string | null
  getPendingSync: () => Record<string, number>
  hasAcceptedBatchDepletion: (variantId: string) => boolean
  isGlobalPending: boolean
  isOpen: boolean
  markAcceptedBatchDepletion: (variantId: string) => void
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
