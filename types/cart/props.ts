export interface RemoveItemModalProps {
  isOpen: boolean
  isPending?: boolean
  onClose: () => void
  onConfirm: () => void
  productName?: string
}
