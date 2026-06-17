export interface DashboardSummary {
  recentOrders: RecentOrder[]
  salesReport: SalesReport
  statCards: StatCards
}

export interface MonthlyRevenue {
  month: string
  revenue: number
}

export interface PreOrderStat {
  count: number
  statusLabel: string
}

export interface RecentOrder {
  customerName: string
  itemsPreview: string
  orderNumber: string
  status: string
  statusLabel: string
}

export interface SalesReport {
  currency: string
  monthlyRevenue: MonthlyRevenue[]
  totalRevenueThisMonth: number
}

export interface StatCards {
  availableStock: StatValue
  ordersInProgress: StatValue
  preOrders: PreOrderStat
  totalProducts: number
}

export interface StatValue {
  count: number
  deltaToday?: number
}
