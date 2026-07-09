import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"

export interface PreorderCustomTextDto {
  id: string
  label: string
  usage_count: number
}

export interface DeletePreorderCustomTextResponse {
  id: string
  label: string
  usage_count: number
}

async function listPreorderCustomTexts(
  search?: string
): Promise<PreorderCustomTextDto[]> {
  const response = await apiClient.get<BaseResponse<PreorderCustomTextDto[]>>(
    "/preorder-custom-texts",
    { params: search ? { search } : undefined }
  )
  return response.data ?? []
}

async function createPreorderCustomText(
  label: string
): Promise<PreorderCustomTextDto> {
  const response = await apiClient.post<BaseResponse<PreorderCustomTextDto>>(
    "/preorder-custom-texts",
    { label }
  )
  if (!response.data) {
    throw new Error("Failed to create preorder custom text")
  }
  return response.data
}

async function deletePreorderCustomText(
  id: string
): Promise<DeletePreorderCustomTextResponse> {
  const response = await apiClient.del<
    BaseResponse<DeletePreorderCustomTextResponse>
  >(`/preorder-custom-texts/${id}`)
  if (!response.data) {
    throw new Error("Failed to delete preorder custom text")
  }
  return response.data
}

export const preorderCustomTextService = {
  createPreorderCustomText,
  deletePreorderCustomText,
  listPreorderCustomTexts,
}
