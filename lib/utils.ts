import { clsx } from "clsx"
import { format, isToday, isYesterday } from "date-fns"
import { enUS } from "date-fns/locale"
import { twMerge } from "tailwind-merge"

import type { ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: string | number,
  symbol: string = "$"
): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(numericValue)) {
    return `${symbol}0.00`
  }
  return `${symbol}${numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatLastSynced(date: Date | string | number): string {
  if (!date) return "Last synced: Unknown"

  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return "Last synced: Unknown"
  }

  let dayPart = ""
  if (isToday(d)) {
    dayPart = "Today"
  } else if (isYesterday(d)) {
    dayPart = "Yesterday"
  } else {
    dayPart = format(d, "EEEE", { locale: enUS })
  }

  const datePart = format(d, "dd MMM hh:mm a", { locale: enUS })
  return `Last synced: ${dayPart}, ${datePart}`
}

export function formatSystemStatus(
  date: Date | string | number,
  status: string = "All System Running"
): string {
  if (!date) return `Unknown - ${status}`

  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return `Unknown - ${status}`
  }

  const dayPart = format(d, "EEEE", { locale: enUS })
  const datePart = format(d, "MMM dd yyyy", { locale: enUS })
  return `${dayPart}, ${datePart} - ${status}`
}
