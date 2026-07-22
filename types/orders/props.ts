import type {
  Order,
  OrderFulfillmentSegment,
  OrderLineItem,
  PreorderShipment,
} from "./entities"

export interface CancelOrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderId: string, reason: string) => Promise<void>
  isConfirming: boolean
}

export interface PreorderCalculateShippingModalProps {
  order: Order
  items: OrderLineItem[]
  isOpen: boolean
  onClose: () => void
  mode?: "initial" | "edit"
  onSaved?: () => void
  onShippingConfigured?: () => void
  batchId?: string | null
  shipment?: PreorderShipment
}

export interface SecondPaymentConfirmationModalProps {
  order: Order
  segment?: OrderFulfillmentSegment | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderId: string, batchId?: string | null) => Promise<void>
  isConfirming: boolean
  error?: string
  shippingTotal?: number
  groupBalanceDue?: number
}

export interface CustomerOrderCardProps {
  order: Order
}

export interface SalesReportDetailModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
}
