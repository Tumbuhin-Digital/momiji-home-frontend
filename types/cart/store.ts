import type { CurrencyCode } from "@/types/core"

export interface CartStore {
  expiresAt: string | null
  isGlobalPending: boolean
  isOpen: boolean
  market: CurrencyCode
  sessionId: string | null
  setIsGlobalPending: (isPending: boolean) => void
  setIsOpen: (open: boolean) => void
  setMarket: (market: CurrencyCode) => void
  setSessionId: (id: string | null, expiresAt?: string | null) => void
}
