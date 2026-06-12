export interface Customer {
  addresses?: Address[]
  createdAt: string
  email: string
  firstName: string
  id: string
  lastName: string
  ordersCount: number
  phone?: string
}

export interface Address {
  address1: string
  address2?: string
  city: string
  country: string
  firstName: string
  id: string
  isDefault: boolean
  lastName: string
  phone?: string
  province: string
  zip: string
}

export interface CustomerOrder {
  aggregateStatus: string
  createdAt: string
  id: string
  totalPrice: number
}
