/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, Boxes, Loader2 } from "lucide-react"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/hooks"
import {
  useShippingMethods,
  useCalculateShipping,
  useValidateAddress,
} from "@/hooks/use-shipping"
import {
  useCheckoutSummaryMutation,
  useCreateCheckout,
} from "@/hooks/use-checkout"
import { checkoutService } from "@/lib/services/checkout.service"

import { IconBag } from "@/public/icons/icon-bag"
import { WaitingPaymentOverlay } from "./waiting-payment-overlay"
import { CheckoutSkeleton } from "./checkout-skeleton"

const checkoutSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  acceptsMarketing: z.boolean().optional(),
  country: z.string().min(1, "Country is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+1\d{10}$/, "Valid US phone number is required (10 digits)"),
  shippingMethod: z.string().min(1, "Shipping method is required"),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPageClient() {
  const { data: cartData, isLoading: isCartLoading } = useCart()

  const shipReadyItems = cartData?.ship_ready || []
  const preOrderItems = cartData?.pre_order || []
  const allItemsLength = shipReadyItems.length + preOrderItems.length

  const { data: shippingMethodsResponse, isPending: isLoadingShipping } =
    useShippingMethods({ enabled: allItemsLength > 0 })
  const shippingMethods = shippingMethodsResponse?.methods || []

  const calculateShippingMutation = useCalculateShipping()
  const checkoutSummaryMutation = useCheckoutSummaryMutation()
  const createCheckoutMutation = useCreateCheckout()
  const validateAddressMutation = useValidateAddress()

  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [currentCheckoutUrl, setCurrentCheckoutUrl] = useState("")
  const [checkoutReference, setCheckoutReference] = useState("")
  const [paymentExpiresAt, setPaymentExpiresAt] = useState<number | null>(null)

  const [summaryState, setSummaryState] = useState({
    shippingCost: "0",
    shipReadyTotal: "0",
    preorderDeposit: "0",
    totalDueNow: "0",
    preorderBalance: "0",
    shippingPreorder: "0",
    totalDueLater: "0",
  })

  useEffect(() => {
    if (cartData?.summary) {
      setSummaryState((prev) => ({
        ...prev,
        shipReadyTotal: cartData.summary?.total_ship_ready || "0",
        preorderDeposit: cartData.summary?.total_deposit || "0",
        totalDueNow: cartData.summary?.total_charged_now || "0",
        preorderBalance: cartData.summary?.total_balance_due || "0",
        totalDueLater: cartData.summary?.total_balance_due || "0",
      }))
    }
  }, [cartData])

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema as any),
    defaultValues: {
      email: "",
      acceptsMarketing: false,
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
    clearErrors,
    formState: { errors },
  } = form
  // eslint-disable-next-line react-hooks/incompatible-library
  const formValues = watch()

  useEffect(() => {
    if (
      !formValues.shippingMethod ||
      !formValues.country ||
      !formValues.zipCode
    )
      return

    const doRecalculate = async () => {
      try {
        await calculateShippingMutation.mutateAsync({
          address_id: 0,
          country: formValues.country!,
          province: formValues.state || "",
          zip: formValues.zipCode!,
          shipping_method: formValues.shippingMethod!,
        })

        const summary = await checkoutSummaryMutation.mutateAsync({
          address_id: 0,
          shipping_method: formValues.shippingMethod!,
          email: formValues.email || "guest@example.com",
        })

        setSummaryState({
          shippingCost: summary.dueNow.shipping,
          shipReadyTotal: summary.dueNow.shipReadyTotal,
          preorderDeposit: summary.dueNow.preorderDeposit,
          totalDueNow: summary.dueNow.total,
          preorderBalance: summary.dueAugust.preorderBalance,
          shippingPreorder: summary.dueAugust.shippingPreorder,
          totalDueLater: summary.dueAugust.total,
        })
      } catch (err) {
        console.error("Failed to recalculate shipping/summary", err)
      }
    }

    doRecalculate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.shippingMethod])

  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      await validateAddressMutation.mutateAsync({
        city: values.city,
        country: values.country,
        state: values.state,
        zip: values.zipCode,
      })
    } catch (err: any) {
      console.error("Address validation failed:", err)
      const errorMsg =
        err?.response?.data?.message ||
        "Invalid address details. Please verify your shipping address."

      setError("address", { type: "manual", message: errorMsg })
      setError("city", { type: "manual", message: errorMsg })
      setError("state", { type: "manual", message: errorMsg })
      setError("zipCode", { type: "manual", message: errorMsg })

      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    try {
      const { checkoutUrl, checkoutReference } =
        await createCheckoutMutation.mutateAsync({
          address1: values.address,
          address_id: 0,
          city: values.city,
          country: values.country,
          email: values.email,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          shipping_method: values.shippingMethod,
          state: values.state,
          zip: values.zipCode,
        })
      setCurrentCheckoutUrl(checkoutUrl)
      setCheckoutReference(checkoutReference)
      setIsWaitingForPayment(true)
      setPaymentExpiresAt(Date.now() + 15 * 60 * 1000)

      window.open(checkoutUrl, "_blank")
    } catch (err) {
      console.error("Checkout failed:", err)
      toast.error("Failed to initiate checkout. Please try again.")
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWaitingForPayment && checkoutReference) {
      interval = setInterval(async () => {
        try {
          const res =
            await checkoutService.getCheckoutConfirm(checkoutReference)
          if (res && res.status !== "failed") {
            window.location.href = `/order-confirmed?checkout_reference=${checkoutReference}`
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {}
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isWaitingForPayment, checkoutReference])

  const isInitialLoading = isCartLoading

  if (isInitialLoading) {
    return <CheckoutSkeleton />
  }

  if (allItemsLength === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Empty className="max-w-2xl animate-in border-none bg-transparent text-center duration-700 ease-out fade-in slide-in-from-bottom-8">
          <div className="mb-8 flex justify-center">
            <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/20">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/40 opacity-20 duration-3000" />
              <IconBag className="size-10 text-white" />
            </div>
          </div>
          <EmptyHeader className="max-w-none space-y-3 pb-6">
            <EmptyTitle className="text-3xl font-bold tracking-tight text-header sm:text-4xl md:text-5xl">
              Your Cart is Empty
            </EmptyTitle>
            <EmptyDescription className="text-base text-muted-foreground sm:text-lg">
              It looks like you haven&apos;t found what you&apos;re looking for
              yet.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-none pt-2">
            <Button
              asChild
              type="button"
              className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
            >
              <Link href="/">
                <span className="text-base font-medium uppercase">
                  Continue Shopping
                </span>
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (isLoadingShipping) {
    return <CheckoutSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16"
      >
        {/* Left Column */}
        <div className="space-y-10 lg:col-span-7">
          <div className="space-y-8">
            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-medium text-alternate">Contact</h2>
              <div className="space-y-3">
                <Input
                  {...register("email")}
                  placeholder="Email"
                  className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="acceptsMarketing"
                    checked={formValues.acceptsMarketing}
                    onCheckedChange={(c) => setValue("acceptsMarketing", !!c)}
                  />
                  <label
                    htmlFor="acceptsMarketing"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email me with news and offers
                  </label>
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section className="space-y-4">
              <h2 className="text-2xl font-medium text-alternate">Delivery</h2>
              <div className="space-y-4">
                <div>
                  <Select
                    defaultValue="United States"
                    onValueChange={(v) => setValue("country", v)}
                  >
                    <SelectTrigger className="h-17.5! w-full rounded-lg border border-black/20 bg-white px-4 py-2 font-inter text-base leading-[140%] font-normal">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[11px] text-[#737373]">
                          Country/Region
                        </span>
                        <SelectValue placeholder="Country/Region" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">
                        United States
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Input
                      {...register("firstName")}
                      placeholder="First Name"
                      className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...register("lastName")}
                      placeholder="Last Name"
                      className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    {...register("address")}
                    placeholder="Address"
                    className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Input
                      {...register("city")}
                      placeholder="City"
                      className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...register("state")}
                      placeholder="State"
                      className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...register("zipCode")}
                      placeholder="ZIP Code"
                      className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Controller
                    control={control}
                    name="phone"
                    render={({
                      field: { value, onChange, ref, ...fieldProps },
                    }) => (
                      <PhoneInput
                        {...fieldProps}
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        placeholder="Phone"
                        className="h-17.5 w-full rounded-lg border border-black/20 bg-white px-4 py-6 font-inter text-base leading-[140%] font-normal"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="space-y-4">
              <h2 className="text-2xl font-medium text-alternate">
                Shipping Method
              </h2>
              {isLoadingShipping ? (
                <div className="flex h-24 items-center justify-center rounded-lg bg-muted/50">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border bg-white">
                  <RadioGroup
                    onValueChange={(v) => {
                      setValue("shippingMethod", v)
                      clearErrors("shippingMethod")
                    }}
                    value={formValues.shippingMethod}
                    className="gap-0"
                  >
                    {shippingMethods.map((method, idx) => (
                      <div
                        key={method.id}
                        className={`flex items-center justify-between p-4 ${idx !== shippingMethods.length - 1 ? "border-b" : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <label
                            htmlFor={method.id}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {method.label}
                          </label>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(parseFloat(method.cost))}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              {errors.shippingMethod && (
                <p className="text-sm text-red-500">
                  {errors.shippingMethod.message}
                </p>
              )}
            </section>

            {/* Footer Links */}
            <section className="flex flex-wrap gap-4 border-t pt-6 text-sm text-blue-600">
              <Link href="/refund-policy" className="hover:underline">
                Refund policy
              </Link>
              <Link href="/shipping-policy" className="hover:underline">
                Shipping
              </Link>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Term of service
              </Link>
            </section>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-6">
            {/* Items List */}
            <section className="space-y-6 border-b pb-6">
              {shipReadyItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-[#87A9B3]">
                      Ship Ready
                    </h3>
                  </div>
                  {shipReadyItems.map((item) => {
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded bg-slate-100">
                          {item.image_src ? (
                            <Image
                              src={item.image_src}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Boxes className="size-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-base font-medium">
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x (pcs)
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {preOrderItems.length > 0 && (
                <div className="space-y-4 border-t border-dashed pt-4">
                  <h3 className="text-lg font-medium text-[#87A9B3]">
                    Pre-Order
                  </h3>
                  {preOrderItems.map((item) => {
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded bg-slate-100">
                          {item.image_src ? (
                            <Image
                              src={item.image_src}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Boxes className="size-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-base font-medium">
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x (pcs)
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Summary Blocks */}
            <section className="space-y-6">
              <div className="space-y-3 border-b border-black/12 pb-3">
                <Card className="gap-1 rounded-[12px] border-l-4 border-primary bg-primary/20 shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <p className="text-xs font-black tracking-widest text-alternate uppercase">
                      Due Now
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Ship Ready Total
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            parseFloat(summaryState.shipReadyTotal || "0")
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          + Shipping
                        </span>
                        <span className="text-xs font-medium text-muted-foreground italic">
                          {summaryState.shippingCost === "0"
                            ? "Calculated at checkout"
                            : formatCurrency(
                                parseFloat(summaryState.shippingCost)
                              )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pre-Order Deposit
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            parseFloat(summaryState.preorderDeposit || "0")
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax</span>
                        <span>{formatCurrency(0)}</span>{" "}
                        {/* Placeholder for Tax */}
                      </div>
                    </div>
                    <Separator className="my-2 bg-alternate/10" />
                    <div className="flex justify-between font-black text-alternate">
                      <span>Total</span>
                      <span>
                        {formatCurrency(
                          parseFloat(summaryState.totalDueNow || "0")
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="gap-1 rounded-[12px] border-l-4 border-black/20 bg-muted shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                      Due August
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Pre-order - Remaining Balance
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            parseFloat(summaryState.preorderBalance || "0")
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          + Shipping (Pre-Order)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            parseFloat(summaryState.shippingPreorder || "0")
                          )}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-2 bg-alternate/10" />
                    <div className="flex justify-between font-black text-alternate/60">
                      <span>Total</span>
                      <span>
                        {formatCurrency(
                          parseFloat(summaryState.totalDueLater || "0")
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tight text-alternate">
                    Estimated total
                  </h3>
                  <div className="flex items-center gap-3">
                    {(calculateShippingMutation.isPending ||
                      checkoutSummaryMutation.isPending) && (
                      <Loader2 className="size-5 animate-spin text-alternate/50" />
                    )}
                    <span className="text-3xl font-black text-alternate">
                      {formatCurrency(
                        parseFloat(summaryState.totalDueNow || "0")
                      )}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Charged today only. Total due August will be invoiced in upon
                  Pre-Order settlement — includes remaining balance + shipping.
                </p>
                <div className="space-y-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createCheckoutMutation.isPending}
                    className="h-14 w-full rounded-none bg-[#87A9B3] text-sm font-bold tracking-widest text-white transition-colors hover:bg-[#7697a1] disabled:opacity-50"
                  >
                    {createCheckoutMutation.isPending
                      ? "Processing..."
                      : "Checkout"}
                  </Button>
                  <div className="flex w-full justify-center">
                    <Button
                      asChild
                      type="button"
                      className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
                    >
                      <Link href="/">
                        <span className="flex items-center text-base font-medium uppercase">
                          <ChevronLeft className="mr-2 size-4" /> Continue
                          Shopping
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>

      <WaitingPaymentOverlay
        isOpen={isWaitingForPayment}
        onOpenChange={setIsWaitingForPayment}
        checkoutUrl={currentCheckoutUrl}
        expiresAt={paymentExpiresAt}
      />
    </div>
  )
}
