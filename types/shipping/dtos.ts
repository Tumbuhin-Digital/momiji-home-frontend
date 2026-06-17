export interface ShippingRateDto {
  cost: string
  currency: string
  delivery_days: number
  label: string
  service_code: string
}

export interface ValidateAddressRequest {
  city: string
  country: string
  state: string
  zip: string
}
