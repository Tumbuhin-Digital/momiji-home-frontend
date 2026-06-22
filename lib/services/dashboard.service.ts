import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  DashboardSummary,
  DashboardSummaryResponseDto,
  MonthlyRevenueDto,
  RecentOrder,
  RecentOrderDto,
  SalesReport,
  StatCards,
  StatCardsDto,
} from "@/types/dashboard"

async function getDashboardSummary(): Promise<DashboardSummary> {
  const response =
    await apiClient.get<BaseResponse<DashboardSummaryResponseDto>>(
      "/dashboard/summary"
    )

  const data = response.data
  if (!data) {
    throw new Error("Failed to get dashboard summary")
  }

  return {
    recentOrders: mapRecentOrders(data.recent_orders || []),
    salesReport: mapSalesReport(data.sales_report),
    statCards: mapStatCards(data.stat_cards),
  }
}

function mapRecentOrders(dtos: RecentOrderDto[]): RecentOrder[] {
  return dtos.map((dto) => ({
    customerName: dto.customer_name,
    itemsPreview: dto.items_preview,
    orderNumber: dto.order_number,
    status: dto.status,
    statusLabel: dto.status_label,
  }))
}

function mapSalesReport(
  dto: DashboardSummaryResponseDto["sales_report"]
): SalesReport {
  return {
    currency: dto.currency,
    monthlyRevenue: dto.monthly_revenue.map((m: MonthlyRevenueDto) => ({
      month: m.month,
      revenue: m.revenue,
    })),
    totalRevenueThisMonth: dto.total_revenue_this_month,
  }
}

function mapStatCards(dto: StatCardsDto): StatCards {
  return {
    availableStock: {
      count: dto.available_stock.count,
      deltaToday: dto.available_stock.delta_today,
    },
    ordersInProgress: {
      count: dto.orders_in_progress.count,
      deltaToday: dto.orders_in_progress.delta_today,
    },
    preOrders: {
      count: dto.pre_orders.count,
      statusLabel: dto.pre_orders.status_label,
    },
    totalProducts: dto.total_products,
  }
}

export const dashboardService = {
  getDashboardSummary,
}
