import { Metadata } from "next"

import OrderConfirmedClient from "@/components/features/checkout/order-confirmed-client"

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you for your order.",
}

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const checkoutReference = params.checkout_reference as string | undefined

  return <OrderConfirmedClient checkoutReference={checkoutReference} />
}
