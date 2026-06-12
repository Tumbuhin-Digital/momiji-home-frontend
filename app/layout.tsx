import { Suspense } from "react"
import { Inter, Lora, Roboto } from "next/font/google"

import { Loader2 } from "lucide-react"
import "./globals.css"

import RootProvider from "@/components/providers/root-provider"

import { cn } from "@/lib/utils"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "MOMIJI",
    template: "%s | MOMIJI",
  },
  description: "Premium B2B Supply Orchestration for Modern Interiors.",
  icons: {
    icon: "/favicon.ico",
  },
}

const fontSans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const fontSerif = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
})

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontSerif.variable,
        fontInter.variable
      )}
    >
      <body>
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          }
        >
          <RootProvider>{children}</RootProvider>
        </Suspense>
      </body>
    </html>
  )
}
