export interface ShippingRateDto {
  cost: string
  currency: string
  delivery_days: number
  label: string
  service_code: string
}

export interface ShippingRatesRequest {
  address1?: string
  city?: string
  country?: string
  state?: string
  zip: string
  segment?: "ship_ready" | "pre_order"
}

export interface ValidateAddressRequest {
  city: string
  country: string
  state: string
  zip: string
}
