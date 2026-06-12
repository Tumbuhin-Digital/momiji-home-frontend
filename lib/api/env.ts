const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "15000")

export { API_BASE_URL, API_TIMEOUT_MS }
