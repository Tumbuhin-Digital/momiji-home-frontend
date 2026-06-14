/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Check, CheckCircle2, Clock, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import { useClearCart } from "@/hooks"
import { useCheckoutConfirm } from "@/hooks/use-checkout"
import { useCartStore } from "@/lib/stores/cart.store"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function OrderConfirmedClient({
  checkoutReference,
}: {
  checkoutReference?: string
}) {
  const { data, isLoading, error } = useCheckoutConfirm(checkoutReference)
  const clearCart = useClearCart()
  const setSessionId = useCartStore((state) => state.setSessionId)

  const handleContinueShopping = () => {
    clearCart.mutate()
    setSessionId(null, null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("momiji-cart-session")
      window.location.href = "/"
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center lg:py-24">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="mt-4 text-alternate/80">Fetching order details...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center lg:py-24">
        <h1 className="mb-4 text-3xl font-bold text-destructive">
          Order Not Found
        </h1>
        <p className="mb-8 text-alternate/80">
          We couldn&apos;t retrieve the details for this order.
        </p>
        <Button
          type="button"
          className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/"
            }
          }}
        >
          <span className="text-base font-medium uppercase">
            Return to Home
          </span>
        </Button>
      </main>
    )
  }

  const isPartiallyPaid =
    data.status === "partially_paid" ||
    ("paymentStatus" in data && data.paymentStatus === "partially_paid")

  const paidToday: number = (data as any).paidToday ?? 0
  const remainingBalance: number = (data as any).remainingBalance ?? 0
  const orderDate: string | undefined = (data as any).orderDate
  const buyerEmail: string | undefined = (data as any).buyerEmail
  const items: Array<{
    title: string
    amount: number
    isPaid: boolean
  }> = (data as any).items ?? []

  const totalPayment = paidToday + remainingBalance
  const paidPercent =
    totalPayment > 0 ? Math.round((paidToday / totalPayment) * 100) : 100

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:py-24">
      <div className="relative mb-8 flex size-32 items-center justify-center rounded-full bg-[#E5ECEE]">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#E5ECEE] opacity-50 duration-3000" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-[#87A9B3]">
          <Check className="size-10 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-alternate sm:text-5xl">
        Order Confirmed!
      </h1>
      <p className="mb-12 text-lg text-alternate/70 sm:text-xl">
        Thank you for your order.
        {buyerEmail && (
          <>
            {" "}
            Your confirmation has been sent to{" "}
            <span className="font-bold text-alternate">{buyerEmail}</span>
          </>
        )}
      </p>

      {/* Order Details Card */}
      <Card className="w-full rounded-2xl border border-alternate/15 bg-[#F3F6F7] shadow-none">
        <CardContent className="space-y-6 p-6 text-left sm:p-8">
          {/* Header: Order ID + Status Badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-alternate/50 uppercase">
                Order ID
              </p>
              <p className="text-xl font-bold text-alternate sm:text-2xl">
                {data.orderNumber}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isPartiallyPaid
                  ? "rounded-full border-amber-400/40 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                  : "rounded-full border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              }
            >
              {isPartiallyPaid ? "Partially Paid" : "Paid"}
            </Badge>
          </div>

          {/* 3-column summary row — visible only when richer data is available */}
          {(orderDate || paidToday > 0 || remainingBalance > 0) && (
            <>
              <Separator className="bg-alternate/10" />
              <div className="grid grid-cols-3 gap-4">
                {orderDate && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wide text-alternate/50 uppercase">
                      Order Date
                    </p>
                    <p className="text-base font-medium text-alternate">
                      {formatDate(orderDate)}
                    </p>
                  </div>
                )}
                {paidToday > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wide text-alternate/50 uppercase">
                      Paid Today
                    </p>
                    <p className="text-base font-medium text-alternate">
                      {formatCurrency(paidToday)}
                    </p>
                  </div>
                )}
                {remainingBalance > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wide text-alternate/50 uppercase">
                      Remaining Balance
                    </p>
                    <p className="text-base font-medium text-amber-600">
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Payment Breakdown — visible only when items are available */}
          {items.length > 0 && (
            <div className="space-y-3 rounded-xl bg-white/70 p-4">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <Progress value={paidPercent} className="h-2" />
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-amber-600">
                    {formatCurrency(paidToday)} paid ({paidPercent}%)
                  </span>
                  <span className="text-alternate/60">
                    {formatCurrency(remainingBalance)} remaining
                  </span>
                </div>
              </div>

              <Separator className="bg-alternate/10" />

              {/* Item list */}
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-alternate/80">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.isPaid ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      ) : (
                        <Clock className="size-3.5 text-amber-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          item.isPaid ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining balance notice */}
          {remainingBalance > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-alternate/10 bg-white/50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-alternate/40" />
              <p className="text-xs leading-relaxed text-alternate/70">
                A Remaining Balance link has been sent to your email. No account
                needed, just click the link when you&apos;re ready to pay the
                remaining balance.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Button
            type="button"
            size="2xl"
            className="w-full rounded-full"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
