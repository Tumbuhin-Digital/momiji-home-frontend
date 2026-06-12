export type ActivityType = "order" | "inventory" | "pricing" | "sync" | "system"

export interface ActivityLog {
  action: string
  description: string
  id: string
  metadata?: Record<string, unknown>
  timestamp: string
  type: ActivityType
}
