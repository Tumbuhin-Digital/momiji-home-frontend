export interface ShippingMethodDto {
  id: string
  label: string
  cost: string
  estimated_arrival: string
}

export interface ShippingMethodsResultDto {
  currency: string
  methods: ShippingMethodDto[]
}

export interface ValidateAddressRequest {
  city: string
  country: string
  state: string
  zip: string
}
