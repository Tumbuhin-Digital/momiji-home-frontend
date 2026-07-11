import { Settings, FilePlus2 } from "lucide-react"
import { IconlyActivity } from "@/public/icons/iconly-activity"
import { IconlyBag } from "@/public/icons/iconly-bag"
import { IconlyCategory } from "@/public/icons/iconly-category"
import { IconShopRemove } from "@/public/icons/iconsax-shop-remove"
import { IconShoppingCart } from "@/public/icons/iconsax-shopping-cart"

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: IconlyCategory,
  },
  {
    title: "Product",
    href: "/products",
    icon: IconShopRemove,
  },
  {
    title: "Manage Order",
    href: "/order-management",
    icon: IconShoppingCart,
  },
  {
    title: "Manual Order",
    href: "/manual-order",
    icon: FilePlus2,
  },
  {
    title: "Pre-Order List",
    href: "/pre-order-list",
    icon: IconlyBag,
  },
  {
    title: "Sales Report",
    href: "/sales-report",
    icon: IconlyActivity,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]
