export interface CheckoutNotes {
  dueNowNote: string
  dueLaterNote: string
}

export interface UpdateCheckoutNotesInput {
  dueNowNote: string
  dueLaterNote: string
}

export type WarehouseCode = "east" | "west"

export interface Warehouse {
  code: WarehouseCode
  name: string
  phone: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  shipstationWarehouseId?: string | null
  groundServiceCode?: string | null
  isDefault: boolean
}

export interface UpdateWarehouseInput {
  name: string
  phone: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  shipstationWarehouseId?: string | null
  groundServiceCode?: string | null
}
