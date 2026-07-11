export type { ManualOrderCreateRequest, ManualOrderCreateResult } from "./dtos"
export type ManualLineFulfillment = "ship_ready" | "pre_order"

export interface ManualLine {
  variantId: string
  title: string
  imageSrc: string
  wsPrice: number
  retailPrice: number
  quantity: number
  fulfillmentType: ManualLineFulfillment
  inventoryQuantity: number
  weightKg?: number
  widthCm?: number
  heightCm?: number
  depthCm?: number
  batchLabel?: string
}
