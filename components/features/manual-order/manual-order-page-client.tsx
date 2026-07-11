"use client"

import { useEffect, useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, InfoIcon, Loader2, Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import {
  CheckoutShippingSegment,
  segmentBatchLabel,
  type WarehouseCode,
} from "@/components/features/checkout/checkout-shipping-segment"
import { InvoiceSuccessDialog } from "@/components/features/manual-order/invoice-success-dialog"
import { SelectProductModal } from "@/components/features/manual-order/select-product-modal"
import { useManualOrderLines } from "@/components/features/manual-order/use-manual-order-lines"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toastManager } from "@/components/ui/toast"

import { useCreateManualOrder } from "@/hooks/use-manual-order"
import { useShippingRates, useValidateAddress } from "@/hooks/use-shipping"
import { parseAddressPaste } from "@/lib/checkout/address-paste"
import { computeManualOrderSummary } from "@/lib/manual-order/summary"
import { formatCurrency } from "@/lib/utils"
import {
  getNormalizedState,
  isUSCountry,
  US_STATES_LIST,
  toUSStateAbbr,
} from "@/constants/states"

import type { ManualLine } from "@/types/manual-order"

const manualOrderSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\+1\d{10}$/.test(v),
      "Valid US phone number is required (10 digits)"
    ),
  shippingMethod: z.string().optional(),
})

type ManualOrderFormValues = z.infer<typeof manualOrderSchema>

const floatingFieldClass =
  "group relative flex h-17.5 w-full flex-col justify-end rounded border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary"
const floatingInputClass =
  "w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
const floatingLabelClass =
  "pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"

function LineRow({
  line,
  onQty,
  onRemove,
}: {
  line: ManualLine
  onQty: (qty: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-black/10 py-3 last:border-b-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={line.imageSrc || "/placeholder.png"}
        alt=""
        className="size-14 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-alternate">{line.title}</p>
        <p className="text-sm text-muted-foreground">
          WS {formatCurrency(line.wsPrice)}
          {line.retailPrice > 0 ? (
            <span className="ml-2">RPP {formatCurrency(line.retailPrice)}</span>
          ) : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onQty(line.quantity - 1)}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-6 text-center text-sm">{line.quantity}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onQty(line.quantity + 1)}
        >
          <Plus className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function ManualOrderPageClient() {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [preorderOrigin, setPreorderOrigin] = useState<WarehouseCode>("east")
  const [isParsingAddress, setIsParsingAddress] = useState(false)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [successOpen, setSuccessOpen] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState("")
  const [invoiceEmailSent, setInvoiceEmailSent] = useState(true)

  const { lines, shipReady, preOrder, addProducts, setQuantity, removeLine } =
    useManualOrderLines()

  const displayShipReady = useMemo(
    () => lines.filter((l) => l.fulfillmentType === "ship_ready"),
    [lines]
  )
  const displayPreOrder = useMemo(
    () => lines.filter((l) => l.fulfillmentType === "pre_order"),
    [lines]
  )

  const form = useForm<ManualOrderFormValues>({
    resolver: zodResolver(manualOrderSchema as any),
    defaultValues: {
      email: "",
      country: "United States",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      shippingMethod: "",
    },
  })

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = form
  // eslint-disable-next-line react-hooks/incompatible-library
  const formValues = watch()

  const createMutation = useCreateManualOrder()
  const validateAddress = useValidateAddress()

  const ratesAddressReady =
    Boolean(formValues.zipCode?.trim()) &&
    Boolean(formValues.city?.trim()) &&
    Boolean(formValues.state?.trim()) &&
    Boolean(formValues.address?.trim())

  const ratesAddressInput = useMemo(
    () => ({
      zip: formValues.zipCode || "",
      country: isUSCountry(formValues.country) ? "US" : formValues.country || "US",
      city: formValues.city || "",
      state: getNormalizedState(formValues.country || "US", formValues.state || "") || formValues.state || "",
      address1: formValues.address || "",
    }),
    [
      formValues.zipCode,
      formValues.country,
      formValues.city,
      formValues.state,
      formValues.address,
    ]
  )

  const shipReadyLineItems = useMemo(
    () =>
      shipReady.map((l) => ({
        variant_id: l.variantId,
        quantity: l.quantity,
      })),
    [shipReady]
  )
  const preOrderLineItems = useMemo(
    () =>
      preOrder.map((l) => ({
        variant_id: l.variantId,
        quantity: l.quantity,
      })),
    [preOrder]
  )

  const shipReadyRatesQuery = useShippingRates(
    {
      ...ratesAddressInput,
      segment: "ship_ready",
      line_items: shipReadyLineItems,
    },
    {
      enabled:
        ratesAddressReady &&
        shipReady.length > 0 &&
        shipReadyLineItems.length > 0,
    }
  )

  const preOrderRatesQuery = useShippingRates(
    {
      ...ratesAddressInput,
      segment: "pre_order",
      origin: preorderOrigin,
      line_items: preOrderLineItems,
    },
    {
      enabled:
        ratesAddressReady && preOrder.length > 0 && preOrderLineItems.length > 0,
    }
  )

  const shipReadyRates = shipReadyRatesQuery.data
  const preOrderRates = preOrderRatesQuery.data

  useEffect(() => {
    if (preOrderRates?.[0]?.serviceCode) {
      setValue("shippingMethod", preOrderRates[0].serviceCode)
    } else if (shipReadyRates?.[0]?.serviceCode && preOrder.length === 0) {
      setValue("shippingMethod", shipReadyRates[0].serviceCode)
    }
  }, [preOrderRates, shipReadyRates, preOrder.length, setValue])

  useEffect(() => {
    const normalized = toUSStateAbbr(formValues.state)
    if (normalized && normalized !== formValues.state) {
      setValue("state", normalized)
    }
  }, [formValues.state, setValue])

  const shippingCost = parseFloat(shipReadyRates?.[0]?.cost || "0") || 0
  const shippingPreorder = parseFloat(preOrderRates?.[0]?.cost || "0") || 0

  const summary = useMemo(
    () =>
      computeManualOrderSummary({
        shipReady,
        preOrder,
        shippingCost,
        shippingPreorder,
      }),
    [shipReady, preOrder, shippingCost, shippingPreorder]
  )

  const handleAddressPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (!text) return
    const parsed = parseAddressPaste(text)
    if (!parsed) return

    e.preventDefault()
    setIsParsingAddress(true)
    setParsingProgress(0)
    const interval = setInterval(() => {
      setParsingProgress((prev) => {
        if (prev >= 85) return prev
        return Math.min(85, Math.round(prev + Math.random() * 12 + 3))
      })
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setParsingProgress(100)
      setTimeout(() => {
        setValue("address", parsed.address, { shouldValidate: true })
        setValue("city", parsed.city, { shouldValidate: true })
        setValue("state", parsed.state, { shouldValidate: true })
        setValue("zipCode", parsed.zipCode, { shouldValidate: true })
        setValue("country", parsed.country, { shouldValidate: true })
        setIsParsingAddress(false)
        setParsingProgress(0)
        toastManager.add({
          title: "Success",
          description: "Address auto-filled successfully!",
          type: "success",
        })
      }, 200)
    }, 500)
  }

  const onSubmit = async (values: ManualOrderFormValues) => {
    if (lines.length === 0) {
      toastManager.add({
        title: "Products required",
        description: "Add at least one product before creating an invoice.",
        type: "warning",
      })
      return
    }
    if (preOrder.length > 0 && !values.shippingMethod) {
      toastManager.add({
        title: "Shipping required",
        description: "Select a shipping method for pre-order items.",
        type: "warning",
      })
      return
    }

    try {
      await validateAddress.mutateAsync({
        country: isUSCountry(values.country) ? "US" : values.country,
        state: getNormalizedState(values.country, values.state),
        city: values.city,
        zip: values.zipCode,
      })
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        "Address could not be validated. Please check and try again."
      setError("address", { type: "manual", message: errorMsg })
      toastManager.add({
        title: "Invalid address",
        description: errorMsg,
        type: "error",
      })
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone || "",
        address1: values.address,
        city: values.city,
        state: getNormalizedState(values.country, values.state),
        zip: values.zipCode,
        country: isUSCountry(values.country) ? "US" : values.country,
        shipping_method: values.shippingMethod || undefined,
        origin: preOrder.length > 0 ? preorderOrigin : undefined,
        line_items: lines.map((l) => ({
          variant_id: l.variantId,
          quantity: l.quantity,
        })),
      })

      setInvoiceUrl(result.invoiceUrl)
      setInvoiceEmailSent(result.invoiceEmailSent)
      setSuccessOpen(true)

      if (result.invoiceEmailSent) {
        toastManager.add({
          title: "Invoice created",
          description: "Shopify emailed the invoice to the customer.",
          type: "success",
        })
      } else {
        toastManager.add({
          title: "Invoice created",
          description:
            "Invoice created but email failed — copy the link to share with the customer.",
          type: "warning",
        })
      }
    } catch (err: any) {
      toastManager.add({
        title: "Failed to create invoice",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
        type: "error",
      })
    }
  }

  const isSubmitting = createMutation.isPending || validateAddress.isPending

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[32px] font-semibold text-alternate">
          Manual Order List
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a Shopify invoice on behalf of a customer
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium text-alternate">Product</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPickerOpen(true)}
              >
                <Plus className="mr-1 size-4" />
                Add Product
              </Button>
            </div>

            {lines.length === 0 ? (
              <p className="rounded-lg border border-dashed border-black/20 px-4 py-8 text-center text-sm text-muted-foreground">
                No products selected. Click Add Product to begin.
              </p>
            ) : (
              <div className="space-y-6">
                {displayShipReady.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-alternate">
                      Ship Ready
                    </h3>
                    <div className="rounded-lg border border-black/10 px-3">
                      {displayShipReady.map((line) => (
                        <LineRow
                          key={`sr-${line.variantId}`}
                          line={line}
                          onQty={(q) => setQuantity(line.variantId, q)}
                          onRemove={() => removeLine(line.variantId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {displayPreOrder.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-alternate">
                      Pre-Order
                    </h3>
                    <div className="rounded-lg border border-black/10 px-3">
                      {displayPreOrder.map((line) => (
                        <LineRow
                          key={`po-${line.variantId}`}
                          line={line}
                          onQty={(q) => setQuantity(line.variantId, q)}
                          onRemove={() => removeLine(line.variantId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-alternate">Contact</h2>
            <div className={floatingFieldClass}>
              <input
                {...register("email")}
                id="manual-email"
                type="email"
                placeholder=" "
                className={floatingInputClass}
              />
              <label htmlFor="manual-email" className={floatingLabelClass}>
                Email
              </label>
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className={floatingFieldClass}>
                  <input
                    {...register("firstName")}
                    id="manual-first"
                    placeholder=" "
                    className={floatingInputClass}
                  />
                  <label htmlFor="manual-first" className={floatingLabelClass}>
                    First Name
                  </label>
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <div className={floatingFieldClass}>
                  <input
                    {...register("lastName")}
                    id="manual-last"
                    placeholder=" "
                    className={floatingInputClass}
                  />
                  <label htmlFor="manual-last" className={floatingLabelClass}>
                    Last Name
                  </label>
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-alternate">Shipping</h2>
            <Select
              value={formValues.country}
              onValueChange={(v) => setValue("country", v || "United States")}
            >
              <SelectTrigger className="h-17.5! w-full rounded border border-black/20 bg-white px-4 py-2">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[11px] text-[#737373]">
                    Country/Region
                  </span>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <div className={floatingFieldClass}>
                <input
                  {...register("address")}
                  id="manual-address"
                  placeholder=" "
                  className={floatingInputClass}
                  onPaste={handleAddressPaste}
                />
                <label htmlFor="manual-address" className={floatingLabelClass}>
                  Address
                </label>
              </div>
              {isParsingAddress && (
                <div className="mt-1 h-1 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${parsingProgress}%` }}
                  />
                </div>
              )}
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className={floatingFieldClass}>
                  <input
                    {...register("city")}
                    id="manual-city"
                    placeholder=" "
                    className={floatingInputClass}
                  />
                  <label htmlFor="manual-city" className={floatingLabelClass}>
                    City
                  </label>
                </div>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <Select
                  value={formValues.state}
                  onValueChange={(v) =>
                    setValue("state", v || "", { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="h-17.5! w-full rounded border border-black/20 bg-white px-4 py-2">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-[11px] text-[#737373]">State</span>
                      <SelectValue placeholder="State" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES_LIST.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <div className={floatingFieldClass}>
                  <input
                    {...register("zipCode")}
                    id="manual-zip"
                    placeholder=" "
                    className={floatingInputClass}
                  />
                  <label htmlFor="manual-zip" className={floatingLabelClass}>
                    ZIP Code
                  </label>
                </div>
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>

            <Controller
              name="phone"
              control={control}
              render={({ field: { value, onChange, ref, ...fieldProps } }) => (
                <div className={floatingFieldClass}>
                  <PhoneInput
                    {...fieldProps}
                    id="manual-phone"
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    placeholder=" "
                    className="w-full border-none bg-transparent p-0 pr-10 font-inter text-base leading-[140%] font-normal text-foreground ring-0 outline-none focus-visible:ring-0 [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                  />
                  <label htmlFor="manual-phone" className={floatingLabelClass}>
                    Phone{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <PreviewCard>
                      <PreviewCardTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 rounded-full"
                          />
                        }
                      >
                        <InfoIcon className="size-4 text-muted-foreground" />
                      </PreviewCardTrigger>
                      <PreviewCardPopup>
                        <div className="flex max-w-xs flex-col gap-2 p-1">
                          <h4 className="text-sm font-medium">
                            Phone Number Format
                          </h4>
                          <p className="text-xs text-pretty text-muted-foreground">
                            Optional for manual orders. If provided, enter a
                            10-digit US number. Example: 123-456-7890.
                          </p>
                        </div>
                      </PreviewCardPopup>
                    </PreviewCard>
                  </div>
                </div>
              )}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}

            {shipReady.length > 0 && (
              <CheckoutShippingSegment
                title="Ship Ready Items"
                batchLabel={segmentBatchLabel(shipReady, "Ship Ready")}
                locked
                ratesEnabled={ratesAddressReady}
                isLoading={shipReadyRatesQuery.isLoading}
                isError={shipReadyRatesQuery.isError}
                rates={shipReadyRates}
              />
            )}
            {preOrder.length > 0 && (
              <CheckoutShippingSegment
                title="Pre-Order Items"
                batchLabel={segmentBatchLabel(
                  preOrder,
                  preOrder[0]?.batchLabel || "Pre-Order"
                )}
                warehouseValue={preorderOrigin}
                onWarehouseChange={setPreorderOrigin}
                ratesEnabled={ratesAddressReady}
                isLoading={preOrderRatesQuery.isLoading}
                isError={preOrderRatesQuery.isError}
                rates={preOrderRates}
              />
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="gap-1 rounded-xl border-l-4 border-black/20 bg-muted shadow-none">
            <CardContent className="space-y-2 p-4">
              <p className="font-medium text-alternate/80">Due Now</p>
              <div className="space-y-0.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-alternate/60">Ship Ready Total</span>
                  <span className="text-alternate/60">
                    {formatCurrency(summary.shipReadyTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-alternate/60">+ Shipping (carrier)</span>
                  <span className="text-alternate/60">
                    {shipReadyRatesQuery.isLoading ? (
                      <Loader2 className="inline size-4 animate-spin" />
                    ) : (
                      formatCurrency(shipReadyRates?.[0]?.baseCost ?? "0")
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-alternate/60">
                    + Shipping buffer (10%)
                  </span>
                  <span className="text-alternate/60">
                    {shipReadyRatesQuery.isLoading ? (
                      <Loader2 className="inline size-4 animate-spin" />
                    ) : (
                      formatCurrency(shipReadyRates?.[0]?.bufferAmount ?? "0")
                    )}
                  </span>
                </div>
                {preOrder.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-alternate/60">
                      Pre-Order - 50% Deposit
                    </span>
                    <span className="text-alternate/60">
                      {formatCurrency(summary.preorderDeposit)}
                    </span>
                  </div>
                )}
              </div>
              <Separator className="my-2 bg-black/20" />
              <div className="flex justify-between text-alternate">
                <span>Total</span>
                <span>{formatCurrency(summary.totalDueNow)}</span>
              </div>
            </CardContent>
          </Card>

          {preOrder.length > 0 && (
            <Card className="gap-1 rounded-xl border-l-4 border-black/20 bg-muted shadow-none">
              <CardContent className="space-y-2 p-4">
                <p className="font-medium text-alternate/80">Due Later</p>
                <div className="space-y-0.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-alternate/60">
                      Pre-order - Remaining 50%
                    </span>
                    <span className="text-alternate/60">
                      {formatCurrency(summary.preorderBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-alternate/60">
                      + Shipping (carrier)
                    </span>
                    <span className="text-alternate/60">
                      {preOrderRatesQuery.isLoading ? (
                        <Loader2 className="inline size-4 animate-spin" />
                      ) : (
                        formatCurrency(preOrderRates?.[0]?.baseCost ?? "0")
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-alternate/60">
                      + Shipping buffer (10%)
                    </span>
                    <span className="text-alternate/60">
                      {preOrderRatesQuery.isLoading ? (
                        <Loader2 className="inline size-4 animate-spin" />
                      ) : (
                        formatCurrency(preOrderRates?.[0]?.bufferAmount ?? "0")
                      )}
                    </span>
                  </div>
                </div>
                <Separator className="my-2 bg-black/20" />
                <div className="flex justify-between text-alternate">
                  <span>Total</span>
                  <span>{formatCurrency(summary.totalDueLater)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-1 pt-2">
            <p className="text-sm text-muted-foreground">Total Due now</p>
            <p className="text-3xl font-semibold text-alternate">
              {formatCurrency(summary.totalDueNow)}
            </p>
            <p className="text-xs text-muted-foreground">
              1-2 business days dispatch, UPS Ground or equivalent carrier
            </p>
          </div>

          {preOrder.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Due Later</p>
              <p className="text-3xl font-semibold text-alternate">
                {formatCurrency(summary.totalDueLater)}
              </p>
              <p className="text-xs text-muted-foreground">
                You will be notified when our next shipment arrives in the US
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || lines.length === 0}
            className="h-14 w-full bg-[#5B7C8A] text-base font-medium text-white hover:bg-[#4d6a76]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "CREATE INVOICE"
            )}
          </Button>

          <Link
            href="/order-management"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-alternate"
          >
            <ArrowLeft className="size-4" />
            Back to Manage Order
          </Link>
        </aside>
      </form>

      <SelectProductModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSave={addProducts}
      />

      <InvoiceSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        invoiceUrl={invoiceUrl}
        invoiceEmailSent={invoiceEmailSent}
      />
    </div>
  )
}
