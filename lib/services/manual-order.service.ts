import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  ManualOrderCreateRequest,
  ManualOrderCreateResponseDto,
  ManualOrderCreateResult,
} from "@/types/manual-order"

function mapResponse(dto: ManualOrderCreateResponseDto): ManualOrderCreateResult {
  return {
    invoiceUrl: dto.invoice_url,
    checkoutReference: dto.checkout_reference,
    draftOrderId: dto.draft_order_id,
    invoiceEmailSent: dto.invoice_email_sent,
  }
}

async function createManualOrder(
  input: ManualOrderCreateRequest
): Promise<ManualOrderCreateResult> {
  const response = await apiClient.post<
    BaseResponse<ManualOrderCreateResponseDto>
  >("/orders/manual", input)

  if (!response.data) {
    throw new Error("Failed to create manual order invoice")
  }

  return mapResponse(response.data)
}

export const manualOrderService = {
  createManualOrder,
}
