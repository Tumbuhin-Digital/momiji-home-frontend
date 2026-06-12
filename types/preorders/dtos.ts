import type { SettlementStatus } from "./entities"

export interface PreorderSettlementDto {
  balance_amount: number
  created_at: string
  due_date: string
  id: string
  invoiced_at: string
  order_id: string
  order_line_item_id: string
  paid_at: string
  status: string
}

export interface PreorderQueryParams {
  limit?: number
  page?: number
  status?: SettlementStatus
}
