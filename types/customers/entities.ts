export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  ordersCount: number
  createdAt: string
  addresses?: Address[]
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  country: string
  zip: string
  phone?: string
  isDefault: boolean
}

export interface CustomerOrder {
  id: string
  aggregateStatus: string
  totalPrice: number
  createdAt: string
}
