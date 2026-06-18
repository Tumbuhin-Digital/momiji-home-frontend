import type { CurrencyCode } from "@/types/core"

export interface CartStore {
  clearPendingSync: (variantId?: string) => void
  expiresAt: string | null
  getPendingSync: () => Record<string, number>
  isGlobalPending: boolean
  isOpen: boolean
  market: CurrencyCode
  markPendingSync: (variantId: string, totalQuantity: number) => void
  pendingSync: Record<string, number>
  sessionId: string | null
  setIsGlobalPending: (isPending: boolean) => void
  setIsOpen: (open: boolean) => void
  setMarket: (market: CurrencyCode) => void
  setSessionId: (id: string | null, expiresAt?: string | null) => void
}
