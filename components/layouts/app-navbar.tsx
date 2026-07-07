"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import { useCart } from "@/hooks"
import { useCartStore } from "@/lib/stores/cart.store"
import { IconBag } from "@/public/icons/icon-bag"

import type { FormEvent } from "react"

export function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: cartData } = useCart()
  const setIsOpen = useCartStore((state) => state.setIsOpen)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const count = [
    ...(cartData?.ship_ready ?? []),
    ...(cartData?.pre_order ?? []),
  ].reduce((sum, item) => sum + item.quantity, 0)

  if (pathname === "/login" || pathname?.startsWith("/auth")) {
    return null
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const keyword = searchQuery.trim()
    if (!keyword) return
    setIsMobileSearchOpen(false)
    router.push(`/search?search=${encodeURIComponent(keyword)}`)
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-primary/10 bg-navbar p-4 shadow-xs backdrop-blur-md transition-all duration-300 sm:h-24 sm:px-10 sm:py-4">
      <div className="flex flex-1">
        <form
          className="hidden w-xs max-w-full shrink-0 sm:block"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <div className="relative flex h-10 items-center rounded-md border border-[#E2E2E2] bg-white pr-10 pl-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="What are you looking for?"
              className="h-full w-full border-0 bg-transparent p-0 text-xs text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Search products"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
            >
              <Search className="size-4.5" />
            </button>
          </div>
        </form>
      </div>
      <div className="flex shrink-0 justify-center">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Momiji Logo"
            width={210}
            height={24}
            className="h-6 w-auto object-contain transition-transform duration-500 sm:h-8"
            priority
          />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-8">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="relative size-6! cursor-pointer bg-transparent transition-all hover:bg-transparent sm:hidden"
          onClick={() => setIsMobileSearchOpen(true)}
          aria-label="Open search modal"
        >
          <Search className="size-6 text-black" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="relative size-6! cursor-pointer bg-transparent transition-all hover:bg-transparent sm:size-8!"
          onClick={() => setIsOpen(true)}
        >
          <IconBag className="size-6 text-black sm:size-8" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1.25 size-4 min-w-4 rounded-full p-0 text-[8px] font-medium"
            >
              {count}
            </Badge>
          )}
        </Button>
      </div>
      <Dialog open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
        <DialogContent
          showCloseButton={false}
          className="mt-[max(env(safe-area-inset-top),1rem)] w-[calc(100%-2rem)] max-w-none self-start rounded-none border-none bg-transparent p-0 shadow-none sm:hidden"
        >
          <form onSubmit={handleSearchSubmit} role="search">
            <div className="relative flex h-12 items-center border border-[#E2E2E2] bg-white pr-12 pl-4">
              <Search className="mr-2 size-5 shrink-0 text-foreground/70" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="What are you looking for?"
                className="h-full w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search products"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                aria-label="Close search modal"
                className="absolute top-1/2 right-4 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
