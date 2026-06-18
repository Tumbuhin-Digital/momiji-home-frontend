import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  applyVariantToCart,
  type VariantCartMeta,
} from "@/lib/cart/optimistic-cart"
import { queryKeys } from "@/lib/query/query-keys"
import { cartService } from "@/lib/services/cart.service"
import { useCartStore } from "@/lib/stores/cart.store"

import type { CartResponseDto, UpdateCartItemInput } from "@/types/cart"

export function useAddCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart", "add"],
    mutationFn: cartService.addItem,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
    },
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart", "clear"],
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
    },
  })
}

export function useCreateCartSession() {
  return useMutation({
    mutationKey: ["cart", "session"],
    mutationFn: cartService.createSession,
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart", "remove"],
    mutationFn: cartService.removeItem,
    onMutate: async (deletedItemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.cart() })

      const previousCart = queryClient.getQueryData<CartResponseDto>(
        queryKeys.cart.cart()
      )

      if (previousCart) {
        queryClient.setQueryData<CartResponseDto>(queryKeys.cart.cart(), {
          ...previousCart,
          ship_ready: previousCart.ship_ready.filter(
            (item) => item.id !== deletedItemId
          ),
          pre_order: previousCart.pre_order.filter(
            (item) => item.id !== deletedItemId
          ),
        })
      }

      return { previousCart }
    },
    onError: (err, deletedItemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.cart(), context.previousCart)
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart", "update"],
    mutationFn: ({ id, ...input }: { id: string } & UpdateCartItemInput) =>
      cartService.updateItem(id, input),
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.cart() })

      const previousCart = queryClient.getQueryData<CartResponseDto>(
        queryKeys.cart.cart()
      )

      if (previousCart) {
        queryClient.setQueryData<CartResponseDto>(queryKeys.cart.cart(), {
          ...previousCart,
          ship_ready: previousCart.ship_ready.map((item) =>
            item.id === updatedItem.id
              ? { ...item, quantity: updatedItem.quantity }
              : item
          ),
          pre_order: previousCart.pre_order.map((item) =>
            item.id === updatedItem.id
              ? { ...item, quantity: updatedItem.quantity }
              : item
          ),
        })
      }

      return { previousCart }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.cart(), context.previousCart)
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
    },
  })
}

export interface SyncCartVariantInput {
  variantId: string
  totalQuantity: number
  meta?: VariantCartMeta
}

export function useLocalCartVariantUpdate() {
  const queryClient = useQueryClient()
  const markPendingSync = useCartStore((state) => state.markPendingSync)

  return (input: SyncCartVariantInput) => {
    const { variantId, totalQuantity, meta } = input
    if (!meta) return

    const currentCart = queryClient.getQueryData<CartResponseDto>(
      queryKeys.cart.cart()
    )
    const nextCart = applyVariantToCart(
      currentCart,
      variantId,
      totalQuantity,
      meta
    )

    queryClient.setQueryData(queryKeys.cart.cart(), nextCart)
    markPendingSync(variantId, totalQuantity)
  }
}

export function useSyncCartVariant() {
  const queryClient = useQueryClient()
  const clearPendingSync = useCartStore((state) => state.clearPendingSync)
  const markPendingSync = useCartStore((state) => state.markPendingSync)

  return useMutation({
    mutationKey: ["cart", "syncVariant"],
    mutationFn: ({ variantId, totalQuantity }: SyncCartVariantInput) =>
      cartService.updateVariantQuantity(variantId, totalQuantity),
    onMutate: async ({ variantId, totalQuantity, meta }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.cart() })

      const previousCart = queryClient.getQueryData<CartResponseDto>(
        queryKeys.cart.cart()
      )

      if (previousCart && meta) {
        queryClient.setQueryData<CartResponseDto>(
          queryKeys.cart.cart(),
          applyVariantToCart(previousCart, variantId, totalQuantity, meta)
        )
      }

      return { previousCart, variantId, totalQuantity }
    },
    onSuccess: (_data, { variantId }) => {
      clearPendingSync(variantId)
    },
    onError: (_err, { variantId, totalQuantity }, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.cart(), context.previousCart)
      }
      markPendingSync(variantId, totalQuantity)
    },
  })
}

/** @deprecated Use useSyncCartVariant instead */
export function useUpdateVariantQuantity() {
  return useSyncCartVariant()
}

export function useFlushPendingCart() {
  const queryClient = useQueryClient()
  const getPendingSync = useCartStore((state) => state.getPendingSync)
  const clearPendingSync = useCartStore((state) => state.clearPendingSync)
  const setIsGlobalPending = useCartStore((state) => state.setIsGlobalPending)

  return useMutation({
    mutationKey: ["cart", "flush"],
    mutationFn: async () => {
      const pending = getPendingSync()
      const entries = Object.entries(pending)

      if (entries.length === 0) return

      setIsGlobalPending(true)
      try {
        await Promise.all(
          entries.map(([variantId, totalQuantity]) =>
            cartService.updateVariantQuantity(variantId, totalQuantity)
          )
        )
        clearPendingSync()
      } finally {
        setIsGlobalPending(false)
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
    },
  })
}
