export interface PhaseOneFeature {
  id: string
  title: string
  description: string
  status: "ready" | "in-progress" | "planned"
}

export const phaseOneScope: PhaseOneFeature[] = [
  {
    id: "product-management",
    title: "Product list and detail",
    description:
      "Display synced products with search and basic product detail view.",
    status: "ready",
  },
  {
    id: "inventory-update",
    title: "Inventory adjustment",
    description:
      "Adjust local inventory, mark pending sync, and keep optimistic UI feel.",
    status: "ready",
  },
  {
    id: "pricing-override",
    title: "Pricing override",
    description:
      "Update base and override price locally before backend integration.",
    status: "ready",
  },
  {
    id: "category-assignment",
    title: "Category assignment",
    description:
      "Assign products into pre-order or ship-ready buckets for filtering.",
    status: "ready",
  },
  {
    id: "dashboard-summary",
    title: "Dashboard summary",
    description:
      "Show total products, low stock count, and pending sync count.",
    status: "ready",
  },
]
