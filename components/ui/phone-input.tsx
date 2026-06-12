import * as React from "react"
import { Input } from "@/components/ui/input"
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
        // Strip non-digits and remove the '1' country code if present from the payload
        let digits = value.replace(/\D/g, "")
        if (digits.startsWith("1")) {
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

      let digits = inputValue.replace(/\D/g, "")

      // In NANP (US), area codes never start with 1.
      // So if the string starts with 1, it's the country code.
      if (digits.startsWith("1")) {
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
      <Input
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
