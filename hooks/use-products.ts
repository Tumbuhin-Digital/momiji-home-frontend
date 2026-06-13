/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { pricingService, productsService } from "@/lib/services"

import type { UseQueryOptions } from "@tanstack/react-query"
import type { PaginatedResult } from "@/types/core"
import type {
  Product,
  ProductQueryParams,
  UpdatePricingInput,
  UpdateVariantBatchLabelRequest,
  UpdateProductStatusRequest,
  UpdateVariantPriceRequest,
} from "@/types/products"

export function useDownloadDimensionsTemplate() {
  return useMutation({
    mutationFn: productsService.downloadDimensionsTemplate,
  })
}

export function useImportDimensions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsService.importDimensions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useProductById(
  productId: string,
  options?: Omit<UseQueryOptions<Product | null>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productsService.getProductById(productId),
    enabled: productId.length > 0,
    ...options,
  })
}

export function useProductVariants(
  productId: string,
  options?: Omit<UseQueryOptions<Product[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.products.variants(productId),
    queryFn: () => productsService.getProductVariants(productId),
    enabled: productId.length > 0,
    ...options,
  })
}

export function useProducts(
  params: ProductQueryParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResult<Product>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsService.getProducts(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  })
}

export function useInfiniteProducts(
  params: ProductQueryParams = {},
  options?: any
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.products.list(params), "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      productsService.getProducts({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    ...options,
  })
}

export function useUpdatePricing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string
      input: UpdatePricingInput
    }) => pricingService.updatePricing(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUpdateProductBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string
      input: UpdateVariantBatchLabelRequest
    }) => productsService.updateProductBatch(productId, input),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(productId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string
      input: UpdateProductStatusRequest
    }) => productsService.updateProductStatus(productId, input),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(productId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUpdateVariantPrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      variantId,
      input,
    }: {
      variantId: string
      input: UpdateVariantPriceRequest
    }) => productsService.updateVariantPrice(variantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}
