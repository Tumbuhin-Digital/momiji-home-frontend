import { toast } from "sonner"

import { deleteCookie } from "./cookie"
import { ApiError } from "@/lib/api/axios"

type NotificationType = "success" | "destructive" | "default"

const DEFAULT_ERROR_MESSAGE = "An unknown error occurred."
const NETWORK_ERROR_MESSAGE =
  "There was a problem connecting to the server. Please check your connection or contact the admin."

const showNotification = (
  type: NotificationType,
  message: string,
  description: string
) => {
  switch (type) {
    case "destructive":
      toast.error(message, { description })
      break

    default:
      toast(message, { description })
      break
  }
}

const getErrorDescription = (error: Error | ApiError): string => {
  if (error instanceof ApiError && error.payload) {
    // If the payload has an "error.details" nested structure
    // (This matches the previous error.response.data.error.details logic)
    const errorData = error.payload as Record<string, unknown>
    const nestedError = errorData.error as Record<string, unknown> | undefined
    const details = nestedError?.details || errorData.details
    if (details) {
      return Array.isArray(details) ? details.join(", ") : String(details)
    }
    return String(errorData.message || error.message)
  }
  return error.message || DEFAULT_ERROR_MESSAGE
}

const handleSpecificError = (
  status: number | undefined,
  description: string
): { message: string; errorMessage: string } => {
  switch (status) {
    case 400:
      return { message: "An error occurred", errorMessage: description }
    case 401:
      return {
        message: "Unauthorized",
        errorMessage: description || "Incorrect email or password.",
      }
    case 403:
      return {
        message: "Forbidden",
        errorMessage:
          "You do not have the required permissions to access this resource. Contact the system administrator to request access.",
      }
    case 404:
      return { message: "Page Not Found", errorMessage: description }
    case 500:
      return {
        message: "Server Error",
        errorMessage:
          description ||
          "A server error occurred. Please contact the admin and try again later.",
      }
    default:
      return {
        message: "Error",
        errorMessage: description || DEFAULT_ERROR_MESSAGE,
      }
  }
}

export const handleApiError = async (err: Error | unknown) => {
  console.error("Global Error Caught: ", err)

  if (!(err instanceof Error)) {
    showNotification("destructive", "Error", DEFAULT_ERROR_MESSAGE)
    return { error: true, message: DEFAULT_ERROR_MESSAGE }
  }

  if (err instanceof ApiError) {
    const status = err.status

    if (status === 401) {
      // Dynamic import to avoid circular dependencies
      const { useAuthStore } = await import("@/lib/stores/auth.store")
      const isAuthenticated = useAuthStore.getState().isAuthenticated

      if (isAuthenticated) {
        // If they were authenticated, their session expired.
        await deleteCookie("isLoggedIn")

        showNotification(
          "destructive",
          "Session Expired",
          "Your session has expired. Please log in again."
        )

        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }, 3000)

        return { error: true, message: "Session expired" }
      }

      // If they were never authenticated (guest), fail silently for endpoints like /cart
      return { error: true, message: "Unauthorized" }
    }

    if (!status && err.message === "Network Error") {
      showNotification("destructive", "Network Issue", NETWORK_ERROR_MESSAGE)
      return { error: true, message: NETWORK_ERROR_MESSAGE }
    }

    const description = getErrorDescription(err)
    const { message, errorMessage } = handleSpecificError(status, description)

    showNotification("destructive", message, errorMessage)
    return { error: true, message: errorMessage }
  }

  // Generic Error handling
  if (err.message === "Network Error" || err.message.includes("Network")) {
    showNotification("destructive", "Network Issue", NETWORK_ERROR_MESSAGE)
    return { error: true, message: NETWORK_ERROR_MESSAGE }
  }

  showNotification("destructive", "Error", err.message || DEFAULT_ERROR_MESSAGE)
  return { error: true, message: err.message }
}
