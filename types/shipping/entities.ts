export interface ShippingMethod {
  cost: string
  estimatedArrival: string
  id: string
  label: string
}

export interface ShippingMethodsResult {
  currency: string
  methods: ShippingMethod[]
}

export interface ShippingCalculateInput {
  address_id?: number
  country?: string
  province?: string
  shipping_method: string
  zip?: string
}
