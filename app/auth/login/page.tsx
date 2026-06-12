import LoginPageClient from "@/components/features/auth/login-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard Login",
  description: "Login to MOMIJI Admin Dashboard",
}

export default function LoginPage() {
  return <LoginPageClient />
}
