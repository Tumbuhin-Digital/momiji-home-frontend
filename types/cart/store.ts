import type { CurrencyCode } from "@/types/core"

export type BatchDepletionAcceptance = "next_batch" | "unlimited"

export interface CartStore {
  acceptedBatchDepletion: Record<string, BatchDepletionAcceptance>
  cartDirty: boolean
  clearAcceptedBatchDepletion: (variantId?: string) => void
  clearCartDirty: () => void
  clearPendingSync: (variantId?: string) => void
  consumeShippingRefresh: () => boolean
  expiresAt: string | null
  getAcceptedBatchDepletionLevel: (
    variantId: string
  ) => BatchDepletionAcceptance | undefined
  getPendingSync: () => Record<string, number>
  hasAcceptedBatchDepletion: (variantId: string) => boolean
  isGlobalPending: boolean
  isOpen: boolean
  markAcceptedBatchDepletion: (
    variantId: string,
    level?: BatchDepletionAcceptance
  ) => void
  /** Set or clear acceptance level (allows downgrade, unlike mark). */
  setAcceptedBatchDepletionLevel: (
    variantId: string,
    level: BatchDepletionAcceptance | undefined
  ) => void
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
