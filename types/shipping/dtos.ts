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
  origin?: "east" | "west"
  line_items?: Array<{
    variant_id: string
    quantity: number
  }>
}

export interface ValidateAddressRequest {
  city: string
  country: string
  state: string
  zip: string
}
