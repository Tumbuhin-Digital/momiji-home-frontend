import { create } from "zustand"

export type AuthUser = {
  id: string
  email: string
  name: string
  role: string
  shopify_customer_id?: string
}

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthActions = {
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))

export { useAuthStore }
