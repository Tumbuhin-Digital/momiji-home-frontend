/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { Boxes, ChevronLeft, Loader2, InfoIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { CheckoutSkeleton } from "@/components/features/checkout/checkout-skeleton"
import { WaitingPaymentOverlay } from "@/components/features/checkout/waiting-payment-overlay"
import { IconBag } from "@/public/icons/icon-bag"

import { US_STATES_MAP } from "@/constants/states"

import { useCart } from "@/hooks"
import {
  useCheckoutSummaryMutation,
  useCreateCheckout,
} from "@/hooks/use-checkout"
import {
  useCalculateShipping,
  useShippingMethods,
  useValidateAddress,
} from "@/hooks/use-shipping"
import { checkoutService } from "@/lib/services/checkout.service"
import { formatCurrency } from "@/lib/utils"

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

  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [currentCheckoutUrl, setCurrentCheckoutUrl] = useState("")
  const [checkoutReference, setCheckoutReference] = useState("")
  const [paymentExpiresAt, setPaymentExpiresAt] = useState<number | null>(null)
  const [isParsingAddress, setIsParsingAddress] = useState(false)
  const [parsingProgress, setParsingProgress] = useState(0)

  const [summaryState, setSummaryState] = useState({
    shippingCost: "0",
    shipReadyTotal: "0",
    preorderDeposit: "0",
    totalDueNow: "0",
    preorderBalance: "0",
    shippingPreorder: "0",
    totalDueLater: "0",
  })

  const { data: cartData, isLoading: isCartLoading } = useCart()

  const calculateShippingMutation = useCalculateShipping()
  const checkoutSummaryMutation = useCheckoutSummaryMutation()
  const createCheckoutMutation = useCreateCheckout()
  const validateAddressMutation = useValidateAddress()

  const shipReadyItems = cartData?.ship_ready || []
  const preOrderItems = cartData?.pre_order || []
  const allItemsLength = shipReadyItems.length + preOrderItems.length

  const { data: shippingMethodsResponse, isPending: isLoadingShipping } =
    useShippingMethods({ enabled: allItemsLength > 0 })
  const shippingMethods = shippingMethodsResponse?.methods || []

  const isInitialLoading = isCartLoading

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

        const shippingCost = parseFloat(summary.dueNow.shipping || "0")
        const shipReadyTotal = parseFloat(summary.dueNow.shipReadyTotal || "0")
        const preorderDeposit = parseFloat(
          summary.dueNow.preorderDeposit || "0"
        )
        const preorderBalance = parseFloat(
          summary.dueAugust.preorderBalance || "0"
        )

        setSummaryState({
          shippingCost: "0",
          shipReadyTotal: summary.dueNow.shipReadyTotal,
          preorderDeposit: summary.dueNow.preorderDeposit,
          totalDueNow: String(shipReadyTotal + preorderDeposit),
          preorderBalance: summary.dueAugust.preorderBalance,
          shippingPreorder: String(shippingCost),
          totalDueLater: String(preorderBalance + shippingCost),
        })
      } catch (err) {
        console.error("Failed to recalculate shipping/summary", err)
      }
    }

    doRecalculate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.shippingMethod])

  const handleAddressPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (!text) return

    const parts = text.split(",").map((p) => p.trim())
    if (parts.length >= 3) {
      e.preventDefault()
      setIsParsingAddress(true)
      setParsingProgress(0)

      const interval = setInterval(() => {
        setParsingProgress((prev) => {
          if (prev >= 85) return prev
          const increment = Math.random() * 12 + 3
          return Math.min(85, Math.round(prev + increment))
        })
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        setParsingProgress(100)

        setTimeout(() => {
          const address = parts[0]
          const city = parts[1]
          const stateZip = parts[2]
          const country = parts[3] || "United States"

          const stateZipParts = stateZip.split(" ")
          let state = stateZipParts[0]
          const zip = stateZipParts.slice(1).join(" ")

          if (
            state &&
            US_STATES_MAP[state.toUpperCase() as keyof typeof US_STATES_MAP]
          ) {
            state =
              US_STATES_MAP[state.toUpperCase() as keyof typeof US_STATES_MAP]
          }

          setValue("address", address, { shouldValidate: true })
          setValue("city", city, { shouldValidate: true })
          setValue("state", state, { shouldValidate: true })
          setValue("zipCode", zip, { shouldValidate: true })
          setValue("country", country, { shouldValidate: true })

          setIsParsingAddress(false)
          setParsingProgress(0)
          toast.success("Address auto-filled successfully!")
        }, 300)
      }, 500)
    }
  }

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
              type="button"
              className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
              render={<Link href="/" />}
            >
              <span className="text-base font-medium uppercase">
                Continue Shopping
              </span>
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
    <>
      {isParsingAddress && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300">
          <div className="flex w-1/3 flex-col items-center gap-4 bg-transparent p-6">
            <Progress className="w-full" value={parsingProgress} />
            <p className="animate-bounce text-sm font-medium text-white">
              Auto-filling address...
            </p>
          </div>
        </div>
      )}
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
                  {/* Email */}
                  <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                    <input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder=" "
                      className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                    />
                    <label
                      htmlFor="email"
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                    >
                      Email
                    </label>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </section>

              {/* Delivery */}
              <section className="space-y-4">
                <h2 className="text-2xl font-medium text-alternate">
                  Delivery
                </h2>
                <div className="space-y-4">
                  {/* Country/Region */}
                  <div>
                    <Select
                      defaultValue="United States"
                      onValueChange={(v) => setValue("country", v || "")}
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
                    {/* First Name */}
                    <div>
                      <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                        <input
                          {...register("firstName")}
                          id="firstName"
                          type="text"
                          placeholder=" "
                          className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                        />
                        <label
                          htmlFor="firstName"
                          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                        >
                          First Name
                        </label>
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                        <input
                          {...register("lastName")}
                          id="lastName"
                          type="text"
                          placeholder=" "
                          className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                        />
                        <label
                          htmlFor="lastName"
                          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                        >
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

                  {/* Address */}
                  <div>
                    <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                      <input
                        {...register("address")}
                        id="address"
                        type="text"
                        onPaste={handleAddressPaste}
                        placeholder=" "
                        className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                      />
                      <label
                        htmlFor="address"
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                      >
                        Address
                      </label>
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* City */}
                    <div>
                      <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                        <input
                          {...register("city")}
                          id="city"
                          type="text"
                          placeholder=" "
                          className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                        />
                        <label
                          htmlFor="city"
                          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                        >
                          City
                        </label>
                      </div>
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                        <input
                          {...register("state")}
                          id="state"
                          type="text"
                          placeholder=" "
                          className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                        />
                        <label
                          htmlFor="state"
                          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                        >
                          State
                        </label>
                      </div>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    {/* Zip Code */}
                    <div>
                      <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                        <input
                          {...register("zipCode")}
                          id="zipCode"
                          type="text"
                          placeholder=" "
                          className="w-full bg-transparent font-inter text-base leading-[140%] font-normal text-foreground outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                        />
                        <label
                          htmlFor="zipCode"
                          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                        >
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

                  {/* Phone Number */}
                  <div>
                    <Controller
                      control={control}
                      name="phone"
                      render={({
                        field: { value, onChange, ref, ...fieldProps },
                      }) => (
                        <div className="group relative flex h-17.5 w-full flex-col justify-end rounded-lg border border-black/20 bg-white px-4 pb-3 transition-colors focus-within:border-primary">
                          <PhoneInput
                            {...fieldProps}
                            id="phone"
                            ref={ref}
                            value={value}
                            onChange={onChange}
                            placeholder=" "
                            className="w-full border-none bg-transparent p-0 font-inter text-base leading-[140%] font-normal text-foreground ring-0 outline-none focus-visible:ring-0 [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                          />
                          <label
                            htmlFor="phone"
                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#737373] transition-all duration-200 group-focus-within:top-3 group-focus-within:translate-y-0 group-focus-within:text-[11px] group-has-[input:not(:placeholder-shown)]:top-3 group-has-[input:not(:placeholder-shown)]:translate-y-0 group-has-[input:not(:placeholder-shown)]:text-[11px]"
                          >
                            Phone
                          </label>
                        </div>
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
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-medium text-alternate">
                    Shipping Method
                  </h2>
                  <PreviewCard>
                    <PreviewCardTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                        />
                      }
                    >
                      <InfoIcon className="size-4 text-muted-foreground" />
                    </PreviewCardTrigger>
                    <PreviewCardPopup>
                      <div className="flex max-w-xs flex-col gap-2 p-1">
                        <h4 className="text-sm font-medium">
                          Shipping Information
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Shipping for &quot;Ship Ready&quot; items will be
                          calculated directly at checkout on Shopify. Shipping
                          for &quot;Pre-Order&quot; items is calculated here and
                          will be due later when the item is ready to ship.
                        </p>
                      </div>
                    </PreviewCardPopup>
                  </PreviewCard>
                </div>
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
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              {/* Items List */}
              <section className="space-y-6">
                {/* Ship Ready */}
                {shipReadyItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-b border-black/20 pb-2">
                      <h3 className="text-lg font-medium text-primary">
                        Ship Ready
                      </h3>
                    </div>
                    {shipReadyItems.map((item) => {
                      return (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded bg-white">
                            {item.image_src ? (
                              <Image
                                src={item.image_src}
                                alt={item.title}
                                fill
                                className="relative block aspect-square h-auto max-w-full rounded border align-middle transition-opacity duration-200"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded border">
                                <Boxes
                                  className="size-5 text-neutral-400"
                                  strokeWidth={0.5}
                                />
                                <span className="text-[10px] font-light text-neutral-400">
                                  No Image
                                </span>
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

                {/* Pre-Order */}
                {preOrderItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-b border-black/20 pb-2">
                      <h3 className="text-lg font-medium text-primary">
                        Pre-Order
                      </h3>
                    </div>
                    {preOrderItems.map((item) => {
                      return (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                            {item.image_src ? (
                              <Image
                                src={item.image_src}
                                alt={item.title}
                                fill
                                className="relative block aspect-square h-auto max-w-full rounded border align-middle transition-opacity duration-200"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded border bg-white">
                                <Boxes
                                  className="size-5 text-neutral-400"
                                  strokeWidth={0.5}
                                />
                                <span className="text-[10px] font-light text-neutral-400">
                                  No Image
                                </span>
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
                <div className="space-y-3 border-b border-black/12 pb-6">
                  {/* Due Now */}
                  <Card className="gap-1 rounded-[12px] border-l-4 border-primary bg-primary/20 shadow-none">
                    <CardContent className="space-y-2 p-4">
                      <p className="font-medium text-alternate/80">Due Now</p>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-alternate/60">
                            Ship Ready Total
                          </span>
                          <span className="text-alternate/60">
                            {formatCurrency(
                              parseFloat(summaryState.shipReadyTotal || "0")
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-alternate/60">+ Shipping</span>
                          <span className="text-alternate/60 italic">
                            Calculated at checkout
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-alternate/60">
                            Pre-Order - 50% Deposit
                          </span>
                          <span className="text-alternate/60">
                            {formatCurrency(
                              parseFloat(summaryState.preorderDeposit || "0")
                            )}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-2 bg-black/20" />
                      <div className="flex justify-between text-alternate">
                        <span>Total</span>
                        <span>
                          {formatCurrency(
                            parseFloat(summaryState.totalDueNow || "0")
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Due Later */}
                  <Card className="gap-1 rounded-[12px] border-l-4 border-black/20 bg-muted shadow-none">
                    <CardContent className="space-y-2 p-4">
                      <p className="font-medium text-alternate/80">Due Later</p>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-alternate/60">
                            Pre-order - Remaining 50%
                          </span>
                          <span className="text-alternate/60">
                            {formatCurrency(
                              parseFloat(summaryState.preorderBalance || "0")
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-alternate/60">
                            + Shipping (Pre-Order)
                          </span>
                          <span className="text-alternate/60">
                            {formatCurrency(
                              parseFloat(summaryState.shippingPreorder || "0")
                            )}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-2 bg-black/20" />
                      <div className="flex justify-between text-alternate">
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

                <div className="space-y-6">
                  {/* Total Due Now */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-px">
                      <h3 className="text-xl font-medium text-black sm:text-2xl">
                        Total Due now
                      </h3>
                      <div className="flex items-center gap-3">
                        {(calculateShippingMutation.isPending ||
                          checkoutSummaryMutation.isPending) && (
                          <Loader2 className="size-5 animate-spin text-alternate/50" />
                        )}
                        <span className="text-xl font-medium text-black sm:text-2xl">
                          {formatCurrency(
                            parseFloat(summaryState.totalDueNow || "0")
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-alternate/80 sm:text-base">
                      1-2 business days dispatch, UPS Ground or equivalent
                      carrier
                    </p>
                  </div>

                  {/* Total Due Later */}
                  {parseFloat(summaryState.totalDueLater || "0") > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-px">
                        <h3 className="text-xl font-medium text-black sm:text-2xl">
                          Due Later
                        </h3>
                        <div className="flex items-center gap-3">
                          {(calculateShippingMutation.isPending ||
                            checkoutSummaryMutation.isPending) && (
                            <Loader2 className="size-5 animate-spin text-alternate/50" />
                          )}
                          <span className="text-xl font-medium text-black sm:text-2xl">
                            {formatCurrency(
                              parseFloat(summaryState.totalDueLater || "0")
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-alternate/80 sm:text-base">
                        You will be notified when our next shipment arrives in
                        the US
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      size="2xl"
                      disabled={createCheckoutMutation.isPending}
                      className="w-full"
                    >
                      <span className="text-base font-medium uppercase">
                        {createCheckoutMutation.isPending
                          ? "Processing..."
                          : "Checkout"}
                      </span>
                    </Button>
                    <div className="flex w-full justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto bg-transparent p-2 text-alternate hover:bg-transparent hover:opacity-80"
                        render={<Link href="/" />}
                      >
                        <span className="flex items-center gap-2.5 sm:text-lg">
                          <ChevronLeft className="size-4 text-alternate/60 sm:size-6" />{" "}
                          Continue Shopping
                        </span>
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
    </>
  )
}
