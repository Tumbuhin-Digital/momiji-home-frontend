export interface CheckoutItem {
  id: string
  variantId: string
  title: string
  imageSrc: string
  quantity: number
  unitPrice: string
  subtotal: string
  depositAmount: string
  balanceDue: string
}

export interface CheckoutSummary {
  currency: string
  dueNow: {
    shipReadyTotal: string
    preorderDeposit: string
    shipping: string
    total: string
  }
  dueAugust: {
    preorderBalance: string
    shippingPreorder: string
    total: string
  }
  shipReady: { items: CheckoutItem[]; subtotal: string }
  preOrder: {
    items: CheckoutItem[]
    depositSubtotal: string
    balanceSubtotal: string
  }
  shipping: { method: string; cost: string; estimatedArrival: string }
}

export interface CheckoutSummaryInput {
  address_id?: number
  email?: string
  shipping_method: string
}

export interface CheckoutCreateInput {
  address1?: string
  address_id?: number
  city?: string
  country?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  shipping_method: string
  state?: string
  zip?: string
}

export interface CheckoutConfirmResult {
  orderNumber: string
  status: string
}
