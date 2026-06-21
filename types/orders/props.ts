import type { Order } from "./entities"

export interface CancelOrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderId: string, reason: string) => Promise<void>
  isConfirming: boolean
}

export interface SecondPaymentConfirmationModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderId: string) => Promise<void>
  isConfirming: boolean
  error?: string
}

export interface CustomerOrderCardProps {
  order: Order
}

export interface SalesReportDetailModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
}
