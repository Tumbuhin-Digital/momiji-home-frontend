import type { Order } from "./entities"

export interface CancelOrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderId: string) => Promise<void>
  isConfirming: boolean
}

export interface AcceptOrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderId: string) => Promise<void>
  isConfirming: boolean
}

export interface CustomerOrderCardProps {
  order: Order
}
