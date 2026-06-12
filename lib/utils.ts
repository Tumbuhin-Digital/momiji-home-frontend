import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
