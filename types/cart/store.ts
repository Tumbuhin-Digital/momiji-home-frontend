import type { CurrencyCode } from "@/types/core"

export interface CartStore {
  expiresAt: string | null
  isOpen: boolean
  market: CurrencyCode
  sessionId: string | null
  setIsOpen: (open: boolean) => void
  setMarket: (market: CurrencyCode) => void
  setSessionId: (id: string | null, expiresAt?: string | null) => void
}
