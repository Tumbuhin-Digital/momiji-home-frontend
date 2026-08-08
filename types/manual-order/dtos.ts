export interface ManualOrderLineItemDto {
  variant_id: string
  quantity: number
}

export interface ManualOrderCreateRequest {
  email: string
  first_name: string
  last_name: string
  company?: string
  phone: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  same_as_shipping?: boolean
  billing_first_name?: string
  billing_last_name?: string
  billing_company?: string
  billing_address1?: string
  billing_city?: string
  billing_state?: string
  billing_zip?: string
  billing_country?: string
  billing_phone?: string
  shipping_method?: string
  origin?: "east" | "west"
  ship_together?: boolean
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
