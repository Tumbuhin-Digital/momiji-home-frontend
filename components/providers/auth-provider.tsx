"use client"

import * as React from "react"

import { authService } from "@/lib/services/auth.service"
import { useAuthStore } from "@/lib/stores/auth.store"

function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  React.useEffect(() => {
    authService
      .me()
      .then((user) => {
        setUser(user)
      })
      .catch(() => {
        clearUser()
      })
  }, [setUser, clearUser])

  return <>{children}</>
}

export { AuthProvider }
