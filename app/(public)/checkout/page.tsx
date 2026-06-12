import CheckoutPageClient from "@/components/features/checkout/checkout-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout your order",
}

export default function ShoppingPage() {
  return <CheckoutPageClient />
}
