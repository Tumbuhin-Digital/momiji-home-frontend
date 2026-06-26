"use client"

import { useEffect } from "react"
import { Check, Clock, Loader2, Mail } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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

  useEffect(() => {
    if (data) {
      setSessionId(null, null)
    }
  }, [data, setSessionId])

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
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-white/5 p-4 backdrop-blur-sm sm:p-6">
        <div className="relative m-auto w-full max-w-md rounded-3xl p-6 sm:p-10">
          <div className="flex min-h-[30vh] flex-col items-center justify-center py-10 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="mt-4 text-alternate/80">Fetching order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-white/5 p-4 backdrop-blur-sm sm:p-6">
        <div className="relative m-auto w-full max-w-md rounded-3xl p-6 sm:p-10">
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-y-4 py-10 text-center">
            <h1 className="text-3xl font-bold text-destructive">
              Order Not Found
            </h1>
            <p className="text-alternate/80">
              We couldn&apos;t retrieve the details for this order.
            </p>
            <Button
              type="button"
              className="h-14 w-full rounded-full text-base font-medium uppercase"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/"
                }
              }}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isPartiallyPaid =
    data.financialStatus === "partially_paid" || data.totalBalanceDue > 0

  const paidToday = data.totalChargedNow || 0
  const remainingBalance = data.totalBalanceDue || 0
  const orderDate = data.orderDate
  const buyerEmail = data.customerEmail

  const paidItems: Array<{
    title: string
    amount: number
    isPaid: boolean
    isShipping?: boolean
  }> = []

  const unpaidItems: Array<{
    title: string
    amount: number
    isPaid: boolean
    isShipping?: boolean
  }> = []

  const hasPreOrderItems = data.items?.some((item) => item.type === "pre_order")

  if (data.items) {
    data.items.forEach((item) => {
      if (item.type === "ship_ready" && item.amountCharged > 0) {
        paidItems.push({
          title: `${item.title} ${item.quantity}x pcs`,
          amount: item.amountCharged,
          isPaid: true,
        })
      }
    })

    data.items.forEach((item) => {
      if (item.type === "pre_order" && item.amountCharged > 0) {
        paidItems.push({
          title: `${item.title} ${item.quantity}x pcs`,
          amount: item.amountCharged,
          isPaid: true,
        })
      }
    })
  }

  if (data.shipReadyShipping > 0) {
    paidItems.push({
      title: "ShipReady Shipping",
      amount: data.shipReadyShipping,
      isPaid: true,
      isShipping: true,
    })
  }

  if (data.items) {
    data.items.forEach((item) => {
      if (item.type === "pre_order" && item.balanceDue > 0) {
        const cleanTitle = item.title
          .replace(/\[PREORDER\]\s*/i, "")
          .replace(/\(Deposit \d+%\)/i, "")
          .trim()
        unpaidItems.push({
          title: `Remaining Balance due - ${cleanTitle || item.title}`,
          amount: item.balanceDue,
          isPaid: false,
        })
      }
    })
  }

  if (hasPreOrderItems && data.preorderShippingEstimate > 0) {
    unpaidItems.push({
      title: "Pre-Order Shipping (Estimation)",
      amount: data.preorderShippingEstimate,
      isPaid: false,
      isShipping: true,
    })
  }

  const totalPayment = paidToday + remainingBalance
  const paidPercent =
    totalPayment > 0 ? Math.round((paidToday / totalPayment) * 100) : 100

  const hasPaid = paidItems.length > 0
  const hasUnpaid = unpaidItems.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-white/5 p-4 backdrop-blur-sm sm:p-6">
      <div className="relative m-auto w-full max-w-2xl rounded-4xl p-6 sm:p-10">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="relative flex size-24 items-center justify-center rounded-full bg-primary/20">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/50 duration-3000" />
            <div className="relative flex size-14 items-center justify-center rounded-full bg-primary">
              <Check className="size-8 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="flex flex-col gap-3.75">
            <h1 className="text-3xl font-semibold text-header sm:text-5xl">
              Order Confirmed!
            </h1>
            <p className="text-sm text-header/80 sm:text-lg">
              Thank you for your order.
              {buyerEmail && (
                <>
                  {" "}
                  Your confirmation has been sent to{" "}
                  <span className="font-medium text-header">{buyerEmail}</span>
                </>
              )}
            </p>
          </div>

          <Card className="w-full rounded-xl border border-primary bg-primary/20">
            <CardContent className="space-y-6 p-6 text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-black/40 sm:text-sm">
                    Order ID
                  </p>
                  <p className="text-lg font-medium text-black sm:text-2xl">
                    {data.orderNumber}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isPartiallyPaid
                      ? "rounded-full border-[#F3DED7] bg-secondary px-3 py-3 text-xs text-[#F8835E]"
                      : "rounded-full border-[#DEF7E9] bg-secondary px-3 py-3 text-xs text-[#34C759]"
                  }
                >
                  {isPartiallyPaid ? "Partially Paid" : "Paid"}
                </Badge>
              </div>

              {(orderDate || paidToday > 0 || remainingBalance > 0) && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {orderDate && (
                      <div className="space-y-1">
                        <p className="text-xs text-alternate/60 sm:text-sm">
                          Order Date
                        </p>
                        <p className="text-sm text-alternate sm:text-xl">
                          {formatDate(orderDate)}
                        </p>
                      </div>
                    )}
                    {paidToday > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-alternate/60 sm:text-sm">
                          Paid Today
                        </p>
                        <p className="text-sm text-alternate sm:text-xl">
                          {formatCurrency(paidToday)}
                        </p>
                      </div>
                    )}
                    {remainingBalance > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-alternate/60 sm:text-sm">
                          Remaining Balance
                        </p>
                        <p className="text-sm text-[#FF8D28] sm:text-xl">
                          {formatCurrency(remainingBalance)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {(hasPaid || hasUnpaid) && (
                <div className="space-y-3 rounded-xl border border-primary bg-[#F3EEEC] p-6">
                  <div className="space-y-1">
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-[#E5ECEE]"
                      role="progressbar"
                      aria-valuenow={paidPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-2 text-sm sm:flex-row sm:gap-0">
                      <span className="text-[#FF8D28]">
                        {formatCurrency(paidToday)} paid ({paidPercent}%)
                      </span>
                      <span className="text-alternate/60">
                        {formatCurrency(remainingBalance)} remaining
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {paidItems.map((item, idx) => (
                      <div
                        key={`paid-${idx}`}
                        className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0"
                      >
                        {item.isShipping ? (
                          <div className="flex items-center gap-2">
                            <img
                              src="/images/icon-arrow.svg"
                              alt=""
                              className="size-6 shrink-0"
                              aria-hidden
                            />
                            <span className="text-sm text-alternate/60 sm:text-base">
                              {item.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-alternate/60 sm:text-base">
                            {item.title}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Check
                            className="size-3.5 text-[#34C759] sm:size-4.5"
                            strokeWidth={3}
                          />
                          <span className="text-sm font-medium text-[#34C759] sm:text-base">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {hasPaid && hasUnpaid && (
                      <div className="my-4 border-t border-dashed border-[#CCCCCC]" />
                    )}

                    {unpaidItems.map((item, idx) => (
                      <div
                        key={`unpaid-${idx}`}
                        className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0"
                      >
                        {item.isShipping ? (
                          <div className="flex items-center gap-2">
                            <img
                              src="/images/icon-arrow.svg"
                              alt=""
                              className="size-6 shrink-0"
                              aria-hidden
                            />
                            <span className="text-sm text-alternate/60 sm:text-base">
                              {item.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-alternate/60 sm:text-base">
                            {item.title}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className="size-3.5 text-[#FF8D28] sm:size-4.5"
                            strokeWidth={1.5}
                          />
                          <span className="text-sm font-medium text-[#FF8D28] sm:text-base">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {remainingBalance > 0 && (
                <div className="flex items-start gap-3">
                  <div className="flex size-5 items-center justify-center sm:size-6">
                    <Mail
                      className="size-5 text-primary sm:size-6"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-xs text-alternate/60 sm:text-sm">
                    Payment received. Your invoice has been sent to your email
                  </p>
                </div>
              )}

              <div>
                <Button
                  type="button"
                  size="2xl"
                  className="w-full rounded-full uppercase"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
