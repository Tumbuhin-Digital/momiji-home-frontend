import * as React from "react"

import { cn } from "@/lib/utils"

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value?: string
  onChange?: (value: string) => void
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")

    React.useEffect(() => {
      if (value) {
        let rawInput = value
        if (rawInput.startsWith("+1 ")) {
          rawInput = rawInput.slice(3)
        } else if (rawInput.startsWith("+1")) {
          rawInput = rawInput.slice(2)
        }

        let digits = rawInput.replace(/\D/g, "")
        if (digits.length === 11 && digits.startsWith("1")) {
          digits = digits.slice(1)
        }
        setDisplayValue(formatUSPhone(digits))
      } else {
        setDisplayValue("")
      }
    }, [value])

    const formatUSPhone = (digits: string) => {
      if (!digits) return ""

      if (digits.length <= 3) {
        return `+1 ${digits}`
      } else if (digits.length <= 6) {
        return `+1 ${digits.slice(0, 3)}-${digits.slice(3)}`
      } else {
        return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      let rawInput = inputValue
      if (rawInput.startsWith("+1 ")) {
        rawInput = rawInput.slice(3)
      } else if (rawInput.startsWith("+1")) {
        rawInput = rawInput.slice(2)
      }

      let digits = rawInput.replace(/\D/g, "")
      if (digits.length === 11 && digits.startsWith("1")) {
        digits = digits.slice(1)
      }

      digits = digits.slice(0, 10)

      const newDisplay = formatUSPhone(digits)
      setDisplayValue(newDisplay)

      if (onChange) {
        if (digits.length > 0) {
          onChange(`+1${digits}`)
        } else {
          onChange("")
        }
      }
    }

    return (
      <input
        ref={ref}
        type="tel"
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"
