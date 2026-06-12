import type { ActivityQueryParams } from "@/types/activity"
import type { CustomerQueryParams } from "@/types/customers"
import type { OrderQueryParams } from "@/types/orders"
import type { ProductQueryParams } from "@/types/products"

function normalizeProductParams(params: ProductQueryParams = {}) {
  return {
    search: params.search?.trim() ?? "",
    category: params.category ?? "all",
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    fulfillment_type: params.fulfillment_type,
  }
}

const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    summary: () => ["dashboard", "summary"] as const,
  },
  cart: {
    all: () => ["cart"] as const,
    cart: () => ["cart"] as const,
    summary: () => ["cart", "summary"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: OrderQueryParams = {}) =>
      ["orders", "list", params] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: ProductQueryParams = {}) =>
      ["products", "list", normalizeProductParams(params)] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
    variants: (productId: string) =>
      ["products", "detail", productId, "variants"] as const,
  },
  sync: {
    all: ["sync"] as const,
    stats: () => ["sync", "stats"] as const,
  },
  activity: {
    all: ["activity"] as const,
    list: (params: ActivityQueryParams = {}) =>
      ["activity", "list", params] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (params: CustomerQueryParams = {}) =>
      ["customers", "list", params] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    orders: (email: string) => ["customers", "orders", email] as const,
  },
  preorders: {
    all: ["preorders"] as const,
    list: (params: import("@/types/preorders").PreorderQueryParams = {}) =>
      ["preorders", "list", params] as const,
    detail: (id: string) => ["preorders", "detail", id] as const,
  },
  shipping: {
    all: ["shipping"] as const,
    methods: () => ["shipping", "methods"] as const,
  },
  checkout: {
    all: ["checkout"] as const,
    summary: (input: import("@/types/checkout").CheckoutSummaryInput) =>
      ["checkout", "summary", input] as const,
    confirm: (shopifyOrderId: string) =>
      ["checkout", "confirm", shopifyOrderId] as const,
  },
}

export { queryKeys }
