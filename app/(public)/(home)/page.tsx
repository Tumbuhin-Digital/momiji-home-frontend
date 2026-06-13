import Link from "next/link"

import { Button } from "@/components/ui/button"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bespoke Rattan Furniture, Home Decor, Toys",
  description: "Premium B2B Supply Orchestration for Modern Interiors.",
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <div className="flex flex-col items-center justify-center gap-8 py-20">
        <div className="flex flex-col gap-3.75 text-center">
          <h1 className="text-[32px] font-medium tracking-tight text-header sm:text-6xl">
            B2B Order Form
          </h1>
          <p className="text-alternate sm:text-2xl">
            For retail pricing & our catalog, please visit{" "}
            <a
              href="https://momiji-home.com"
              target="_blank"
              className="inline-block cursor-pointer text-link underline underline-offset-4 transition-opacity hover:text-link/80"
            >
              momiji-home.com
            </a>
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-8 pb-8 sm:flex-row sm:pb-0">
        <div className="group relative block h-70 w-full overflow-hidden transition-all duration-300 ease-out active:opacity-80 lg:h-82.5 lg:w-151">
          <div className="absolute inset-0 bg-[url('/images/assets/bg-card-in-stock.png')] bg-cover bg-bottom transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 text-center">
            <Link href="/shop-in-stock">
              <Button
                type="button"
                className="h-17.75 w-57.5 gap-2.5 rounded-full border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
              >
                <span className="text-base font-medium uppercase">
                  SHOP SHIP-READY
                </span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="group relative block h-70 w-full overflow-hidden transition-all duration-300 ease-out active:opacity-80 lg:h-82.5 lg:w-151">
          <div className="absolute inset-0 bg-[url('/images/assets/bg-card-preoder.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 text-center">
            <Link href="/shop-preorder">
              <Button
                type="button"
                className="h-17.75 w-57.5 gap-2.5 rounded-full border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
              >
                <span className="text-base font-medium uppercase">
                  SHOP PRE-ORDER
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
