export type ShipReadyInventoryDepletion = {
  variantId: string
  productTitle: string
  imageUrl: string
  sku: string
  available: number
  movedToPreorder: number
  oldShipReady: number
  newShipReady: number
}

type ShipReadyInventoryDepletionApi = {
  variant_id?: string
  variantId?: string
  product_title?: string
  productTitle?: string
  image_url?: string
  imageUrl?: string
  sku?: string
  available?: number
  moved_to_preorder?: number
  movedToPreorder?: number
  old_ship_ready?: number
  oldShipReady?: number
  new_ship_ready?: number
  newShipReady?: number
}

export function mapShipReadyInventoryDepletionFromApi(
  dto: ShipReadyInventoryDepletionApi | null | undefined
): ShipReadyInventoryDepletion | null {
  if (!dto) return null
  return {
    variantId: dto.variant_id ?? dto.variantId ?? "",
    productTitle: dto.product_title ?? dto.productTitle ?? "",
    imageUrl: dto.image_url ?? dto.imageUrl ?? "",
    sku: dto.sku ?? "",
    available: dto.available ?? 0,
    movedToPreorder: dto.moved_to_preorder ?? dto.movedToPreorder ?? 0,
    oldShipReady: dto.old_ship_ready ?? dto.oldShipReady ?? 0,
    newShipReady: dto.new_ship_ready ?? dto.newShipReady ?? 0,
  }
}

export function extractShipReadyInventoryDepletionFromError(
  error: unknown
): ShipReadyInventoryDepletion | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any
  const code =
    err?.payload?.error?.code ??
    err?.response?.data?.error?.code ??
    err?.error?.code
  if (code !== "ship_ready_inventory_depleted") {
    return null
  }

  const details =
    err?.payload?.error?.details ??
    err?.response?.data?.error?.details ??
    err?.error?.details ??
    null

  if (!details || typeof details !== "object") {
    return null
  }

  return mapShipReadyInventoryDepletionFromApi(details)
}
