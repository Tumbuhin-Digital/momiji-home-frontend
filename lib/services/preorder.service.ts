/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  PreorderGroup,
  PreorderGroupResponseDto,
  PreorderGroupSettlement,
  PreorderGroupSettlementDto,
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

function mapGroupSettlementDtoToDomain(
  dto: PreorderGroupSettlementDto
): PreorderGroupSettlement {
  return {
    balanceDue: dto.balance_due,
    batchLabel: dto.batch_label,
    createdAt: dto.created_at,
    customerEmail: dto.customer_email,
    dueDate: dto.due_date,
    orderId: dto.order_id,
    orderNumber: dto.order_number,
    quantity: dto.quantity,
    settlementId: dto.settlement_id,
    settlementStatus: dto.settlement_status as SettlementStatus,
  }
}

function mapPreorderGroupDtoToDomain(
  dto: PreorderGroupResponseDto
): PreorderGroup {
  return {
    productName: dto.product_name,
    settlements: dto.settlements.map(mapGroupSettlementDtoToDomain),
    totalQuantity: dto.total_quantity,
  }
}

async function getSettlements(
  params: PreorderQueryParams = {}
): Promise<{ data: PreorderGroup[]; total: number }> {
  const response = await apiClient.get<BaseResponse<any>>("/preorders", {
    params,
  })

  const responseData = response.data || {}
  const items: PreorderGroupResponseDto[] = Array.isArray(responseData)
    ? responseData
    : (responseData.preorders ?? responseData.data ?? [])

  const total = responseData.total ?? items.length

  return {
    data: items.map(mapPreorderGroupDtoToDomain),
    total,
  }
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

async function exportPreorders(
  params: { batch_label?: string; status?: string } = {}
): Promise<Blob> {
  return await apiClient.get<Blob>("/preorders/export", {
    params,
    responseType: "blob",
  })
}

export const preorderService = {
  exportPreorders,
  getSettlementById,
  getSettlements,
  invoiceSettlement,
  paidSettlement,
}
