import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { cartService } from "@/lib/services/cart.service"

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

export function useUpdateVariantQuantity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart", "updateVariant"],
    mutationFn: ({
      variantId,
      totalQuantity,
    }: {
      variantId: string
      totalQuantity: number
    }) => cartService.updateVariantQuantity(variantId, totalQuantity),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() })
    },
  })
}
