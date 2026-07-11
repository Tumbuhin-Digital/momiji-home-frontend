export interface ManualOrderLineItemDto {
  variant_id: string
  quantity: number
}

export interface ManualOrderCreateRequest {
  email: string
  first_name: string
  last_name: string
  phone: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  shipping_method?: string
  origin?: "east" | "west"
  line_items: ManualOrderLineItemDto[]
}

export interface ManualOrderCreateResponseDto {
  invoice_url: string
  checkout_reference: string
  draft_order_id: string
  invoice_email_sent: boolean
}

export interface ManualOrderCreateResult {
  invoiceUrl: string
  checkoutReference: string
  draftOrderId: string
  invoiceEmailSent: boolean
}
