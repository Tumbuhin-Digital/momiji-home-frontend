export interface ShippingMethod {
  id: string
  label: string
  cost: string
  estimatedArrival: string
}

export interface ShippingMethodsResult {
  currency: string
  methods: ShippingMethod[]
}

export interface ShippingCalculateInput {
  shipping_method: string
  address_id?: number
  country?: string
  province?: string
  zip?: string
}
