import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const ACCESS_TOKEN_COOKIE = "access_token"

const ADMIN_ROUTES = [
  "/dashboard",
  "/products",
  "/order-management",
  "/pre-order-list",
  "/sales-report",
  "/settings",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get("refresh_token")?.value
  const isAuthenticated = Boolean(token || refreshToken)

  let userRole = ""
  if (token) {
    try {
      const parts = token.split(".")
      if (parts.length === 3) {
        const payloadBase64 = parts[1]
        let base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
        while (base64.length % 4 !== 0) {
          base64 += "="
        }
        const payloadJson = atob(base64)
        const payload = JSON.parse(payloadJson)
        userRole = payload.role || ""
      }
    } catch {}
  }

  if (isAuthenticated && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isAdminRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set(
      "from",
      request.nextUrl.pathname + request.nextUrl.search
    )
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && userRole === "admin" && !isAdminRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
