/* eslint-disable @typescript-eslint/no-explicit-any */
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

function isOnCheckoutPage(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/checkout")
  )
}

async function onRequest(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
  config.headers.set("Accept", "application/json")

  if (!config.headers.get("Content-Type") && config.method !== "get") {
    config.headers.set("Content-Type", "application/json")
  }

  if (typeof window !== "undefined") {
    try {
      const { useCartStore } = await import("@/lib/stores/cart.store")
      const state = useCartStore.getState()
      const sessionId = state.sessionId
      const expiresAt = state.expiresAt

      if (sessionId) {
        if (
          expiresAt &&
          new Date(expiresAt).getTime() < Date.now() &&
          !isOnCheckoutPage()
        ) {
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

function onRequestError(error: AxiosError): Promise<never> {
  return Promise.reject(error)
}

let localLock: Promise<void> | null = null

async function acquireLock(callback: () => Promise<void>): Promise<any> {
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

async function onResponseError(
  error: AxiosError<ApiErrorPayload>
): Promise<any> {
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

  if (shouldSkipRefresh && status === 401 && !isOnCheckoutPage()) {
    try {
      const { useCartStore } = await import("@/lib/stores/cart.store")
      const isGetRequest = originalRequest.method?.toLowerCase() === "get"
      const isCartPath = originalRequest.url?.includes("/cart")
      const hadSession = Boolean(useCartStore.getState().sessionId)

      if (hadSession) {
        useCartStore.getState().setSessionId(null, null)
      }

      if (
        !originalRequest._retried &&
        isGetRequest &&
        isCartPath &&
        !hadSession
      ) {
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
apiAxios.interceptors.response.use((response) => {
  if (typeof window !== "undefined") {
    const method = response.config.method?.toUpperCase()
    const url = response.config.url || ""

    if (
      method === "POST" ||
      method === "PATCH" ||
      method === "DELETE" ||
      method === "PUT"
    ) {
      // Exclude background, internal, or highly repetitive cart operations to prevent toast spam
      const isExcluded =
        url.includes("/auth/refresh") ||
        url.includes("/cart/session") ||
        url.includes("/cart/items") ||
        url.includes("/shipping/calculate") ||
        url.includes("/shipping/validate-address") ||
        url.includes("/checkout/summary")

      if (!isExcluded) {
        import("@/components/ui/toast")
          .then(({ toastManager }) => {
            const data = response.data as any
            const backendMessage = data?.message

            let title = "Success"
            if (method === "POST") title = "Action Successful"
            if (method === "PATCH" || method === "PUT")
              title = "Update Successful"
            if (method === "DELETE") title = "Delete Successful"

            const description =
              backendMessage || "Changes have been saved successfully."

            toastManager.add({
              type: "success",
              title,
              description,
            })
          })
          .catch((err) => {
            console.warn("Failed to load toastManager", err)
          })
      }
    }
  }
  return response
}, onResponseError)

export { apiAxios, ApiError }
export type { ApiErrorPayload }
