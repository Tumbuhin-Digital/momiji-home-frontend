import type { Order, OrderLineItem } from "./entities"

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

export interface PreorderCalculateShippingModalProps {
  order: Order
  items: OrderLineItem[]
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
  onShippingConfigured?: () => void
}

export interface CustomerOrderCardProps {
  order: Order
}

export interface SalesReportDetailModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
}
