import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { dashboardService } from "@/lib/services"

export function useDashboardSummary() {
  return useQuery({
    queryFn: () => dashboardService.getDashboardSummary(),
    queryKey: queryKeys.dashboard.summary(),
    staleTime: 1000 * 60 * 5,
  })
}
