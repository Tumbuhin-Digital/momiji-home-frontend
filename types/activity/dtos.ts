import type { ActivityType } from "./entities"

export interface ActivityQueryParams {
  limit?: number
  type?: ActivityType | "all"
}
