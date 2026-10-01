import { ApiError } from "@/lib/api/axios"

const ADDRESS_FIELDS = ["address", "address1", "city", "state", "zip"] as const

const FORM_FIELD_BY_DETAIL: Record<string, "address" | "city" | "state" | "zipCode"> = {
  address: "address",
  address1: "address",
  city: "city",
  state: "state",
  zip: "zipCode",
}

export type ShippingErrorDetails = Record<string, string>

export type ShippingErrorInfo = {
  code?: string
  message: string
  details: ShippingErrorDetails
}

type ErrorBody = {
  message?: string
  error?: {
    code?: string
    details?: unknown
  }
}

function asErrorBody(value: unknown): ErrorBody | undefined {
  if (!value || typeof value !== "object") return undefined
  return value as ErrorBody
}

function normalizeDetails(details: unknown): ShippingErrorDetails {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return {}
  }
  const out: ShippingErrorDetails = {}
  for (const [key, value] of Object.entries(details)) {
    if (value == null) continue
    out[key] = String(value)
  }
  return out
}

export function readShippingError(error: unknown): ShippingErrorInfo {
  const fallback = "Shipping rates could not be loaded."
  if (error instanceof ApiError) {
    const body = asErrorBody(error.payload)
    return {
      code: body?.error?.code,
      message: body?.message || error.message || fallback,
      details: normalizeDetails(body?.error?.details),
    }
  }

  if (error && typeof error === "object") {
    const err = error as {
      message?: string
      response?: { data?: unknown }
    }
    const body = asErrorBody(err.response?.data)
    if (body) {
      return {
        code: body.error?.code,
        message: body.message || err.message || fallback,
        details: normalizeDetails(body.error?.details),
      }
    }
    if (err.message) {
      return { message: err.message, details: {} }
    }
  }

  return { message: fallback, details: {} }
}

export function shippingErrorDescription(error: unknown): string {
  const parsed = readShippingError(error)
  const fieldMessages = [
    ...new Set(
      ADDRESS_FIELDS.map((key) => parsed.details[key]).filter(
        (value): value is string => Boolean(value)
      )
    ),
  ]
  if (fieldMessages.length > 0) {
    return fieldMessages.join(" ")
  }

  const extras = ["sku", "missing_dimensions", "service_code", "carrier_message"]
    .map((key) => parsed.details[key])
    .filter((value): value is string => Boolean(value))
    .filter((value) => !parsed.message.includes(value))

  if (extras.length === 0) return parsed.message
  return [parsed.message, ...extras].join("\n")
}

export function applyAddressFieldErrors(
  error: unknown,
  setError: (
    name: "address" | "city" | "state" | "zipCode",
    error: { type: "manual"; message: string }
  ) => void
): string {
  const parsed = readShippingError(error)
  let applied = false
  for (const [key, field] of Object.entries(FORM_FIELD_BY_DETAIL)) {
    const message = parsed.details[key]
    if (!message) continue
    setError(field, { type: "manual", message })
    applied = true
  }
  if (!applied) {
    setError("address", { type: "manual", message: parsed.message })
  }
  return shippingErrorDescription(error)
}
