import SettingsClient from "@/components/features/settings/settings-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage checkout shipping descriptions and app settings.",
}

export default function SettingsPage() {
  return <SettingsClient />
}
