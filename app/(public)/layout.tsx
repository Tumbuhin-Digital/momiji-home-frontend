import { CartSheet } from "@/components/features/cart/cart-sheet"
import { ScrollToTop } from "@/components/global/scroll-to-top"
import { AppNavbar } from "@/components/layouts/app-navbar"

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AppNavbar />
      <main className="flex-1 pt-16 sm:pt-24 lg:pt-32">{children}</main>
      <ScrollToTop />
      <CartSheet />
    </div>
  )
}
