import { cartService } from "@/lib/services/cart.service"
import { useCartStore } from "@/lib/stores/cart.store"

function isSessionExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

export async function ensureCartSession(): Promise<boolean> {
  const { sessionId, expiresAt, setSessionId } = useCartStore.getState()

  if (sessionId && !isSessionExpired(expiresAt)) {
    return true
  }

  try {
    const session = await cartService.createSession()
    const sId = session.session_id
    const eAt = session.expires_at

    if (sId) {
      setSessionId(sId, eAt)
      return true
    }

    return false
  } catch {
    return false
  }
}
