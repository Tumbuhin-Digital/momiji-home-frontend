import DOMPurify from "isomorphic-dompurify"

export const sanitizeData = (data: unknown): unknown => {
  try {
    if (!data) {
      return data
    }

    if (typeof data === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(data)) {
        return data
      }
      const trimmedData = data?.trim()
      return DOMPurify.sanitize(trimmedData)
    }

    if (Array.isArray(data)) {
      return data.map((item) => {
        if (typeof item === "string") {
          const trimmedItem = item?.trim()
          return sanitizeData(trimmedItem)
        }
        return sanitizeData(item)
      })
    }

    if (typeof data === "object") {
      const sanitizedData: { [key: string]: unknown } = {}
      for (const [key, value] of Object.entries(data)) {
        const trimmedValue = typeof value === "string" ? value?.trim() : value
        sanitizedData[key] = sanitizeData(trimmedValue)
      }
      return sanitizedData
    }

    return data
  } catch (error) {
    console.error("Error sanitizing data:", error)
    return data
  }
}

export const sanitizeUrl = (url: string): string => {
  try {
    const [basePath, queryString] = url.split("?")

    const pathParts = basePath.split("/")
    const sanitizedPathParts = pathParts.map((part) =>
      sanitizeData(decodeURIComponent(part))
    )
    const sanitizedBasePath = sanitizedPathParts.join("/")

    if (!queryString) {
      return sanitizedBasePath
    }

    const searchParams = new URLSearchParams(queryString)
    const sanitizedParams = new URLSearchParams()

    searchParams.forEach((value, key) => {
      sanitizedParams.append(
        sanitizeData(key) as string,
        sanitizeData(decodeURIComponent(value)) as string
      )
    })

    const sanitizedQueryString = sanitizedParams.toString()
    return sanitizedQueryString
      ? `${sanitizedBasePath}?${sanitizedQueryString}`
      : sanitizedBasePath
  } catch (error) {
    console.error("Error sanitizing URL:", error)
    return url
  }
}
