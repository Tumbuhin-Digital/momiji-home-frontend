import type { ActivityQueryParams } from "@/types/activity"
import type { CheckoutSummaryInput } from "@/types/checkout"
import type { CustomerQueryParams } from "@/types/customers"
import type { OrderQueryParams } from "@/types/orders"
import type { PreorderQueryParams } from "@/types/preorders"
import type { ProductQueryParams } from "@/types/products"

function normalizeProductParams(
  params: ProductQueryParams = {}
): ProductQueryParams {
  return {
    search: params.search?.trim() ?? "",
    category: params.category ?? "all",
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    fulfillment_type: params.fulfillment_type,
    sort: params.sort,
  }
}

const queryKeys = {
  activity: {
    all: ["activity"] as const,
    list: (params: ActivityQueryParams = {}) =>
      ["activity", "list", params] as const,
  },
  cart: {
    all: () => ["cart"] as const,
    cart: () => ["cart"] as const,
    summary: () => ["cart", "summary"] as const,
  },
  catalog: {
    all: ["catalog"] as const,
    list: (params: ProductQueryParams = {}) =>
      ["catalog", "list", normalizeProductParams(params)] as const,
  },
  checkout: {
    all: ["checkout"] as const,
    summary: (input: CheckoutSummaryInput) =>
      ["checkout", "summary", input] as const,
    confirm: (shopifyOrderId: string) =>
      ["checkout", "confirm", shopifyOrderId] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (params: CustomerQueryParams = {}) =>
      ["customers", "list", params] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    orders: (email: string) => ["customers", "orders", email] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: () => ["dashboard", "summary"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: OrderQueryParams = {}) =>
      ["orders", "list", params] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
    tracking: (orderId: string, itemId: string) =>
      ["orders", "detail", orderId, "item", itemId, "tracking"] as const,
  },
  preorders: {
    all: ["preorders"] as const,
    list: (params: PreorderQueryParams = {}) =>
      ["preorders", "list", params] as const,
    detail: (id: string) => ["preorders", "detail", id] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: ProductQueryParams = {}) =>
      ["products", "list", normalizeProductParams(params)] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
    variants: (productId: string) =>
      ["products", "detail", productId, "variants"] as const,
  },
  shipping: {
    all: ["shipping"] as const,
    methods: () => ["shipping", "methods"] as const,
  },
  settings: {
    all: ["settings"] as const,
    checkoutNotes: () => ["settings", "checkout-notes"] as const,
    admin: () => ["settings", "admin"] as const,
  },
  sync: {
    all: ["sync"] as const,
    stats: () => ["sync", "stats"] as const,
  },
}

export { queryKeys }
