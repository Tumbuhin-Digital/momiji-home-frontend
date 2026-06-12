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
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-primary/10 bg-[#F3EEEB] p-4 shadow-xs backdrop-blur-md transition-all duration-300 sm:h-24 sm:px-10 sm:py-4 lg:h-31.5">
      <div className="flex flex-1" />
      <div className="flex shrink-0 justify-center">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Momiji Logo"
            width={231}
            height={44}
            className="h-8 w-41.75 object-contain transition-transform duration-500 hover:scale-105 sm:h-11 sm:w-57.75"
            priority
          />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-8">
        <Button
          onClick={() => setIsOpen(true)}
          size="icon-sm"
          className="relative cursor-pointer bg-transparent transition-all hover:bg-transparent"
        >
          <IconBag className="size-8 text-alternate" />
          {count > 0 && (
            <Badge className="absolute -top-0.5 right-0 flex size-4 items-center justify-center rounded-full bg-destructive p-0 text-[8px] font-black">
              {count}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  )
}
