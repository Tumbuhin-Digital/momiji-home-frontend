import type { Product, ProductCategory, ProductDto } from "@/types/products"

function calculateMarketPrices(basePrice: number) {
  return {
    USD: {
      price: basePrice,
      compareAtPrice: null,
      isAutoCalculated: true,
    },
  }
}

export function mapProductListItemToDomain(dto: ProductDto): Product[] {
  if (!dto.variants || dto.variants.length === 0) {
    return []
  }

  return dto.variants.map((variant) => {
    const category: ProductCategory =
      variant.fulfillment_type === "ship_ready"
        ? "ship-ready"
        : variant.fulfillment_type === "pre_order"
          ? "pre-order"
          : "inactive"

    const wsPriceNum = parseFloat(variant.ws_price || "0")
    const retailPriceNum = parseFloat(variant.retail_price || "0")

    const title =
      variant.title === "Default Title"
        ? dto.title
        : `${dto.title} - ${variant.title}`

    const variantIdClean = variant.id.split("/").pop() || variant.id
    const id = `${dto.id}-${variantIdClean}`

    return {
      id,
      originalId: dto.id,
      shopifyProductId: dto.shopify_id || dto.id,
      title,
      sku: variant.id,
      description: dto.description || "",
      imageUrl:
        variant.image_src || (dto.images?.length ? dto.images[0].src : ""),
      images: dto.images?.length
        ? [...dto.images]
            .sort((a, b) => a.position - b.position)
            .map(({ src, alt, position }) => ({ src, alt, position }))
        : [{ src: variant.image_src || "", alt: title, position: 1 }],
      category,
      status: dto.status || "ACTIVE",
      inventory: {
        quantity:
          variant.inventory_quantity ?? (category === "ship-ready" ? 10 : 0),
        reserved: 0,
        batchQuota: category === "pre-order" ? 50 : undefined,
        batchAvailable: category === "pre-order" ? 50 : undefined,
        warehouseLocation: "DEFAULT",
        syncStatus: "synced",
      },
      pricing: {
        basePrice: wsPriceNum,
        currency: "USD",
        syncToShopify: false,
        markets: calculateMarketPrices(wsPriceNum),
      },
      retailPrice: retailPriceNum,
      updatedAt: new Date().toISOString(),
      weightKg: variant.weight_kg,
      widthCm: variant.width_cm,
      heightCm: variant.height_cm,
      depthCm: variant.length_cm,
    }
  })
}

export function mapProductDetailToDomain(dto: ProductDto): Product {
  return {
    id: dto.id,
    originalId: dto.id,
    shopifyProductId: dto.shopify_id || dto.id,
    title: dto.title,
    sku: dto.id,
    description: dto.description,
    imageUrl: dto.images?.length
      ? dto.images[0].src
      : dto.variants?.[0]?.image_src || "/images/assets/bg-product-1.png",
    images: dto.images?.length
      ? [...dto.images]
          .sort((a, b) => a.position - b.position)
          .map(({ src, alt, position }) => ({ src, alt, position }))
      : [],
    category: "ship-ready",
    status: dto.status || "ACTIVE",
    inventory: {
      quantity: 10,
      reserved: 0,
      warehouseLocation: "DEFAULT",
      syncStatus: "synced",
    },
    pricing: {
      basePrice: 0,
      currency: "USD",
      syncToShopify: false,
      markets: calculateMarketPrices(0),
    },
    updatedAt: new Date().toISOString(),
  }
}
