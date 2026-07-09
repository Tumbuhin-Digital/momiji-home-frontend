import { apiClient } from "@/lib/api"
import {
  mapProductDetailToDomain,
  mapProductListItemToDomain,
} from "@/lib/domain/product.adapter"

import type { BaseResponse, PaginatedResult } from "@/types/core"
import type {
  Product,
  ProductDto,
  ProductQueryParams,
  UpdateProductStatusRequest,
  UpdateVariantBatchLabelRequest,
  UpdateVariantCustomTextRequest,
  UpdateVariantPriceRequest,
  UpdateVariantStatusRequest,
} from "@/types/products"

async function getProducts(
  params: ProductQueryParams = {}
): Promise<PaginatedResult<Product>> {
  const response = await apiClient.get<
    BaseResponse<PaginatedResult<ProductDto>>
  >("/products", { params })
  if (response.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems = (response.data as any).products ?? response.data.data ?? []
    return {
      data: rawItems.flatMap(mapProductListItemToDomain),
      limit: response.data.limit,
      page: response.data.page,
      total: response.data.total,
      totalPages: response.data.totalPages,
    }
  }
  return { data: [], limit: 0, page: 1, total: 0, totalPages: 1 }
}

async function getCatalogProducts(
  params: ProductQueryParams = {}
): Promise<PaginatedResult<Product>> {
  const response = await apiClient.get<
    BaseResponse<PaginatedResult<ProductDto>>
  >("/products/catalog", { params })
  if (response.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems = (response.data as any).products ?? response.data.data ?? []
    const mapped = rawItems.flatMap(mapProductListItemToDomain)
    const filtered = mapped.filter(
      (p: Product) =>
        !params.fulfillment_type ||
        (params.fulfillment_type === "ship_ready" &&
          p.category === "ship-ready") ||
        (params.fulfillment_type === "pre_order" &&
          p.category === "pre-order") ||
        (params.fulfillment_type === "inactive" &&
          p.category === "inactive")
    )
    return {
      data: filtered,
      limit: response.data.limit,
      page: response.data.page,
      total: response.data.total,
      totalPages: response.data.totalPages,
    }
  }
  return { data: [], limit: 0, page: 1, total: 0, totalPages: 1 }
}

async function getProductById(productId: string): Promise<Product | null> {
  try {
    const response = await apiClient.get<BaseResponse<ProductDto>>(
      `/products/${productId}`
    )
    return response.data ? mapProductDetailToDomain(response.data) : null
  } catch (error) {
    throw error
  }
}

async function updateProductBatch(
  productId: string,
  input: UpdateVariantBatchLabelRequest
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(
    `/products/${productId}/batch`,
    input
  )
}

async function updateProductStatus(
  productId: string,
  input: UpdateProductStatusRequest
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(
    `/products/${productId}/status`,
    input
  )
}

async function updateVariantPrice(
  variantId: string,
  input: UpdateVariantPriceRequest
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(`/products/variant/price`, {
    variant_id: variantId,
    ...input,
  })
}

async function updateVariantCustomText(
  input: UpdateVariantCustomTextRequest
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(
    "/products/variant/batch-label",
    input
  )
}

async function updateVariantStatus(
  input: UpdateVariantStatusRequest
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(`/products/variant/status`, input)
}

async function getProductVariants(productId: string): Promise<Product[]> {
  const response = await apiClient.get<BaseResponse<ProductDto[]>>(
    `/products/${productId}/variants`
  )
  return response.data ? response.data.flatMap(mapProductListItemToDomain) : []
}

async function downloadDimensionsTemplate(): Promise<Blob> {
  return await apiClient.get<Blob>("/products/variants/dimensions/template", {
    responseType: "blob",
  })
}

async function importDimensions(file: File): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)
  await apiClient.post("/products/variants/dimensions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const productsService = {
  downloadDimensionsTemplate,
  getCatalogProducts,
  getProductById,
  getProductVariants,
  getProducts,
  importDimensions,
  updateProductBatch,
  updateProductStatus,
  updateVariantCustomText,
  updateVariantPrice,
  updateVariantStatus,
}
