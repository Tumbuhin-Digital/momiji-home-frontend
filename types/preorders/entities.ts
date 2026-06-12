export type SettlementStatus = "pending" | "invoiced" | "paid"

export interface PreorderSettlement {
  id: string
  orderId: string
  orderLineItemId: string
  balanceAmount: number
  status: SettlementStatus
  createdAt: string
  dueDate: string
  invoicedAt: string | null
  paidAt: string | null
}
