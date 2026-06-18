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

export interface PreorderGroupSettlement {
  balanceDue: string
  batchLabel: string
  createdAt?: string
  customerEmail: string
  dueDate: string
  orderId: string
  orderNumber: string
  quantity: number
  settlementId: string
  settlementStatus: SettlementStatus
}

export interface PreorderGroup {
  productName: string
  settlements: PreorderGroupSettlement[]
  totalQuantity: number
}
