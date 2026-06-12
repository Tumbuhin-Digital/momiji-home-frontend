"use server"

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { cookies } from "next/headers"

export async function setCookies(
  key: string,
  value: string,
  options?: Partial<ResponseCookie>
) {
  const cookieStore = await cookies()
  cookieStore.set(key, value, {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
    ...options,
  })
}

export async function getCookies(key: string) {
  const cookieStore = await cookies()
  return cookieStore.get(key)
}

export async function deleteCookie(key: string) {
  const cookieStore = await cookies()
  cookieStore.delete(key)
}
