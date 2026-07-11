import { toUSStateAbbr } from "@/constants/states"

export interface ParsedAddressPaste {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

/** Parses "street, city, STATE ZIP[, country]" clipboard text. */
export function parseAddressPaste(text: string): ParsedAddressPaste | null {
  const parts = text.split(",").map((p) => p.trim())
  if (parts.length < 3) return null

  const address = parts[0]
  const city = parts[1]
  const stateZip = parts[2]
  let country = parts[3] || "United States"
  if (country.toLowerCase() === "amerika serikat") {
    country = "United States"
  }

  const stateZipParts = stateZip.split(/\s+/)
  let state = stateZipParts[0] || ""
  const zipCode = stateZipParts.slice(1).join(" ")

  if (state) {
    state = toUSStateAbbr(state)
  }

  return { address, city, state, zipCode, country }
}
