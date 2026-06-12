export interface RemoveItemModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName?: string
}
