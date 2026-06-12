export type ActivityType = "order" | "inventory" | "pricing" | "sync" | "system"

export interface ActivityLog {
  id: string
  type: ActivityType
  action: string
  description: string
  metadata?: Record<string, unknown>
  timestamp: string
}
