import { Metadata } from "next"

import CheckoutPageClient from "@/components/features/checkout/checkout-page-client"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout your order",
}

export default function ShoppingPage() {
  return <CheckoutPageClient />
}
