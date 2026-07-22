import type { CartItemDto, CartResponseDto, CartSummaryDto } from "@/types/cart"

export interface VariantCartMeta {
  title: string
  image_src: string
  unit_price: string
  inventory_quantity: number
  isForcedPreOrder?: boolean
}

export function splitVariantQuantity(
  totalQty: number,
  inventoryQty: number,
  isForcedPreOrder = false
): { shipReadyQty: number; preOrderQty: number } {
  if (totalQty <= 0) {
    return { shipReadyQty: 0, preOrderQty: 0 }
  }

  if (isForcedPreOrder) {
    return { shipReadyQty: 0, preOrderQty: totalQty }
  }

  if (totalQty <= inventoryQty) {
    return { shipReadyQty: totalQty, preOrderQty: 0 }
  }

  return {
    shipReadyQty: inventoryQty,
    preOrderQty: totalQty - inventoryQty,
  }
}

export function getVariantTotalQty(
  cart: CartResponseDto | undefined,
  variantId: string
): number {
  if (!cart) return 0

  const shipQty =
    cart.ship_ready.find((item) => item.variant_id === variantId)?.quantity ?? 0
  const preQty =
    cart.pre_order.find((item) => item.variant_id === variantId)?.quantity ?? 0

  return shipQty + preQty
}

function buildCartItem(
  variantId: string,
  quantity: number,
  fulfillmentType: "ship_ready" | "pre_order",
  meta: VariantCartMeta,
  existingItem?: CartItemDto
): CartItemDto {
  const unitPrice = parseFloat(meta.unit_price || "0")
  const subtotal = unitPrice * quantity

  const item: CartItemDto = {
    id: existingItem?.id ?? `local-${variantId}-${fulfillmentType}`,
    variant_id: variantId,
    title: meta.title,
    image_src: meta.image_src,
    quantity,
    inventory_quantity: meta.inventory_quantity,
    unit_price: meta.unit_price,
    subtotal: subtotal.toFixed(2),
  }

  if (fulfillmentType === "pre_order" && quantity > 0) {
    const deposit = subtotal * 0.5
    const balance = subtotal - deposit
    item.deposit_amount = deposit.toFixed(2)
    item.balance_due = balance.toFixed(2)
  }

  return item
}

function upsertCartItem(
  items: CartItemDto[],
  variantId: string,
  newItem: CartItemDto | null
): CartItemDto[] {
  const index = items.findIndex((item) => item.variant_id === variantId)

  if (!newItem || newItem.quantity <= 0) {
    return items.filter((item) => item.variant_id !== variantId)
  }

  if (index === -1) {
    return [...items, newItem]
  }

  return items.map((item, i) => (i === index ? newItem : item))
}

function recalculateSummary(
  shipReady: CartItemDto[],
  preOrder: CartItemDto[]
): CartSummaryDto {
  let totalShipReady = 0
  let totalPreOrder = 0
  let totalDeposit = 0
  let totalBalanceDue = 0
  let totalChargedNow = 0

  for (const item of shipReady) {
    const subtotal = parseFloat(item.subtotal || "0")
    totalShipReady += subtotal
    totalChargedNow += subtotal
  }

  for (const item of preOrder) {
    const subtotal = parseFloat(item.subtotal || "0")
    const deposit = parseFloat(item.deposit_amount || "0")
    const balance = parseFloat(item.balance_due || "0")
    totalPreOrder += subtotal
    totalDeposit += deposit
    totalBalanceDue += balance
    totalChargedNow += deposit
  }

  return {
    currency: "USD",
    total_ship_ready: totalShipReady.toFixed(2),
    total_pre_order: totalPreOrder.toFixed(2),
    total_deposit: totalDeposit.toFixed(2),
    total_balance_due: totalBalanceDue.toFixed(2),
    total_charged_now: totalChargedNow.toFixed(2),
  }
}

export function applyVariantToCart(
  cart: CartResponseDto | undefined,
  variantId: string,
  totalQty: number,
  meta: VariantCartMeta
): CartResponseDto {
  const base: CartResponseDto = cart ?? {
    session_id: "",
    ship_ready: [],
    pre_order: [],
    summary: {
      currency: "USD",
      total_ship_ready: "0",
      total_pre_order: "0",
      total_deposit: "0",
      total_balance_due: "0",
      total_charged_now: "0",
    },
  }

  const { shipReadyQty, preOrderQty } = splitVariantQuantity(
    totalQty,
    meta.inventory_quantity,
    meta.isForcedPreOrder
  )

  const existingShip = base.ship_ready.find(
    (item) => item.variant_id === variantId
  )
  const existingPre = base.pre_order.find(
    (item) => item.variant_id === variantId
  )

  const shipReady = upsertCartItem(
    base.ship_ready,
    variantId,
    shipReadyQty > 0
      ? buildCartItem(
          variantId,
          shipReadyQty,
          "ship_ready",
          meta,
          existingShip
        )
      : null
  )

  const preOrder = upsertCartItem(
    base.pre_order,
    variantId,
    preOrderQty > 0
      ? buildCartItem(variantId, preOrderQty, "pre_order", meta, existingPre)
      : null
  )

  return {
    ...base,
    ship_ready: shipReady,
    pre_order: preOrder,
    summary: recalculateSummary(shipReady, preOrder),
  }
}

export function extractVariantMetaFromCart(
  cart: CartResponseDto | undefined,
  variantId: string,
  fallback?: Partial<VariantCartMeta>
): VariantCartMeta | null {
  const existingShip = cart?.ship_ready.find(
    (item) => item.variant_id === variantId
  )
  const existingPre = cart?.pre_order.find(
    (item) => item.variant_id === variantId
  )
  const existing = existingShip ?? existingPre

  if (!existing && !fallback?.title) {
    return null
  }

  // Pure pre-order lines must stay forced; otherwise Shopify inventory_quantity
  // re-splits them into ship_ready and corrupts totals while editing the cart.
  const inferredForcedPreOrder =
    fallback?.isForcedPreOrder ??
    (Boolean(existingPre) && !existingShip)

  return {
    title: existing?.title ?? fallback?.title ?? "",
    image_src: existing?.image_src ?? fallback?.image_src ?? "",
    unit_price: existing?.unit_price ?? fallback?.unit_price ?? "0",
    inventory_quantity:
      existing?.inventory_quantity ?? fallback?.inventory_quantity ?? 0,
    isForcedPreOrder: inferredForcedPreOrder,
  }
}
