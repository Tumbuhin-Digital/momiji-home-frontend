export interface ShippingMethodDto {
  cost: string
  estimated_arrival: string
  id: string
  label: string
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
