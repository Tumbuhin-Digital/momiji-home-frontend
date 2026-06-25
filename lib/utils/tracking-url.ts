export function buildTrackingUrl(carrier: string, trackingNumber: string): string {
  const num = trackingNumber.trim()
  if (!num) return ""

  const encoded = encodeURIComponent(num)
  switch (carrier.toLowerCase()) {
    case "ups":
    case "unishippers":
      return `https://www.ups.com/track?tracknum=${encoded}`
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`
    default:
      return ""
  }
}

export const CARRIER_OPTIONS = [
  { value: "UPS", label: "UPS" },
  { value: "USPS", label: "USPS" },
  { value: "Unishippers", label: "Unishippers" },
  { value: "FedEx", label: "FedEx" },
  { value: "Custom", label: "Custom" },
] as const
