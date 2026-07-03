"use client"

import { useState } from "react"

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectPrimitive,
  selectTriggerVariants,
} from "@/components/ui/select"
import { cn, formatCurrency } from "@/lib/utils"

import type { ShippingRate } from "@/types/shipping"

export type WarehouseCode = "east" | "west"

const WAREHOUSE_OPTIONS: { value: WarehouseCode; label: string }[] = [
  { value: "east", label: "East Coast 3PL" },
  { value: "west", label: "West Coast 3PL" },
]

type CheckoutShippingSegmentProps = {
  title: string
  batchLabel: string
  locked?: boolean
  warehouseValue?: WarehouseCode
  onWarehouseChange?: (value: WarehouseCode) => void
  ratesEnabled: boolean
  isLoading: boolean
  isError?: boolean
  rates?: ShippingRate[]
}

function WarehouseDisplay({
  warehouseLabel,
  batchLabel,
  locked,
  value,
  onChange,
}: {
  warehouseLabel: string
  batchLabel: string
  locked?: boolean
  value?: WarehouseCode
  onChange?: (value: WarehouseCode) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (locked) {
    return (
      <div
        className="flex h-17.5 w-full items-center justify-between rounded border border-black/20 bg-white px-4 py-2"
        aria-label="Ship-from warehouse (East Coast, locked)"
      >
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="text-sm font-normal">{warehouseLabel}</span>
          {/* <span className="truncate text-base font-medium text-foreground">
            {batchLabel}
          </span> */}
        </div>
        {/* <ChevronDown
          className="size-4 shrink-0 text-muted-foreground opacity-40"
          aria-hidden
        /> */}
      </div>
    )
  }

  const selected =
    WAREHOUSE_OPTIONS.find((option) => option.value === value) ??
    WAREHOUSE_OPTIONS[0]

  return (
    <Select
      value={value}
      onOpenChange={setIsOpen}
      onValueChange={(next) => {
        if (next === "east" || next === "west") {
          onChange?.(next)
        }
      }}
    >
      <SelectPrimitive.Trigger
        className={cn(
          selectTriggerVariants(),
          "h-17.5! w-full rounded border border-black/20 bg-white px-4 py-2 font-inter text-base leading-[140%] font-normal shadow-none not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-none [[data-disabled],:focus-visible,[aria-invalid],[data-pressed]]:shadow-none"
        )}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col items-start gap-0.5 text-left">
            <span className="text-sm font-normal">{selected.label}</span>
            {/* <span className="truncate text-base font-medium text-foreground">
              {batchLabel}
            </span> */}
          </div>
          {isOpen ? (
            <ChevronUp
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : (
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
      </SelectPrimitive.Trigger>
      <SelectContent alignItemWithTrigger={false} sideOffset={4}>
        {WAREHOUSE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function RatesPanel({
  ratesEnabled,
  isLoading,
  isError,
  rates,
}: Pick<
  CheckoutShippingSegmentProps,
  "ratesEnabled" | "isLoading" | "isError" | "rates"
>) {
  if (!ratesEnabled) {
    return (
      <div className="flex min-h-17.5 flex-1 items-center justify-center rounded border border-black/20 bg-white px-4 py-6 text-center text-sm text-[#737373]">
        Please enter your delivery address to see available shipping rates.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-17.5 flex-1 items-center justify-center rounded border border-black/20 bg-white px-4 py-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-17.5 flex-1 items-center justify-center rounded border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
        Failed to load shipping rates. Please check your address and try again.
      </div>
    )
  }

  const rate = rates?.[0]
  if (!rate) {
    return (
      <div className="flex min-h-17.5 flex-1 items-center justify-center rounded border border-black/20 bg-white px-4 py-6 text-center text-sm text-[#737373]">
        Please enter your delivery address to see available shipping rates.
      </div>
    )
  }

  return (
    <div className="flex min-h-17.5 flex-1 items-center justify-between rounded border border-black/20 bg-white px-4 py-4">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-slate-800">{rate.label}</span>
        {rate.deliveryDays ? (
          <span className="text-sm text-slate-500">
            Estimated Delivery: {rate.deliveryDays} Days
          </span>
        ) : null}
      </div>
      <span className="font-medium text-slate-800">
        {rate.cost === "0" || rate.cost === "0.00"
          ? "Free"
          : formatCurrency(parseFloat(rate.cost))}
      </span>
    </div>
  )
}

export function CheckoutShippingSegment({
  title,
  batchLabel,
  locked = false,
  warehouseValue = "east",
  onWarehouseChange,
  ratesEnabled,
  isLoading,
  isError,
  rates,
}: CheckoutShippingSegmentProps) {
  const warehouseLabel =
    warehouseValue === "west" ? "West Coast 3PL" : "East Coast 3PL"

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-medium text-alternate">{title}</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <WarehouseDisplay
          warehouseLabel={locked ? "East Coast 3PL" : warehouseLabel}
          batchLabel={batchLabel}
          locked={locked}
          value={warehouseValue}
          onChange={onWarehouseChange}
        />
        <RatesPanel
          ratesEnabled={ratesEnabled}
          isLoading={isLoading}
          isError={isError}
          rates={rates}
        />
      </div>
    </section>
  )
}

export function segmentBatchLabel(
  items: { title: string }[],
  fallback: string
): string {
  if (items.length === 0) return fallback
  const uniqueTitles = [...new Set(items.map((item) => item.title.trim()))]
  if (uniqueTitles.length === 1) return uniqueTitles[0]
  return `${uniqueTitles[0]} +${uniqueTitles.length - 1} more`
}
