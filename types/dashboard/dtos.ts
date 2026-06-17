export interface DashboardSummaryResponseDto {
  recent_orders: RecentOrderDto[]
  sales_report: SalesReportDto
  stat_cards: StatCardsDto
}

export interface MonthlyRevenueDto {
  month: string
  revenue: number
}

export interface PreOrderStatDto {
  count: number
  status_label: string
}

export interface RecentOrderDto {
  customer_name: string
  items_preview: string
  order_number: string
  status: string
  status_label: string
}

export interface SalesReportDto {
  currency: string
  monthly_revenue: MonthlyRevenueDto[]
  total_revenue_this_month: number
}

export interface StatCardsDto {
  available_stock: StatValueDto
  orders_in_progress: StatValueDto
  pre_orders: PreOrderStatDto
  total_products: number
}

export interface StatValueDto {
  count: number
  delta_today?: number
}
