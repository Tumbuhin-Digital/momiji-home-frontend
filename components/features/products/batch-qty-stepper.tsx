"use client"

import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BatchQtyStepperProps {
  disabled?: boolean
  min?: number
  onChange: (value: number) => void
  value: number
}

export function BatchQtyStepper({
  value,
  onChange,
  disabled,
  min = 1,
}: BatchQtyStepperProps) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commitDraft = () => {
    const parsed = Number.parseInt(draft, 10)
    if (Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    const next = Math.max(min, parsed)
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  return (
    <div className="flex items-center rounded-md border border-slate-200 bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-r-none text-slate-500"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </Button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Batch quantity"
        value={draft}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "")
          setDraft(next)
        }}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commitDraft()
            event.currentTarget.blur()
          }
        }}
        className="h-10 w-16 border-x border-slate-200 bg-transparent text-center text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-l-none text-slate-500"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
