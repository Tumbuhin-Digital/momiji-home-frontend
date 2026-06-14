"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from "@/components/ui/sheet"

import { CartSheetItemRow } from "@/components/features/cart/cart-sheet-item-row"
import { RemoveItemModal } from "@/components/features/cart/remove-item-modal"
import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { IconBag } from "@/public/icons/icon-bag"

import {
  useAddCartItem,
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"

export function CartSheet() {
  const pathname = usePathname()

  const nextMonthDate = new Date()
  nextMonthDate.setDate(1)
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  const nextMonthName = nextMonthDate.toLocaleString("en-US", { month: "long" })

  const isOpen = useCartStore((state) => state.isOpen)
  const setIsOpen = useCartStore((state) => state.setIsOpen)
  const setIsGlobalPending = useCartStore((state) => state.setIsGlobalPending)

  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const [depletedProduct, setDepletedProduct] = useState<{
    title: string
    imageUrl?: string
    sku: string
    maxStock: number
  } | null>(null)
  const [depletedQuantity, setDepletedQuantity] = useState<number>(0)
  const [revertQuantity, setRevertQuantity] = useState<(() => void) | null>(
    null
  )
  const [blinkingProductKey, setBlinkingProductKey] = useState<string | null>(
    null
  )

  const { data: cartData } = useCart()
  const addCartItem = useAddCartItem()
  const updateCartItem = useUpdateCartItem()
  const removeCartItem = useRemoveCartItem()

  const shipReadyItems = cartData?.ship_ready || []
  const preOrderItems = cartData?.pre_order || []
  const summary = cartData?.summary || {
    total_charged_now: "0",
    total_balance_due: "0",
    total_deposit: "0",
    total_pre_order: "0",
    total_ship_ready: "0",
  }

  const allItemsLength = shipReadyItems.length + preOrderItems.length
  const isPending =
    addCartItem.isPending ||
    updateCartItem.isPending ||
    removeCartItem.isPending

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          closeProps={{
            className:
              "z-20 h-8 w-8 rounded-full text-alternate hover:bg-alternate/10",
          }}
          className="flex w-full max-w-91.75 flex-col px-0 sm:w-150.5 sm:max-w-150.5"
        >
          <SheetHeader className="border-b">
            <SheetTitle>Cart</SheetTitle>
            <SheetDescription>
              Your selected items are saved here. Take a final look before
              placing your order.
            </SheetDescription>
          </SheetHeader>

          {allItemsLength === 0 ? (
            <Empty className="animate-in duration-700 ease-out fade-in slide-in-from-bottom-8">
              <EmptyMedia>
                <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/20">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/40 opacity-20 duration-3000" />
                  <IconBag className="size-8 text-white" />
                </div>
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Your Cart is Empty</EmptyTitle>
                <EmptyDescription>
                  Explore our exclusive collection and find your favorite items.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  className="h-17.75 w-57.5 gap-2.5 rounded-full border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
                  onClick={() => setIsOpen(false)}
                  render={
                    <Link href={pathname.includes("/shop") ? pathname : "/"} />
                  }
                >
                  <span className="text-base font-medium uppercase">
                    Continue Shopping
                  </span>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <SheetPanel className="flex flex-col space-y-8 px-6">
              {shipReadyItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base font-semibold text-header sm:text-lg">
                    Ship-Ready
                  </h3>
                  <div className="flex flex-col gap-4">
                    {shipReadyItems.map((item) => {
                      const hasPreOrder = preOrderItems.some(
                        (i) => i.variant_id === item.variant_id
                      )
                      return (
                        <CartSheetItemRow
                          key={item.id}
                          item={item}
                          formatCurrency={formatCurrency}
                          maxStock={item.inventory_quantity}
                          isPending={isPending}
                          onExceedStock={(desired, revert) => {
                            setDepletedProduct({
                              title: item.title,
                              imageUrl: item.image_src,
                              sku: item.variant_id,
                              maxStock: item.inventory_quantity,
                            })
                            setDepletedQuantity(desired)
                            setRevertQuantity(() => revert)
                          }}
                          onUpdateQuantity={(q) =>
                            updateCartItem.mutate({ id: item.id, quantity: q })
                          }
                          onRemove={() => setItemToRemove(item.id)}
                          disableIncrease={isPending || hasPreOrder}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-black/80 pt-2 pb-2">
                    <span className="text-xs font-semibold text-alternate uppercase sm:text-sm">
                      TOTAL DUE NOW
                    </span>
                    <span className="text-sm font-semibold text-alternate sm:text-base">
                      {formatCurrency(
                        parseFloat(summary.total_ship_ready || "0")
                      )}
                    </span>
                  </div>
                </div>
              )}

              {preOrderItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-header sm:text-lg">
                      Pre-Order
                    </h3>
                    {blinkingProductKey && (
                      <span className="animate-bounce rounded px-1 text-[10px] font-medium text-destructive sm:text-xs">
                        *Add Quantity Here
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    {preOrderItems.map((item) => {
                      return (
                        <CartSheetItemRow
                          key={item.id}
                          item={item}
                          formatCurrency={formatCurrency}
                          isBlinking={blinkingProductKey === item.variant_id}
                          isPending={isPending}
                          isPreOrder
                          onRemove={() => setItemToRemove(item.id)}
                          onUpdateQuantity={(q) =>
                            updateCartItem.mutate({ id: item.id, quantity: q })
                          }
                          disableIncrease={isPending}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-black/80 pt-2 pb-2">
                    <span className="text-xs font-semibold text-alternate uppercase sm:text-sm">
                      TOTAL DUE NOW
                    </span>
                    <span className="text-sm font-semibold text-alternate sm:text-base">
                      {formatCurrency(parseFloat(summary.total_deposit || "0"))}
                    </span>
                  </div>
                </div>
              )}
            </SheetPanel>
          )}

          {allItemsLength > 0 && (
            <SheetFooter className="flex flex-col sm:flex-col">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between border-b border-alternate/10 pb-2">
                  <span className="text-xs font-medium text-alternate sm:text-sm">
                    Total Ship Ready
                  </span>
                  <span className="text-sm font-semibold text-alternate sm:text-base">
                    {formatCurrency(
                      parseFloat(summary.total_ship_ready || "0")
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-alternate/10 pb-2">
                  <span className="text-xs font-medium text-alternate sm:text-sm">
                    Total Pre-Order Deposit
                  </span>
                  <span className="text-sm font-semibold text-alternate sm:text-base">
                    {formatCurrency(parseFloat(summary.total_deposit || "0"))}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-xs font-medium text-alternate sm:text-sm">
                    Total Balance Due {nextMonthName}
                  </span>
                  <span className="text-sm font-semibold text-alternate sm:text-base">
                    {formatCurrency(
                      parseFloat(summary.total_balance_due || "0")
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="2xl"
                  className="rounded-full"
                  onClick={() => setIsOpen(false)}
                  render={<Link href="/checkout" />}
                >
                  <span className="text-base font-medium uppercase">
                    Proceed To Checkout
                  </span>
                </Button>
                <p className="text-center text-[10px] text-alternate/60 sm:text-xs">
                  shipping calculated at checkout
                </p>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <RemoveItemModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={() => {
          if (itemToRemove) {
            removeCartItem.mutate(itemToRemove)
            setItemToRemove(null)
          }
        }}
        productName={(() => {
          if (!itemToRemove) return ""
          const item = [...shipReadyItems, ...preOrderItems].find(
            (i) => i.id === itemToRemove
          )
          return item ? item.title : ""
        })()}
      />

      {depletedProduct && (
        <InventoryDepletedModal
          isOpen={!!depletedProduct}
          product={depletedProduct}
          onClose={() => {
            setDepletedProduct(null)
            if (revertQuantity) revertQuantity()
            setRevertQuantity(null)
          }}
          onConfirm={async () => {
            const currentProduct = depletedProduct
            const currentQuantity = depletedQuantity

            setDepletedProduct(null)
            setRevertQuantity(null)

            if (currentProduct) {
              setBlinkingProductKey(currentProduct.sku)
              setIsGlobalPending(true)
              try {
                const maxStock = currentProduct.maxStock
                const targetShipReadyQty = Math.min(currentQuantity, maxStock)
                const targetPreOrderQty = Math.max(
                  0,
                  currentQuantity - maxStock
                )
                const shipReadyItem = shipReadyItems.find(
                  (i) => i.variant_id === currentProduct.sku
                )
                const preOrderItem = preOrderItems.find(
                  (i) => i.variant_id === currentProduct.sku
                )
                if (
                  shipReadyItem &&
                  shipReadyItem.quantity !== targetShipReadyQty
                ) {
                  await updateCartItem.mutateAsync({
                    id: shipReadyItem.id,
                    quantity: targetShipReadyQty,
                  })
                } else if (!shipReadyItem && targetShipReadyQty > 0) {
                  await addCartItem.mutateAsync({
                    variant_id: currentProduct.sku,
                    quantity: targetShipReadyQty,
                  })
                }
                if (
                  preOrderItem &&
                  preOrderItem.quantity !== targetPreOrderQty
                ) {
                  await updateCartItem.mutateAsync({
                    id: preOrderItem.id,
                    quantity: targetPreOrderQty,
                  })
                } else if (!preOrderItem && targetPreOrderQty > 0) {
                  await addCartItem.mutateAsync({
                    variant_id: currentProduct.sku,
                    quantity: targetPreOrderQty,
                  })
                }
                setTimeout(() => setBlinkingProductKey(null), 3000)
              } finally {
                setIsGlobalPending(false)
              }
            }
          }}
        />
      )}
    </>
  )
}
