import type { SettlementStatus } from "./entities"

export interface PreorderSettlementDto {
  id: string
  order_id: string
  order_line_item_id: string
  balance_amount: number
  status: string
  created_at: string
  due_date: string
  invoiced_at: string
  paid_at: string
}

export interface PreorderQueryParams {
  status?: SettlementStatus
  page?: number
  limit?: number
}
