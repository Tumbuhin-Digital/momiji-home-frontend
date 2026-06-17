"use client"

import { useEffect, useState } from "react"

import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

import { Spinner } from "@/components/ui/spinner"

interface QuantitySelectorProps {
  className?: string
  disabled?: boolean
  disabledIncrease?: boolean
  isPending?: boolean
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onChange?: (value: number) => void
}

export function QuantitySelector({
  className,
  disabled,
  disabledIncrease,
  isPending,
  quantity,
  onIncrease,
  onDecrease,
  onChange,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(quantity.toString())
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(quantity.toString())
    }
  }, [quantity, isFocused])

  const handleBlur = () => {
    setIsFocused(false)
    let parsed = parseInt(inputValue, 10)
    if (isNaN(parsed) || parsed < 0) {
      parsed = quantity
    }
    setInputValue(parsed.toString())
    if (parsed !== quantity && onChange) {
      onChange(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur()
    }
  }
  return (
    <div
      className={cn(
        "flex h-9 w-29.75 shrink-0 cursor-pointer items-center justify-between overflow-hidden rounded-sm border border-black/20 bg-white p-0.5 sm:w-35.5",
        className
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDecrease()
        }}
        disabled={disabled || quantity <= 0}
        aria-label="Decrease quantity"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:size-8"
      >
        <Minus
          className="size-4 text-[#697586] sm:size-5"
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      {isPending ? (
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <Spinner className="size-4 text-alternate sm:size-5" />
        </div>
      ) : onChange ? (
        <input
          type="number"
          min={0}
          value={inputValue}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value
            setInputValue(val)
            const parsed = parseInt(val, 10)
            if (!isNaN(parsed) && parsed >= 0) {
              onChange(parsed)
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 [appearance:textfield] bg-transparent text-center text-base font-medium text-alternate outline-none sm:text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <div className="flex min-w-0 flex-1 items-center justify-center text-center text-base font-medium text-alternate sm:text-lg">
          {quantity}
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onIncrease()
        }}
        disabled={disabled || disabledIncrease}
        aria-label="Increase quantity"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:size-8"
      >
        <Plus
          className="size-4 text-alternate sm:size-5"
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
