import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Boxes } from "lucide-react"

import { QuantitySelector } from "@/components/global/quantity-selector"

import { cn } from "@/lib/utils"

import type { CartItemDto } from "@/types/cart"

export interface CartSheetItemRowProps {
  disableIncrease?: boolean
  isBlinking?: boolean
  isPreOrder?: boolean
  item: CartItemDto
  maxStock?: number
  onExceedStock?: (desiredQuantity: number, revert: () => void) => void
  formatCurrency: (val: number) => string
  onRemove: () => void
  onUpdateQuantity: (q: number) => void
}

export function CartSheetItemRow({
  disableIncrease,
  isBlinking,
  isPreOrder,
  item,
  maxStock,
  onExceedStock,
  formatCurrency,
  onRemove,
  onUpdateQuantity,
}: CartSheetItemRowProps) {
  const { quantity, title, image_src, unit_price, deposit_amount } = item

  const displayTitle = title
  const displayImage = image_src

  const [localQuantity, setLocalQuantity] = useState(quantity)
  const [resetKey, setResetKey] = useState(0)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

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

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setLocalQuantity(newQty)

    debounceTimer.current = setTimeout(() => {
      onUpdateQuantity(newQty)
    }, 600)
  }

  const handleIncrease = () => {
    if (disableIncrease) return
    if (maxStock !== undefined && localQuantity >= maxStock) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      const next = localQuantity + 1
      setLocalQuantity(next)
      onExceedStock?.(next, () => setLocalQuantity(maxStock))
      return
    }
    handleUpdate(localQuantity + 1)
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 transition-colors duration-300",
        isBlinking && "animate-pulse rounded-md bg-primary/20 p-2"
      )}
    >
      <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded bg-muted sm:w-24">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={displayTitle}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Boxes className="size-6 text-slate-300" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1.5 sm:w-70">
          <h3 className="line-clamp-2 text-sm leading-tight font-medium text-alternate sm:text-base">
            {displayTitle}
          </h3>

          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-alternate/80">
              {formatCurrency(price)}
            </p>
            {isPreOrder && (
              <p className="text-[10px] text-alternate/60 sm:text-xs">
                50% Deposit = {formatCurrency(deposit)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4 sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
          <QuantitySelector
            key={resetKey}
            quantity={localQuantity}
            onIncrease={handleIncrease}
            onDecrease={() => handleUpdate(localQuantity - 1)}
            onChange={(q) => {
              if (maxStock !== undefined && q > maxStock) {
                if (debounceTimer.current) clearTimeout(debounceTimer.current)
                setLocalQuantity(q)
                onExceedStock?.(q, () => setLocalQuantity(maxStock))
                return
              }
              handleUpdate(q)
            }}
            className="h-7 w-20 sm:h-8 sm:w-24"
            disabledIncrease={disableIncrease}
          />
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-alternate underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
