"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

import { Boxes } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { ProductCatalogCardSkeleton } from "@/components/features/catalog/product-catalog-card-skeleton"

const ProductCatalogCard = dynamic(
  () =>
    import("@/components/features/catalog/product-catalog-card").then(
      (mod) => mod.ProductCatalogCard
    ),
  {
    loading: () => <ProductCatalogCardSkeleton />,
    ssr: false,
  }
)

import { useFlushPendingCart, useInfiniteCatalogProducts } from "@/hooks"
import {
  BATCH_DEPLETED_TITLE,
  buildBatchDepletionDescription,
} from "@/lib/cart/batch-quota"
import { extractBatchDepletionFromError } from "@/lib/domain/batch.adapter"
import { useCartStore } from "@/lib/stores/cart.store"

import type { BatchDepletion } from "@/types/batches"
import type { ProductCatalogPageClientProps } from "@/types/products"

export function ProductCatalogPageClient({
  category,
  search,
  title,
  bottomNavLink,
  bottomNavText,
}: ProductCatalogPageClientProps) {
  const router = useRouter()

  const [isInitialized, setIsInitialized] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [batchDepletion, setBatchDepletion] = useState<BatchDepletion | null>(
    null
  )
  const [pendingCheckout, setPendingCheckout] = useState(false)

  const observerTarget = useRef<HTMLDivElement>(null)

  const cartDirty = useCartStore((state) => state.cartDirty)
  const clearCartDirty = useCartStore((state) => state.clearCartDirty)
  const requestShippingRefresh = useCartStore(
    (state) => state.requestShippingRefresh
  )

  const flushPendingCart = useFlushPendingCart()
  const hasAcceptedBatchDepletion = useCartStore(
    (state) => state.hasAcceptedBatchDepletion
  )
  const getPendingSync = useCartStore((state) => state.getPendingSync)

  const handleProceedToCheckout = async (acceptBatchDepletion = false) => {
    const pending = getPendingSync()
    const alreadyAccepted =
      acceptBatchDepletion ||
      Object.keys(pending).some((variantId) =>
        hasAcceptedBatchDepletion(variantId)
      )

    try {
      await flushPendingCart.mutateAsync({
        acceptBatchDepletion: alreadyAccepted,
        validateBatch: true,
      })
      if (cartDirty) {
        clearCartDirty()
      }
      requestShippingRefresh()
      setBatchDepletion(null)
      setPendingCheckout(false)
      router.push("/checkout")
    } catch (error) {
      const depletion = extractBatchDepletionFromError(error)
      if (depletion) {
        setBatchDepletion(depletion)
        setPendingCheckout(true)
        return
      }
      console.error("Failed to sync cart before checkout:", error)
    }
  }

  const fulfillmentType =
    category === "ship-ready"
      ? "ship_ready"
      : category === "pre-order"
        ? "pre_order"
        : undefined

  const normalizedSearch = search?.trim() ?? ""

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteCatalogProducts(
      {
        fulfillment_type: fulfillmentType,
        limit: itemsPerPage,
        search: normalizedSearch || undefined,
        sort: "name_asc",
      },
      {
        enabled: isInitialized,
      }
    )

  const allVariants = data?.pages.flatMap((page) => page.data) ?? []

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        setItemsPerPage(window.innerWidth >= 1280 ? 8 : 4)
      }
      setIsInitialized(true)
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!isInitialized) return null

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 xl:gap-8">
        <header className="px-4 pt-10 pb-6 text-center sm:px-10">
          <h1 className="text-[32px] font-normal text-header sm:text-5xl xl:text-6xl">
            {title}
          </h1>
        </header>
        <div className="grid w-full grid-cols-1 gap-4 px-4 xl:grid-cols-2 xl:gap-6 xl:px-10">
          {Array.from({ length: itemsPerPage }).map((_, idx) => (
            <div key={idx} className="h-full py-2 xl:py-2.5">
              <ProductCatalogCardSkeleton />
            </div>
          ))}
        </div>
        <CatalogBottomNav
          bottomNavLink={bottomNavLink}
          bottomNavText={bottomNavText}
          isCheckoutPending={false}
          isLoading
          onProceedToCheckout={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 xl:gap-8">
      <header className="px-4 pt-10 pb-6 text-center sm:px-10">
        <h1 className="text-[32px] font-normal text-header sm:text-5xl xl:text-6xl">
          {title}
        </h1>
      </header>

      {allVariants.length === 0 && !isLoading ? (
        <div className="flex w-full items-center justify-center px-4 py-12">
          <Empty className="max-w-2xl animate-in border-none bg-transparent text-center duration-700 ease-out fade-in slide-in-from-bottom-8">
            <div className="mb-8 flex justify-center">
              <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/20">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/40 opacity-20 duration-3000" />
                <Boxes className="size-10 text-white" />
              </div>
            </div>
            <EmptyHeader className="max-w-none space-y-3 pb-6">
              <EmptyTitle className="text-3xl font-bold tracking-tight text-header sm:text-4xl md:text-5xl">
                {normalizedSearch ? "No Search Results" : "No Products Found"}
              </EmptyTitle>
              <EmptyDescription className="text-base text-muted-foreground sm:text-lg">
                {normalizedSearch
                  ? `No products found for "${normalizedSearch}". Try another keyword.`
                  : "It looks like we don&apos;t have any products in this category right now. Please check back later or explore other categories."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 px-4 xl:grid-cols-2 xl:gap-6 xl:px-10">
          {allVariants.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: (index % itemsPerPage) * 0.05,
                ease: "easeOut",
              }}
              className="h-full"
            >
              <div className="h-full py-2 xl:py-2.5">
                <ProductCatalogCard product={product} />
              </div>
            </motion.div>
          ))}

          {isFetchingNextPage && (
            <>
              {Array.from({ length: 2 }).map((_, idx) => (
                <ProductCatalogCardSkeleton key={`skeleton-load-${idx}`} />
              ))}
            </>
          )}
        </div>
      )}

      {hasNextPage && (
        <div
          ref={observerTarget}
          className="flex w-full items-center justify-center py-4"
        >
          <div className="h-4" />
        </div>
      )}

      <CatalogBottomNav
        bottomNavLink={bottomNavLink}
        bottomNavText={bottomNavText}
        isCheckoutPending={flushPendingCart.isPending}
        onProceedToCheckout={() => {
          void handleProceedToCheckout(false)
        }}
      />

      <InventoryDepletedModal
        isOpen={!!batchDepletion}
        imageUrl={batchDepletion?.imageUrl}
        productTitle={batchDepletion?.productTitle}
        title={BATCH_DEPLETED_TITLE}
        description={
          batchDepletion
            ? buildBatchDepletionDescription(batchDepletion)
            : null
        }
        isPending={flushPendingCart.isPending}
        onClose={() => {
          setBatchDepletion(null)
          setPendingCheckout(false)
        }}
        onConfirm={() => {
          if (batchDepletion?.variantId) {
            useCartStore
              .getState()
              .markAcceptedBatchDepletion(batchDepletion.variantId)
          }
          if (pendingCheckout) {
            void handleProceedToCheckout(true)
          }
        }}
      />
    </div>
  )
}

type CatalogBottomNavProps = {
  bottomNavLink: string
  bottomNavText: string
  isCheckoutPending: boolean
  isLoading?: boolean
  onProceedToCheckout: () => void
}

function CatalogBottomNav({
  bottomNavLink,
  bottomNavText,
  isCheckoutPending,
  isLoading = false,
  onProceedToCheckout,
}: CatalogBottomNavProps) {
  return (
    <div className="flex flex-col items-center gap-4 pb-10 sm:pb-18">
      <Button
        disabled={isLoading}
        type="button"
        size="2xl"
        className="w-57.5 rounded-full uppercase sm:h-17.75!"
        render={isLoading ? undefined : <Link href={bottomNavLink} />}
      >
        {bottomNavText}
      </Button>
      <button
        type="button"
        disabled={isLoading || isCheckoutPending}
        onClick={onProceedToCheckout}
        className="text-sm font-medium text-alternate uppercase underline underline-offset-4 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Proceed to Checkout
      </button>
    </div>
  )
}
