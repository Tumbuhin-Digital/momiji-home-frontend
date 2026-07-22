import Image from "next/image"
import { useEffect, useState } from "react"

import { Boxes } from "lucide-react"

import { QuantitySelector } from "@/components/global/quantity-selector"

import { withShopifyWidth } from "@/lib/shopify-image"
import { cn } from "@/lib/utils"

import type { CartItemDto } from "@/types/cart"

export interface CartSheetItemRowProps {
  disableIncrease?: boolean
  isBlinking?: boolean
  isPending?: boolean
  isPreOrder?: boolean
  item: CartItemDto
  maxStock?: number
  onExceedStock?: (desiredQuantity: number, revert: () => void) => void
  formatCurrency: (val: number) => string
  onDecreaseIntercept?: () => boolean
  onRemove: () => void
  onUpdateQuantity: (q: number) => void
}

export function CartSheetItemRow({
  disableIncrease,
  isBlinking,
  isPending,
  isPreOrder,
  item,
  maxStock,
  onExceedStock,
  formatCurrency,
  onDecreaseIntercept,
  onRemove,
  onUpdateQuantity,
}: CartSheetItemRowProps) {
  const { quantity, title, image_src, unit_price, deposit_amount } = item

  const displayTitle = title
  const displayImage = image_src

  const [localQuantity, setLocalQuantity] = useState(quantity)
  const [resetKey, setResetKey] = useState(0)

  const price = parseFloat(unit_price || "0")
  const deposit = parseFloat(deposit_amount || "0")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuantity(quantity)
  }, [quantity])

  const handleUpdate = (newQty: number) => {
    if (newQty <= 0) {
      onRemove()
      setResetKey((prev) => prev + 1)
      setLocalQuantity(quantity > 0 ? quantity : 1)
      return
    }

    setLocalQuantity(newQty)
    onUpdateQuantity(newQty)
  }

  const handleIncrease = () => {
    if (disableIncrease) return
    const current = localQuantity
    if (maxStock !== undefined && current >= maxStock) {
      const next = current + 1
      setLocalQuantity(next)
      onExceedStock?.(next, () => {
        setLocalQuantity(maxStock)
        setResetKey((prev) => prev + 1)
      })
      return
    }
    handleUpdate(current + 1)
  }

  const handleDecrease = () => {
    if (onDecreaseIntercept && onDecreaseIntercept()) return
    handleUpdate(localQuantity - 1)
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 transition-colors duration-300",
        isBlinking && "animate-pulse rounded bg-primary/20 p-2"
      )}
    >
      <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded bg-linear-to-b from-white via-white to-black/5 sm:w-24">
        {displayImage ? (
          <Image
            src={withShopifyWidth(displayImage, 192)}
            alt={displayTitle}
            fill
            className="relative block aspect-square h-auto max-w-full rounded border align-middle transition-opacity duration-200"
            sizes="96px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded border">
            <Boxes className="size-6 text-neutral-400" strokeWidth={0.5} />
            <span className="text-xs font-light text-neutral-400">
              No Image
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-1.5 sm:w-70">
          <h3 className="text-xs text-alternate">{displayTitle}</h3>
          <div className="flex flex-col gap-0.5">
            <p className="text-alternate/80">{formatCurrency(price)}</p>
            {isPreOrder && (
              <p className="text-xs text-alternate/60">
                50% Deposit = {formatCurrency(deposit)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <QuantitySelector
            key={resetKey}
            quantity={localQuantity}
            isPending={isPending}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onChange={(q) => {
              if (
                q < localQuantity &&
                onDecreaseIntercept &&
                onDecreaseIntercept()
              ) {
                setLocalQuantity(localQuantity)
                setResetKey((prev) => prev + 1)
                return
              }
              if (maxStock !== undefined && q > maxStock) {
                setLocalQuantity(q)
                onExceedStock?.(q, () => {
                  setLocalQuantity(maxStock)
                  setResetKey((prev) => prev + 1)
                })
                return
              }
              handleUpdate(q)
            }}
            className="h-9 w-29.75 sm:w-35.5"
            disabledIncrease={disableIncrease}
          />
          <button
            type="button"
            onClick={onRemove}
            className="relative cursor-pointer text-xs text-alternate after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-100 after:bg-alternate after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-0 sm:text-base"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
