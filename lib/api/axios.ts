import axios, { AxiosError } from "axios"

import { API_BASE_URL, API_TIMEOUT_MS } from "./env"

import type { InternalAxiosRequestConfig } from "axios"

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

class ApiError extends Error {
  status?: number
  payload?: ApiErrorPayload

  constructor(message: string, status?: number, payload?: ApiErrorPayload) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

async function onRequest(config: InternalAxiosRequestConfig) {
  config.headers.set("Accept", "application/json")

  if (!config.headers.get("Content-Type") && config.method !== "get") {
    config.headers.set("Content-Type", "application/json")
  }

  // Inject session ID from cart store for guest cart functionality
  if (typeof window !== "undefined") {
    try {
      const { useCartStore } = await import("@/lib/stores/cart.store")
      const state = useCartStore.getState()
      const sessionId = state.sessionId
      const expiresAt = state.expiresAt

      if (sessionId) {
        if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
          // Proactively clear expired session
          state.setSessionId(null, null)
        } else {
          config.headers.set("x-session-id", sessionId)
        }
      }
    } catch (e) {
      console.warn("Failed to attach session ID", e)
    }
  }

  return config
}

function onRequestError(error: AxiosError) {
  return Promise.reject(error)
}

let localLock: Promise<void> | null = null

async function acquireLock(callback: () => Promise<void>) {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("momiji_auth_refresh", callback)
  }

  while (localLock) {
    try {
      await localLock
    } catch {}
  }
  let resolveLock!: () => void
  localLock = new Promise((res) => {
    resolveLock = res
  })
  try {
    await callback()
  } finally {
    localLock = null
    resolveLock()
  }
}

async function onResponseError(error: AxiosError<ApiErrorPayload>) {
  const status = error.response?.status
  const payload = error.response?.data
  const message =
    payload?.message || error.message || "Unexpected error while calling API"

  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retried?: boolean
  }

  const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh")
  const isLoginEndpoint = originalRequest.url?.includes("/auth/login")

  const isGuestEndpoint =
    originalRequest.url?.includes("/cart") ||
    originalRequest.url?.includes("/products") ||
    originalRequest.url?.includes("/checkout") ||
    originalRequest.url?.includes("/shipping")

  const { useAuthStore } = await import("@/lib/stores/auth.store")
  const isAuthenticated = useAuthStore.getState().isAuthenticated

  const shouldSkipRefresh = isGuestEndpoint && !isAuthenticated

  if (
    status === 401 &&
    !originalRequest._retried &&
    !isRefreshEndpoint &&
    !isLoginEndpoint &&
    !shouldSkipRefresh
  ) {
    originalRequest._retried = true

    try {
      await acquireLock(async () => {
        const lastRefresh = Number(
          localStorage.getItem("momiji_last_refresh_ts") || 0
        )

        if (Date.now() - lastRefresh < 5000) {
          return
        }
        await apiAxios.post("/auth/refresh")
        localStorage.setItem("momiji_last_refresh_ts", Date.now().toString())

        await new Promise((res) => setTimeout(res, 50))
      })

      return apiAxios(originalRequest)
    } catch (err) {
      useAuthStore.getState().clearUser()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
      return Promise.reject(err)
    }
  }

  if (
    shouldSkipRefresh &&
    (status === 404 || status === 500 || status === 401)
  ) {
    try {
      const { useCartStore } = await import("@/lib/stores/cart.store")
      useCartStore.getState().setSessionId(null, null)

      const isGetRequest = originalRequest.method?.toLowerCase() === "get"
      const isCartPath = originalRequest.url?.includes("/cart")

      if (!originalRequest._retried && isGetRequest && isCartPath) {
        originalRequest._retried = true

        const sessionRes = await axios.post(
          API_BASE_URL + "/cart/session",
          {},
          { headers: { Accept: "application/json" } }
        )
        const sessionData = sessionRes.data?.data
        const sId = sessionData?.sessionId || sessionData?.session_id
        const eAt = sessionData?.expiresAt || sessionData?.expires_at

        if (sId) {
          useCartStore.getState().setSessionId(sId, eAt)
          originalRequest.headers.set("x-session-id", sId)
          return apiAxios(originalRequest)
        }
      }
    } catch (err) {
      console.warn("Failed to auto-recover guest cart session", err)
    }
  }

  return Promise.reject(new ApiError(message, status, payload))
}

const apiAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
})

apiAxios.interceptors.request.use(onRequest, onRequestError)
apiAxios.interceptors.response.use((response) => response, onResponseError)

export { apiAxios, ApiError }
export type { ApiErrorPayload }
