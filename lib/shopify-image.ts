export function isShopifyCdnUrl(src: string): boolean {
  if (!src) return false
  try {
    return new URL(src).hostname === "cdn.shopify.com"
  } catch {
    return false
  }
}

export function withShopifyWidth(src: string, width: number): string {
  if (!src || !isShopifyCdnUrl(src)) return src

  try {
    const url = new URL(src)
    url.searchParams.set("width", String(width))
    return url.toString()
  } catch {
    return src
  }
}
