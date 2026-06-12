import type { ActivityLog, ActivityQueryParams } from "@/types/activity"

const initialActivities: ActivityLog[] = [
  {
    id: "act-1",
    type: "system",
    action: "SYSTEM_BOOT",
    description: "MOMIJI Terminal cluster initialized.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
]

const store = {
  activities: [...initialActivities],
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function listActivities(
  params: ActivityQueryParams = {}
): ActivityLog[] {
  let filtered = store.activities

  if (params.type && params.type !== "all") {
    filtered = filtered.filter((a) => a.type === params.type)
  }

  // Newest first
  filtered = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  if (params.limit) {
    filtered = filtered.slice(0, params.limit)
  }

  return clone(filtered)
}

export function addActivity(
  activity: Omit<ActivityLog, "id" | "timestamp">
): ActivityLog {
  const newActivity: ActivityLog = {
    ...activity,
    id: `act-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  store.activities.push(newActivity)
  return clone(newActivity)
}
