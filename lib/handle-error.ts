import { isCancel } from "axios"
import { toastManager } from "@/components/ui/toast"
import { deleteCookie } from "./cookie"
import { ApiError } from "@/lib/api/axios"

export function isAbortError(error: unknown): boolean {
  if (isCancel(error)) return true
  if (error instanceof Error && error.name === "AbortError") return true
  return false
}

export function getErrorMessage(error: unknown): {
  title: string
  description: string
} {
  if (error instanceof ApiError) {
    const status = error.status

    if (!status) {
      return {
        title: "Connection Failed",
        description: "Please check your internet connection.",
      }
    }

    let descriptionFromPayload = ""
    if (error.payload) {
      const errorData = error.payload as Record<string, unknown>
      const nestedError = errorData.error as Record<string, unknown> | undefined
      const details = nestedError?.details || errorData.details
      if (details) {
        descriptionFromPayload = Array.isArray(details)
          ? details.join(", ")
          : String(details)
      } else if (errorData.message) {
        descriptionFromPayload = String(errorData.message)
      }
    }

    switch (status) {
      case 400:
        return {
          title: "Invalid Request",
          description:
            descriptionFromPayload || "The request parameters are incorrect.",
        }
      case 401:
        return {
          title: "Unauthenticated",
          description: descriptionFromPayload || "Your session has expired.",
        }
      case 403:
        return {
          title: "Access Denied",
          description:
            descriptionFromPayload ||
            "You do not have permission to access this resource.",
        }
      case 404:
        return {
          title: "Data Not Found",
          description:
            descriptionFromPayload || "The requested resource is unavailable.",
        }
      case 408:
        return {
          title: "Request Timeout",
          description:
            descriptionFromPayload || "The server took too long to respond.",
        }
      case 429:
        return {
          title: "Too Many Requests",
          description:
            descriptionFromPayload ||
            "Request limit reached, please try again later.",
        }
      case 500:
        return {
          title: "Server Error",
          description:
            descriptionFromPayload || "An error occurred on the server.",
        }
      case 502:
        return {
          title: "Bad Gateway",
          description:
            descriptionFromPayload || "Gateway error, please try again later.",
        }
      case 503:
        return {
          title: "Service Unavailable",
          description:
            descriptionFromPayload ||
            "The server is currently under maintenance.",
        }
      default:
        if (descriptionFromPayload) {
          return {
            title: "Error Occurred",
            description: descriptionFromPayload,
          }
        }
        break
    }
  }

  const message =
    error instanceof Error ? error.message : "A system error occurred."
  if (message.includes("Network")) {
    return {
      title: "Connection Failed",
      description: "Please check your internet connection.",
    }
  }

  return {
    title: "Error Occurred",
    description: message,
  }
}

export const handleApiError = async (err: Error | unknown) => {
  console.error("Global Error Caught: ", err)

  if (isAbortError(err)) {
    return { error: true, message: "Request cancelled" }
  }

  if (err instanceof ApiError) {
    const status = err.status

    if (status === 401) {
      const { useAuthStore } = await import("@/lib/stores/auth.store")
      const isAuthenticated = useAuthStore.getState().isAuthenticated

      if (isAuthenticated) {
        await deleteCookie("isLoggedIn")

        toastManager.add({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          type: "error",
        })

        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }, 3000)

        return { error: true, message: "Session expired" }
      }
      return { error: true, message: "Unauthorized" }
    }
  }

  const { title, description } = getErrorMessage(err)

  toastManager.add({
    title,
    description,
    type: "error",
  })

  return { error: true, message: description }
}
