import type { CurrencyCode } from "@/types/core"

export interface CartStore {
  market: CurrencyCode
  isOpen: boolean
  sessionId: string | null
  expiresAt: string | null
  setIsOpen: (open: boolean) => void
  setMarket: (market: CurrencyCode) => void
  setSessionId: (id: string | null, expiresAt?: string | null) => void
}
