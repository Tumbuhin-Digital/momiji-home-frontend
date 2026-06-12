import type { ActivityType } from "./entities"

export interface ActivityQueryParams {
  type?: ActivityType | "all"
  limit?: number
}
