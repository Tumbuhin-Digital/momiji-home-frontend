export type SettlementStatus = "pending" | "invoiced" | "paid"

export interface PreorderSettlement {
  balanceAmount: number
  createdAt: string
  dueDate: string
  id: string
  invoicedAt: string | null
  orderId: string
  orderLineItemId: string
  paidAt: string | null
  status: SettlementStatus
}
