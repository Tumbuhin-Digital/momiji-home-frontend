"use client"

import Link from "next/link"
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

import { useInfiniteProducts } from "@/hooks"

import type { ProductCatalogPageClientProps } from "@/types/products"

export function ProductCatalogPageClient({
  category,
  title,
  bottomNavLink,
  bottomNavText,
}: ProductCatalogPageClientProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  const observerTarget = useRef<HTMLDivElement>(null)

  const itemsPerPage = windowWidth >= 1280 ? 6 : windowWidth >= 768 ? 6 : 8

  const fulfillmentType =
    category === "ship-ready"
      ? "ship_ready"
      : category === "pre-order"
        ? "pre_order"
        : undefined

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteProducts({
      fulfillment_type: fulfillmentType,
      limit: itemsPerPage,
    })

  const allVariants = data?.pages.flatMap((page) => page.data) ?? []

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true)
      if (typeof window !== "undefined") {
        setWindowWidth(window.innerWidth)
      }
    }, 0)

    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", handleResize)
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
      <div className="flex flex-col items-center justify-center gap-8">
        <header className="px-4 pt-10 pb-6 text-center sm:px-10">
          <h1 className="text-[32px] font-medium tracking-widest text-header md:text-4xl lg:text-6xl">
            {title}
          </h1>
        </header>
        <div className="grid w-full grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-8 sm:px-10">
          {Array.from({ length: itemsPerPage }).map((_, idx) => (
            <ProductCatalogCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <header className="px-4 pt-10 pb-6 text-center sm:px-10">
        <h1 className="text-[32px] font-medium tracking-widest text-header md:text-4xl lg:text-6xl">
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
                No Products Found
              </EmptyTitle>
              <EmptyDescription className="text-base text-muted-foreground sm:text-lg">
                It looks like we don&apos;t have any products in this category
                right now. Please check back later or explore other categories.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-4 px-4 sm:gap-6 sm:px-10 md:grid-cols-3">
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
              <div className="h-full py-2.5">
                <ProductCatalogCard product={product} />
              </div>
            </motion.div>
          ))}

          {isFetchingNextPage && (
            <>
              {Array.from({ length: windowWidth >= 768 ? 3 : 2 }).map(
                (_, idx) => (
                  <ProductCatalogCardSkeleton key={`skeleton-load-${idx}`} />
                )
              )}
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

      <div className="flex items-center justify-center pb-2">
        <Button
          type="button"
          className="h-17.75 w-57.5 gap-2.5 rounded-full p-6 backdrop-blur-md transition-all duration-200 hover:scale-105"
          render={<Link href={bottomNavLink} />}
        >
          <span className="text-base font-medium uppercase">
            {bottomNavText}
          </span>
        </Button>
      </div>
    </div>
  )
}
