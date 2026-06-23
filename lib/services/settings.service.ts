import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  CheckoutNotes,
  CheckoutNotesDto,
  UpdateCheckoutNotesDto,
  UpdateCheckoutNotesInput,
} from "@/types/settings"

function mapCheckoutNotes(dto: CheckoutNotesDto): CheckoutNotes {
  return {
    dueNowNote: dto.due_now_note,
    dueLaterNote: dto.due_later_note,
  }
}

function mapUpdateInput(input: UpdateCheckoutNotesInput): UpdateCheckoutNotesDto {
  return {
    due_now_note: input.dueNowNote,
    due_later_note: input.dueLaterNote,
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

export const settingsService = {
  getCheckoutNotes,
  getSettings,
  updateSettings,
}
