export type WarehouseCode = "east" | "west"

export function warehouseLabel(code?: WarehouseCode | string): string {
  if (code === "west") return "West Coast 3PL"
  return "East Coast 3PL"
}
