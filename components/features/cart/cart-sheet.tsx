"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { X } from "lucide-react"

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
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"

import { CartSheetItemRow } from "@/components/features/cart/cart-sheet-item-row"
import { RemoveItemModal } from "@/components/features/cart/remove-item-modal"
import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { IconBag } from "@/public/icons/icon-bag"

import {
  useCart,
  useFlushPendingCart,
  useLocalCartVariantUpdate,
} from "@/hooks"
import { extractVariantMetaFromCart } from "@/lib/cart/optimistic-cart"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"

export function CartSheet() {
  const pathname = usePathname()
  const router = useRouter()

  const nextMonthDate = new Date()
  nextMonthDate.setDate(1)
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  const nextMonthName = nextMonthDate.toLocaleString("en-US", { month: "long" })

  const isOpen = useCartStore((state) => state.isOpen)
  const setIsOpen = useCartStore((state) => state.setIsOpen)
  const markCartDirty = useCartStore((state) => state.markCartDirty)
  const clearCartDirty = useCartStore((state) => state.clearCartDirty)
  const cartDirty = useCartStore((state) => state.cartDirty)
  const requestShippingRefresh = useCartStore(
    (state) => state.requestShippingRefresh
  )

  const [itemToRemove, setItemToRemove] = useState<{
    variantId: string
    newTotal: number
    title: string
  } | null>(null)
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
  const [blinkingMessage, setBlinkingMessage] = useState<
    "add" | "reduce" | null
  >(null)

  const { data: cartData } = useCart()
  const updateLocalCart = useLocalCartVariantUpdate()
  const flushPendingCart = useFlushPendingCart()

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
  const isPending = flushPendingCart.isPending

  const updateVariantLocally = (variantId: string, totalQuantity: number) => {
    const meta = extractVariantMetaFromCart(cartData, variantId)
    if (!meta) return
    markCartDirty()
    updateLocalCart({ variantId, totalQuantity, meta })
  }

  const handleSheetOpenChange = (open: boolean) => {
    if (!open && cartDirty) {
      requestShippingRefresh()
      clearCartDirty()
    }
    setIsOpen(open)
  }

  const handleProceedToCheckout = async () => {
    try {
      await flushPendingCart.mutateAsync()
      if (cartDirty) {
        clearCartDirty()
      }
      requestShippingRefresh()
      setIsOpen(false)
      router.push("/checkout")
    } catch (error) {
      console.error("Failed to sync cart before checkout:", error)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          showCloseButton={false}
          className="flex w-full max-w-91.75 flex-col px-0 sm:w-150.5 sm:max-w-150.5"
        >
          <SheetHeader className="flex flex-row items-center justify-between border-b px-6 pt-6 pb-4">
            <SheetTitle className="text-xl font-semibold text-alternate">
              Cart
            </SheetTitle>
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-md text-alternate"
                />
              }
            >
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>

          {allItemsLength === 0 ? (
            <Empty className="animate-in gap-0! duration-700 ease-out fade-in slide-in-from-bottom-8">
              <EmptyMedia className="flex flex-col gap-4">
                <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/20">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/40 opacity-20 duration-3000" />
                  <IconBag className="size-8 text-white" />
                </div>
                <EmptyHeader>
                  <EmptyTitle className="text-alternate">
                    Your Cart is Empty
                  </EmptyTitle>
                  <EmptyDescription>
                    Explore our exclusive collection and find your favorite
                    items.
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyMedia>
              <EmptyContent>
                <Button
                  type="button"
                  size="2xl"
                  className="h-13! rounded-full uppercase"
                  onClick={() => setIsOpen(false)}
                  render={
                    <Link href={pathname.includes("/shop") ? pathname : "/"} />
                  }
                >
                  Continue Shopping
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <SheetPanel className="flex flex-col space-y-8 px-6">
              {shipReadyItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-header sm:text-lg">
                    ShipReady
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
                          onUpdateQuantity={(q) => {
                            const currentPreOrderQty =
                              preOrderItems.find(
                                (i) => i.variant_id === item.variant_id
                              )?.quantity || 0
                            updateVariantLocally(
                              item.variant_id,
                              q + currentPreOrderQty
                            )
                          }}
                          onDecreaseIntercept={
                            hasPreOrder
                              ? () => {
                                  setBlinkingProductKey(item.variant_id)
                                  setBlinkingMessage("reduce")
                                  setTimeout(() => {
                                    setBlinkingProductKey(null)
                                    setBlinkingMessage(null)
                                  }, 3000)
                                  return true
                                }
                              : undefined
                          }
                          onRemove={() => {
                            const currentPreOrderQty =
                              preOrderItems.find(
                                (i) => i.variant_id === item.variant_id
                              )?.quantity || 0
                            setItemToRemove({
                              variantId: item.variant_id,
                              newTotal: currentPreOrderQty,
                              title: item.title,
                            })
                          }}
                          disableIncrease={isPending || hasPreOrder}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-black/80 pt-2 pb-2">
                    <span className="font-medium text-alternate uppercase">
                      TOTAL DUE NOW
                    </span>
                    <span className="font-medium text-alternate">
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
                    <h3 className="font-semibold text-header sm:text-lg">
                      Pre-Order
                    </h3>
                    {blinkingProductKey && blinkingMessage && (
                      <span className="animate-bounce rounded px-1 text-[10px] font-medium text-destructive sm:text-xs">
                        *
                        {blinkingMessage === "add"
                          ? "Add Quantity Here"
                          : "Reduce Pre-Order First"}
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
                          onRemove={() => {
                            const currentShipReadyQty =
                              shipReadyItems.find(
                                (i) => i.variant_id === item.variant_id
                              )?.quantity || 0
                            setItemToRemove({
                              variantId: item.variant_id,
                              newTotal: currentShipReadyQty,
                              title: item.title,
                            })
                          }}
                          onUpdateQuantity={(q) => {
                            const currentShipReadyQty =
                              shipReadyItems.find(
                                (i) => i.variant_id === item.variant_id
                              )?.quantity || 0
                            updateVariantLocally(
                              item.variant_id,
                              currentShipReadyQty + q
                            )
                          }}
                          disableIncrease={isPending}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-black/60 pt-2 pb-2">
                    <span className="font-medium text-alternate uppercase">
                      TOTAL DUE NOW
                    </span>
                    <span className="font-medium text-alternate">
                      {formatCurrency(parseFloat(summary.total_deposit || "0"))}
                    </span>
                  </div>
                </div>
              )}
            </SheetPanel>
          )}

          {allItemsLength > 0 && (
            <SheetFooter className="flex flex-col bg-popover sm:flex-col">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between border-b border-alternate/10 pb-2">
                  <span className="text-sm font-medium text-alternate">
                    Total ShipReady
                  </span>
                  <span className="font-medium text-alternate">
                    {formatCurrency(
                      parseFloat(summary.total_ship_ready || "0")
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-alternate/10 pb-2">
                  <span className="text-sm font-medium text-alternate">
                    Total Pre-Order Deposit
                  </span>
                  <span className="font-medium text-alternate">
                    {formatCurrency(parseFloat(summary.total_deposit || "0"))}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-sm font-medium text-alternate">
                    Total Balance Due {nextMonthName}
                  </span>
                  <span className="font-medium text-alternate">
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
                  disabled={flushPendingCart.isPending}
                  onClick={handleProceedToCheckout}
                >
                  <span className="font-medium uppercase">
                    Proceed To Checkout
                  </span>
                </Button>
                <p className="text-center text-sm text-alternate">
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
            updateVariantLocally(itemToRemove.variantId, itemToRemove.newTotal)
            setItemToRemove(null)
          }
        }}
        productName={itemToRemove?.title || ""}
        isPending={false}
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

            if (!currentProduct) return

            const currentPreOrderQty =
              preOrderItems.find((i) => i.variant_id === currentProduct.sku)
                ?.quantity || 0

            setBlinkingProductKey(currentProduct.sku)
            setBlinkingMessage("add")

            try {
              updateVariantLocally(
                currentProduct.sku,
                currentQuantity + currentPreOrderQty
              )
              setTimeout(() => {
                setBlinkingProductKey(null)
                setBlinkingMessage(null)
              }, 3000)
            } finally {
              setDepletedProduct(null)
              if (revertQuantity) revertQuantity()
              setRevertQuantity(null)
            }
          }}
          isPending={false}
        />
      )}
    </>
  )
}
