"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BatchQtyStepperProps {
  disabled?: boolean
  onChange: (value: number) => void
  value: number
}

export function BatchQtyStepper({
  value,
  onChange,
  disabled,
}: BatchQtyStepperProps) {
  return (
    <div className="flex items-center rounded-md border border-slate-200 bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-r-none text-slate-500"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="size-4" />
      </Button>
      <div className="flex h-10 min-w-14 items-center justify-center border-x border-slate-200 px-4 text-sm font-medium text-slate-700">
        {value}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-l-none text-slate-500"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
