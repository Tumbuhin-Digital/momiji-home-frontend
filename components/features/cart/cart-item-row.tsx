import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Boxes } from "lucide-react"

import { cn } from "@/lib/utils"

import { QuantitySelector } from "@/components/global/quantity-selector"

import type { CartItemDto } from "@/types/cart"

export interface CartItemRowProps {
  disableIncrease?: boolean
  isBlinking?: boolean
  isPreOrder?: boolean
  item: CartItemDto
  formatCurrency: (val: number) => string
  onRemove: () => void
  onUpdateQuantity: (q: number) => void
}

export function CartItemRow({
  disableIncrease,
  isBlinking,
  isPreOrder,
  item,
  formatCurrency,
  onRemove,
  onUpdateQuantity,
}: CartItemRowProps) {
  const { quantity, title, image_src, unit_price, deposit_amount } = item

  const [localQuantity, setLocalQuantity] = useState(quantity)
  const [resetKey, setResetKey] = useState(0)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

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

  const price = parseFloat(unit_price || "0")
  const deposit = parseFloat(deposit_amount || "0")

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-alternate/20 pr-3 pb-3 transition-colors duration-300",
        isBlinking && "animate-pulse bg-primary/20"
      )}
    >
      <div className="relative aspect-square w-26.25 overflow-hidden bg-muted sm:w-26">
        {image_src ? (
          <Image
            src={image_src}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 128px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Boxes className="size-8 text-slate-300" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="text-lg leading-tight text-alternate sm:text-2xl">
              {title}
            </h3>
            <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start">
              <p className="font-semibold text-alternate sm:text-lg">
                {formatCurrency(price)}
              </p>
              {isPreOrder && (
                <p className="text-xs text-alternate sm:text-base">
                  Deposit = {formatCurrency(deposit)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start sm:gap-4">
            <QuantitySelector
              key={resetKey}
              quantity={localQuantity}
              disabled={disableIncrease}
              onIncrease={() => handleUpdate(localQuantity + 1)}
              onDecrease={() => handleUpdate(localQuantity - 1)}
              onChange={(val) => handleUpdate(val)}
              className="w-33.5 items-center justify-between gap-6.5"
            />
            <span
              onClick={onRemove}
              className="cursor-pointer transition-opacity duration-300 hover:opacity-80"
            >
              <p className="text-lg text-alternate underline underline-offset-4 sm:text-2xl">
                Remove
              </p>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
