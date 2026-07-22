import type { BatchDepletion } from "@/types/batches"

type BatchDepletionApi = {
  closed_batch_name?: string
  closedBatchName?: string
  image_url?: string
  imageUrl?: string
  next_batch_name?: string | null
  nextBatchName?: string | null
  product_title?: string
  productTitle?: string
  variant_id?: string
  variantId?: string
}

export function mapBatchDepletionFromApi(
  dto: BatchDepletionApi | null | undefined
): BatchDepletion | null {
  if (!dto) return null

  return {
    closedBatchName: dto.closed_batch_name ?? dto.closedBatchName ?? "",
    imageUrl: dto.image_url ?? dto.imageUrl ?? "",
    nextBatchName: dto.next_batch_name ?? dto.nextBatchName ?? null,
    productTitle: dto.product_title ?? dto.productTitle ?? "",
    variantId: dto.variant_id ?? dto.variantId ?? "",
  }
}

export function extractBatchDepletionFromError(
  error: unknown
): BatchDepletion | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any
  // Axios interceptor wraps failures as ApiError({ payload: responseBody }).
  // Raw AxiosError still has response.data.
  const details =
    err?.payload?.error?.details ??
    err?.response?.data?.error?.details ??
    err?.error?.details ??
    null

  if (!details || typeof details !== "object") {
    return null
  }

  // Only treat as batch depletion when the code matches (or details look like it).
  const code =
    err?.payload?.error?.code ??
    err?.response?.data?.error?.code ??
    err?.error?.code
  if (
    code &&
    code !== "batch_depletion_confirmation_required" &&
    !("closed_batch_name" in details || "closedBatchName" in details)
  ) {
    return null
  }

  return mapBatchDepletionFromApi(details)
}
