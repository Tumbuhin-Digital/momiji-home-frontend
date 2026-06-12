/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import type { DashboardSummary } from "@/types/dashboard"
import type {
  Product,
  ProductCategory,
  ProductQueryParams,
  UpdateInventoryInput,
  UpdatePricingInput,
} from "@/types/products"

const LOW_STOCK_THRESHOLD = 10

function calculateMarketPrices(basePrice: number) {
  return {
    USD: {
      price: basePrice,
      compareAtPrice: null,
      isAutoCalculated: true,
    },
  }
}

const initialProducts: Product[] = [
  // 24 Ship-Ready Products
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `ship-ready-${i + 1}`,
    originalId: `ship-ready-${i + 1}`,
    shopifyProductId: `gid://shopify/Product/1000${i}`,
    title: "After the Rain Shelf",
    sku: `ATR-S-${100 + i}`,
    description:
      "Elegant handcrafted rattan shelf for your home office or nursery.",
    imageUrl:
      i % 2 === 0
        ? "/images/assets/bg-product-1.png"
        : "/images/assets/bg-product-2.png",
    category: "ship-ready" as ProductCategory,
    status: "ACTIVE",
    inventory: {
      quantity: 4,
      reserved: 2,
      warehouseLocation: "WH-JKT-1",
      syncStatus: "synced" as const,
    },
    pricing: {
      basePrice: 180,
      currency: "USD" as const,
      syncToShopify: true,
      markets: calculateMarketPrices(180),
    },
    updatedAt: new Date().toISOString(),
  })),
  // 24 Pre-Order Products
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `pre-order-${i + 1}`,
    originalId: `pre-order-${i + 1}`,
    shopifyProductId: `gid://shopify/Product/2000${i}`,
    title: "After the Rain Shelf",
    sku: `ATR-P-${200 + i}`,
    description:
      "Elegant handcrafted rattan shelf for your home office or nursery.",
    imageUrl:
      i % 2 === 0
        ? "/images/assets/bg-product-1.png"
        : "/images/assets/bg-product-2.png",
    category: "pre-order" as ProductCategory,
    status: "ACTIVE",
    inventory: {
      quantity: 0,
      reserved: 0,
      batchQuota: 50,
      batchAvailable: 32,
      warehouseLocation: "WH-GLOBAL-1",
      syncStatus: "synced" as const,
    },
    pricing: {
      basePrice: 180,
      currency: "USD" as const,
      syncToShopify: true,
      markets: calculateMarketPrices(180),
    },
    updatedAt: new Date().toISOString(),
  })),
]

const store = {
  products: structuredClone(initialProducts),
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function nowIso() {
  return new Date().toISOString()
}

function findProductIndex(productId: string) {
  return store.products.findIndex((product) => product.id === productId)
}

function listProducts(params: ProductQueryParams = {}) {
  const search = params.search?.trim().toLowerCase() ?? ""

  const items = store.products.filter((product) => {
    const matchCategory =
      !params.category || params.category === "all"
        ? true
        : product.category === params.category
    const matchSearch =
      search.length === 0
        ? true
        : [product.title, product.sku, product.description]
            .join(" ")
            .toLowerCase()
            .includes(search)

    return matchCategory && matchSearch
  })

  return clone(items)
}

function getProductById(productId: string) {
  const product = store.products.find((item) => item.id === productId)
  return product ? clone(product) : null
}

function updateInventory(productId: string, input: UpdateInventoryInput) {
  if (input.quantity < 0) {
    throw new Error("Quantity must be greater than or equal to zero")
  }

  const index = findProductIndex(productId)
  if (index < 0) {
    throw new Error("Product not found")
  }

  const product = store.products[index]
  store.products[index] = {
    ...product,
    inventory: {
      ...product.inventory,
      quantity: input.quantity,
      warehouseLocation:
        input.warehouseLocation ?? product.inventory.warehouseLocation,
      syncStatus: "pending",
    },
    updatedAt: nowIso(),
  }

  try {
    const { addActivity } = require("./activity-store")
    addActivity({
      type: "inventory",
      action: "INVENTORY_UPDATED",
      description: `Stock level for ${product.title} changed to ${input.quantity}.`,
      metadata: { productId, sku: product.sku, quantity: input.quantity },
    })
  } catch (err) {}

  return clone(store.products[index])
}

function updatePricing(productId: string, input: UpdatePricingInput) {
  if (input.basePrice !== undefined && input.basePrice <= 0) {
    throw new Error("Base price must be greater than zero")
  }

  const index = findProductIndex(productId)
  if (index < 0) {
    throw new Error("Product not found")
  }

  const product = store.products[index]
  store.products[index] = {
    ...product,
    pricing: {
      ...product.pricing,
      basePrice: input.basePrice ?? product.pricing.basePrice,
      currency: input.currency ?? product.pricing.currency,
      syncToShopify: input.syncToShopify ?? product.pricing.syncToShopify,
      markets: input.markets ?? product.pricing.markets,
    },
    updatedAt: nowIso(),
  }

  try {
    const { addActivity } = require("./activity-store")
    addActivity({
      type: "pricing",
      action: "PRICING_UPDATED",
      description: `Pricing matrix for ${product.title} updated in terminal.`,
      metadata: { productId, sku: product.sku },
    })
  } catch (err) {}

  return clone(store.products[index])
}

function updateCategory(productId: string, category: ProductCategory) {
  const index = findProductIndex(productId)
  if (index < 0) {
    throw new Error("Product not found")
  }

  store.products[index] = {
    ...store.products[index],
    category,
    updatedAt: nowIso(),
  }

  return clone(store.products[index])
}

function reserveInventory(productId: string, quantity: number) {
  const index = findProductIndex(productId)
  if (index < 0) return

  const product = store.products[index]

  if (product.category === "pre-order") {
    // Consume batch quota instead of physical stock
    store.products[index] = {
      ...product,
      inventory: {
        ...product.inventory,
        batchAvailable: Math.max(
          0,
          (product.inventory.batchAvailable || 0) - quantity
        ),
        syncStatus: "pending",
      },
      updatedAt: nowIso(),
    }
  } else {
    store.products[index] = {
      ...product,
      inventory: {
        ...product.inventory,
        reserved: product.inventory.reserved + quantity,
        syncStatus: "pending",
      },
      updatedAt: nowIso(),
    }
  }
}

function releaseInventory(productId: string, quantity: number) {
  const index = findProductIndex(productId)
  if (index < 0) return

  const product = store.products[index]

  if (product.category === "pre-order") {
    store.products[index] = {
      ...product,
      inventory: {
        ...product.inventory,
        batchAvailable: (product.inventory.batchAvailable || 0) + quantity,
        syncStatus: "pending",
      },
      updatedAt: nowIso(),
    }
  } else {
    store.products[index] = {
      ...product,
      inventory: {
        ...product.inventory,
        reserved: Math.max(0, product.inventory.reserved - quantity),
        syncStatus: "pending",
      },
      updatedAt: nowIso(),
    }
  }
}

function finalizeInventory(productId: string, quantity: number) {
  const index = findProductIndex(productId)
  if (index < 0) return

  const product = store.products[index]

  if (product.category === "pre-order") {
    // For pre-order, finalizing doesn't reduce physical stock yet,
    // it just confirms the quota usage.
    store.products[index] = {
      ...product,
      inventory: {
        ...product.inventory,
        syncStatus: "pending",
      },
      updatedAt: nowIso(),
    }
  } else {
    store.products[index] = {
      ...product,
      inventory: {
        ...product.inventory,
        reserved: Math.max(0, product.inventory.reserved - quantity),
        quantity: Math.max(0, product.inventory.quantity - quantity),
        syncStatus: "pending",
      },
      updatedAt: nowIso(),
    }
  }
}

function getDashboardSummary(): DashboardSummary {
  const totalProducts = store.products.length
  const preOrderProducts = store.products.filter(
    (product) => product.category === "pre-order"
  ).length
  const shipReadyProducts = store.products.filter(
    (product) => product.category === "ship-ready"
  ).length
  const lowStockProducts = store.products.filter(
    (product) =>
      product.inventory.quantity <= LOW_STOCK_THRESHOLD &&
      product.category === "ship-ready"
  ).length
  const pendingSyncProducts = store.products.filter(
    (product) => product.inventory.syncStatus !== "synced"
  ).length

  return {
    totalProducts,
    preOrderProducts,
    shipReadyProducts,
    lowStockProducts,
    pendingSyncProducts,
  }
}

function forceSyncAll() {
  const { addActivity } = require("./activity-store")
  const pendingCount = store.products.filter(
    (p) => p.inventory.syncStatus === "pending"
  ).length

  store.products = store.products.map((p) => ({
    ...p,
    inventory: {
      ...p.inventory,
      syncStatus:
        p.inventory.syncStatus === "pending"
          ? "synced"
          : p.inventory.syncStatus,
    },
    updatedAt: nowIso(),
  }))

  if (pendingCount > 0) {
    addActivity({
      type: "sync",
      action: "SYNC_FORCE_COMPLETE",
      description: `Manual Shopify sync triggered. ${pendingCount} items propagated to cluster.`,
      metadata: { itemsCount: pendingCount },
    })
  }
}

export {
  finalizeInventory,
  forceSyncAll,
  getDashboardSummary,
  getProductById,
  listProducts,
  releaseInventory,
  reserveInventory,
  updateCategory,
  updateInventory,
  updatePricing,
}
