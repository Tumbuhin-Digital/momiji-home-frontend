import { create } from "zustand"

export type AuthUser = {
  email: string
  id: string
  name: string
  role: string
  shopify_customer_id?: string
}

type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
}

type AuthActions = {
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setUser: (user: AuthUser) => void
}

const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // State
  isAuthenticated: false,
  isLoading: true,
  user: null,

  // Actions
  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
}))

export { useAuthStore }
