"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { useCart } from "@/hooks"
import { useCartStore } from "@/lib/stores/cart.store"
import { IconBag } from "@/public/icons/icon-bag"

export function AppNavbar() {
  const pathname = usePathname()
  const { data: cartData } = useCart()
  const setIsOpen = useCartStore((state) => state.setIsOpen)

  const count = [
    ...(cartData?.ship_ready ?? []),
    ...(cartData?.pre_order ?? []),
  ].reduce((sum, item) => sum + item.quantity, 0)

  if (pathname === "/login" || pathname?.startsWith("/auth")) {
    return null
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-primary/10 bg-navbar p-4 shadow-xs backdrop-blur-md transition-all duration-300 sm:h-24 sm:px-10 sm:py-4">
      <div className="flex flex-1" />
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
      <div className="flex flex-1 items-center justify-end gap-8">
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
    </header>
  )
}
