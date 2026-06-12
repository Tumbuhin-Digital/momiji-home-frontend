import { API_BASE_URL } from "./env"

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

async function fetcher<TResponse>(
  path: string,
  options: FetchOptions = {}
): Promise<TResponse> {
  const { body, headers, ...restOptions } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = "Unexpected error while calling API"

    try {
      const payload = (await response.json()) as { message?: string }
      message = payload.message ?? message
    } catch {}

    throw new Error(message)
  }

  return (await response.json()) as TResponse
}

export { fetcher }
