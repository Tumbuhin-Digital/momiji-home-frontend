export interface CheckoutNotesDto {
  due_now_note: string
  due_later_note: string
}

export interface UpdateCheckoutNotesDto {
  due_now_note: string
  due_later_note: string
}

export interface WarehouseDto {
  code: "east" | "west"
  name: string
  phone: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  shipstation_warehouse_id?: string | null
  ground_service_code?: string | null
  is_default: boolean
}

export interface WarehouseListDto {
  warehouses: WarehouseDto[]
}

export interface UpdateWarehouseDto {
  name: string
  phone: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  shipstation_warehouse_id?: string | null
  ground_service_code?: string | null
}
