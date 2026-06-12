"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useClearCart } from "@/hooks"
import { useCheckoutConfirm } from "@/hooks/use-checkout"
import { useCartStore } from "@/lib/stores/cart.store"

export default function OrderConfirmedClient({
  checkoutReference,
}: {
  checkoutReference?: string
}) {
  const { data, isLoading, error } = useCheckoutConfirm(checkoutReference)
  const clearCart = useClearCart()
  const setSessionId = useCartStore((state) => state.setSessionId)

  useEffect(() => {
    if (data?.status && data.status !== "failed") {
      clearCart.mutate()
      setSessionId(null, null)
    }
    // Only run once when order is confirmed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status])

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
          asChild
          type="button"
          className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
        >
          <Link href="/">
            <span className="text-base font-medium uppercase">
              Return to Home
            </span>
          </Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center lg:py-24">
      {/* Success Icon */}
      <div className="mb-8 flex size-32 items-center justify-center rounded-full bg-[#E5ECEE]">
        <div className="flex size-20 items-center justify-center rounded-full bg-[#87A9B3]">
          <Check className="size-10 text-white" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mb-4 text-4xl tracking-tight text-alternate sm:text-5xl">
        Order Confirmed!
      </h1>
      <p className="mb-12 text-lg text-alternate/80 sm:text-xl">
        Thank you for your order. We are processing it right now.
      </p>

      {/* Order Details Card */}
      <Card className="w-full rounded-[20px] border border-alternate/20 bg-[#F3F6F7] shadow-none">
        <CardContent className="p-6 text-left sm:p-10">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-alternate/60">
                Order ID
              </p>
              <p className="text-xl font-bold text-alternate sm:text-2xl">
                {data.orderNumber}
              </p>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 capitalize"
            >
              {data.status}
            </Badge>
          </div>

          <div className="mt-12 flex justify-center">
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
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
