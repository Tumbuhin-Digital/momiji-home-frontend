export interface CheckoutItem {
  balanceDue: string
  depositAmount: string
  id: string
  imageSrc: string
  quantity: number
  subtotal: string
  title: string
  unitPrice: string
  variantId: string
}

export interface CheckoutSummary {
  currency: string
  dueAugust: {
    preorderBalance: string
    shippingPreorder: string
    total: string
  }
  dueNow: {
    preorderDeposit: string
    shipReadyTotal: string
    shipping: string
    total: string
  }
  preOrder: {
    balanceSubtotal: string
    depositSubtotal: string
    items: CheckoutItem[]
  }
  shipReady: { items: CheckoutItem[]; subtotal: string }
  shipping: { cost: string; estimatedArrival: string; method: string }
}

export interface CheckoutSummaryInput {
  address_id: number
  shipping_method?: string
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
