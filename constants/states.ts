export interface USStateOption {
  value: string
  label: string
}

export const US_STATES_MAP: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  PR: "Puerto Rico",
}

export const US_STATES_LIST: USStateOption[] = Object.entries(US_STATES_MAP)
  .map(([abbr, name]) => ({ value: abbr, label: name }))
  .sort((a, b) => a.label.localeCompare(b.label))

export function toUSStateAbbr(state: string): string {
  const trimmed = state.trim()
  if (!trimmed) return trimmed

  const upper = trimmed.toUpperCase()
  if (US_STATES_MAP[upper]) return upper

  const byName = Object.entries(US_STATES_MAP).find(
    ([, name]) => name.toLowerCase() === trimmed.toLowerCase()
  )
  if (byName) return byName[0]

  return trimmed
}

export function isUSCountry(country: string): boolean {
  const normalized = country.trim().toLowerCase()
  return (
    normalized === "us" ||
    normalized === "united states" ||
    normalized === "amerika serikat"
  )
}

export function getNormalizedState(country: string, state: string): string {
  if (!isUSCountry(country)) return state.trim()
  return toUSStateAbbr(state)
}
