import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const ACCESS_TOKEN_COOKIE = "access_token"

const PUBLIC_ROUTES = [
  "/",
  "/api",
  "/auth/login",
  "/cart",
  "/order-confirmed",
  "/shop-in-stock",
  "/shop-preorder",
  "/checkout",
]

const BUYER_ROUTES = [
  "/cart",
  "/order-confirmed",
  "/shop-in-stock",
  "/shop-preorder",
  "/checkout",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isBuyerRoute = BUYER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get("refresh_token")?.value
  const isAuthenticated = Boolean(token || refreshToken)

  let userRole = ""
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1]
      if (payloadBase64) {
        const payloadJson = atob(
          payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
        )
        const payload = JSON.parse(payloadJson)
        userRole = payload.role || ""
      }
    } catch {}
  }

  if (isAuthenticated && userRole === "admin" && isBuyerRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isAuthenticated && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
