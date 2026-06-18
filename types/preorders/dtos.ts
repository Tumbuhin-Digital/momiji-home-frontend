import type { SettlementStatus } from "./entities"

export interface PreorderSettlementDto {
  balance_amount: number
  created_at: string
  due_date: string
  id: string
  invoiced_at: string | null
  order_id: string
  order_line_item_id: string
  paid_at: string | null
  status: string
}

export interface PreorderGroupSettlementDto {
  balance_due: string
  batch_label: string
  created_at?: string
  customer_email: string
  due_date: string
  order_id: string
  order_number: string
  quantity: number
  settlement_id: string
  settlement_status: string
}

export interface PreorderGroupResponseDto {
  product_name: string
  settlements: PreorderGroupSettlementDto[]
  total_quantity: number
}

export interface PreorderQueryParams {
  batch_label?: string
  limit?: number
  page?: number
  status?: SettlementStatus
}
