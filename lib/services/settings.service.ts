import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  CheckoutNotes,
  CheckoutNotesDto,
  UpdateCheckoutNotesDto,
  UpdateCheckoutNotesInput,
  UpdateWarehouseDto,
  UpdateWarehouseInput,
  Warehouse,
  WarehouseCode,
  WarehouseDto,
  WarehouseListDto,
} from "@/types/settings"

function mapCheckoutNotes(dto: CheckoutNotesDto): CheckoutNotes {
  return {
    dueNowNote: dto.due_now_note,
    dueLaterNote: dto.due_later_note,
    storeClosed: dto.store_closed,
    storeClosedMessage: dto.store_closed_message,
  }
}

function mapUpdateInput(input: UpdateCheckoutNotesInput): UpdateCheckoutNotesDto {
  return {
    due_now_note: input.dueNowNote,
    due_later_note: input.dueLaterNote,
    store_closed: input.storeClosed,
    store_closed_message: input.storeClosedMessage,
  }
}

async function getCheckoutNotes(): Promise<CheckoutNotes> {
  const response = await apiClient.get<BaseResponse<CheckoutNotesDto>>(
    "/settings/checkout-notes"
  )

  if (!response.data) {
    throw new Error("Failed to get checkout notes")
  }

  return mapCheckoutNotes(response.data)
}

async function getSettings(): Promise<CheckoutNotes> {
  const response =
    await apiClient.get<BaseResponse<CheckoutNotesDto>>("/settings")

  if (!response.data) {
    throw new Error("Failed to get settings")
  }

  return mapCheckoutNotes(response.data)
}

async function updateSettings(
  input: UpdateCheckoutNotesInput
): Promise<CheckoutNotes> {
  const response = await apiClient.put<
    BaseResponse<CheckoutNotesDto>,
    UpdateCheckoutNotesDto
  >("/settings", mapUpdateInput(input))

  if (!response.data) {
    throw new Error("Failed to update settings")
  }

  return mapCheckoutNotes(response.data)
}

function mapWarehouse(dto: WarehouseDto): Warehouse {
  return {
    code: dto.code,
    name: dto.name,
    phone: dto.phone,
    address1: dto.address1,
    city: dto.city,
    state: dto.state,
    zip: dto.zip,
    country: dto.country,
    shipstationWarehouseId: dto.shipstation_warehouse_id,
    groundServiceCode: dto.ground_service_code,
    isDefault: dto.is_default,
  }
}

function mapUpdateWarehouseInput(input: UpdateWarehouseInput): UpdateWarehouseDto {
  return {
    name: input.name,
    phone: input.phone,
    address1: input.address1,
    city: input.city,
    state: input.state,
    zip: input.zip,
    country: input.country,
    shipstation_warehouse_id: input.shipstationWarehouseId || null,
    ground_service_code: input.groundServiceCode || null,
  }
}

async function getWarehouses(): Promise<Warehouse[]> {
  const response = await apiClient.get<BaseResponse<WarehouseListDto>>(
    "/settings/warehouses"
  )

  if (!response.data?.warehouses) {
    throw new Error("Failed to get warehouses")
  }

  return response.data.warehouses.map(mapWarehouse)
}

async function updateWarehouse(
  code: WarehouseCode,
  input: UpdateWarehouseInput
): Promise<Warehouse> {
  const response = await apiClient.patch<
    BaseResponse<WarehouseDto>,
    UpdateWarehouseDto
  >(`/settings/warehouses/${code}`, mapUpdateWarehouseInput(input))

  if (!response.data) {
    throw new Error("Failed to update warehouse")
  }

  return mapWarehouse(response.data)
}

export const settingsService = {
  getCheckoutNotes,
  getSettings,
  updateSettings,
  getWarehouses,
  updateWarehouse,
}
