/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  PreorderQueryParams,
  PreorderSettlement,
  PreorderSettlementDto,
  SettlementStatus,
} from "@/types/preorders"

function mapPreorderDtoToDomain(
  dto: PreorderSettlementDto
): PreorderSettlement {
  return {
    id: dto.id,
    orderId: dto.order_id,
    orderLineItemId: dto.order_line_item_id,
    balanceAmount: dto.balance_amount,
    status: dto.status as SettlementStatus,
    createdAt: dto.created_at,
    dueDate: dto.due_date,
    invoicedAt: dto.invoiced_at,
    paidAt: dto.paid_at,
  }
}

async function getSettlements(
  params: PreorderQueryParams = {}
): Promise<PreorderSettlement[]> {
  const response = await apiClient.get<BaseResponse<any>>("/preorders", {
    params,
  })

  const responseData = response.data || {}
  const items = Array.isArray(responseData)
    ? responseData
    : (responseData.settlements ??
      responseData.preorders ??
      responseData.data ??
      [])

  return items.map(mapPreorderDtoToDomain)
}

async function getSettlementById(
  id: string
): Promise<PreorderSettlement | null> {
  const response = await apiClient.get<BaseResponse<PreorderSettlementDto>>(
    `/preorders/settlements/${id}`
  )

  if (!response.data) {
    return null
  }

  return mapPreorderDtoToDomain(response.data)
}

async function invoiceSettlement(id: string): Promise<PreorderSettlement> {
  const response = await apiClient.patch<BaseResponse<PreorderSettlementDto>>(
    `/preorders/settlements/${id}/invoice`
  )

  if (!response.data) {
    throw new Error("Failed to invoice settlement")
  }

  return mapPreorderDtoToDomain(response.data)
}

async function paidSettlement(id: string): Promise<PreorderSettlement> {
  const response = await apiClient.patch<BaseResponse<PreorderSettlementDto>>(
    `/preorders/settlements/${id}/paid`
  )

  if (!response.data) {
    throw new Error("Failed to mark settlement as paid")
  }

  return mapPreorderDtoToDomain(response.data)
}

export const preorderService = {
  getSettlements,
  getSettlementById,
  invoiceSettlement,
  paidSettlement,
}
