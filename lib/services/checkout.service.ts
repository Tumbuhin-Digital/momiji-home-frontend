import { apiClient } from "@/lib/api"

import type {
  CheckoutConfirmResponseDto,
  CheckoutConfirmResult,
  CheckoutCreateInput,
  CheckoutCreateResponseDto,
  CheckoutItem,
  CheckoutItemDto,
  CheckoutSummary,
  CheckoutSummaryDto,
  CheckoutSummaryInput,
} from "@/types/checkout"
import type { BaseResponse } from "@/types/core"

function mapCheckoutItemToDomain(dto: CheckoutItemDto): CheckoutItem {
  return {
    id: dto.id,
    variantId: dto.variant_id,
    title: dto.title,
    imageSrc: dto.image_src,
    quantity: dto.quantity,
    unitPrice: dto.unit_price,
    subtotal: dto.subtotal,
    depositAmount: dto.deposit_amount,
    balanceDue: dto.balance_due,
  }
}

function mapCheckoutSummaryToDomain(dto: CheckoutSummaryDto): CheckoutSummary {
  return {
    currency: dto.currency,
    dueNow: {
      shipReadyTotal: dto.due_now.ship_ready_total,
      preorderDeposit: dto.due_now.preorder_deposit,
      shipping: dto.due_now.shipping,
      total: dto.due_now.total,
    },
    dueAugust: {
      preorderBalance: dto.due_august.preorder_balance,
      shippingPreorder: dto.due_august.shipping_preorder,
      total: dto.due_august.total,
    },
    shipReady: {
      items: dto.ship_ready.items.map(mapCheckoutItemToDomain),
      subtotal: dto.ship_ready.subtotal,
    },
    preOrder: {
      items: dto.pre_order.items.map(mapCheckoutItemToDomain),
      depositSubtotal: dto.pre_order.deposit_subtotal,
      balanceSubtotal: dto.pre_order.balance_subtotal,
    },
    shipping: {
      method: dto.shipping.method,
      cost: dto.shipping.cost,
      estimatedArrival: dto.shipping.estimated_arrival,
    },
  }
}

async function getSummary(
  input: CheckoutSummaryInput
): Promise<CheckoutSummary> {
  const response = await apiClient.post<BaseResponse<CheckoutSummaryDto>>(
    "/checkout/summary",
    input
  )

  if (!response.data) {
    throw new Error("Failed to load checkout summary")
  }

  return mapCheckoutSummaryToDomain(response.data)
}

async function createCheckout(
  input: CheckoutCreateInput
): Promise<{
  checkoutUrl: string
  checkoutReference: string
  expiresAt: string | null
}> {
  const response = await apiClient.post<
    BaseResponse<CheckoutCreateResponseDto>
  >("/checkout", input)

  if (!response.data || !response.data.checkout_url) {
    throw new Error("Failed to create checkout")
  }

  return {
    checkoutUrl: response.data.checkout_url,
    checkoutReference: response.data.checkout_reference || "",
    expiresAt: response.data.expires_at || null,
  }
}

async function releaseCheckout(input?: {
  checkoutReference?: string
}): Promise<void> {
  await apiClient.post<BaseResponse<null>>("/checkout/release", {
    checkout_reference: input?.checkoutReference,
  })
}

// GET /checkout/confirm?checkout_reference=<id>
async function getCheckoutConfirm(
  checkoutReference: string
): Promise<CheckoutConfirmResult> {
  const response = await apiClient.get<
    BaseResponse<CheckoutConfirmResponseDto>
  >("/checkout/confirm", { params: { checkout_reference: checkoutReference } })

  if (!response.data) {
    throw new Error("Failed to get checkout confirmation")
  }

  const d = response.data
  return {
    orderNumber: d.order_number,
    financialStatus: d.financial_status,
    customerEmail: d.customer_email,
    orderDate: d.order_date,
    totalBalanceDue: parseFloat(d.total_balance_due || "0"),
    totalChargedNow: parseFloat(d.total_charged_now || "0"),
    totalPrice: parseFloat(d.total_price || "0"),
    items: (d.items || []).map((item) => ({
      title: item.title,
      amountCharged: parseFloat(item.amount_charged || "0"),
      balanceDue: parseFloat(item.balance_due || "0"),
      itemStatus: item.item_status,
      quantity: item.quantity,
      type: item.type,
    })),
  }
}

export const checkoutService = {
  createCheckout,
  getCheckoutConfirm,
  getSummary,
  releaseCheckout,
}
