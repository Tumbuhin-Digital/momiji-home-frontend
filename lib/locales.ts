"use client"

import i18n from "i18next"

import { getCookies, setCookies } from "./cookie"

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

const localeList = ["id", "en"] as const
export type Locale = (typeof localeList)[number]

const locales = new Set(localeList)

function isLocale(value: unknown): value is Locale {
  return locales.has(value as Locale)
}

export async function setLocale(locale: unknown) {
  if (!isLocale(locale)) return

  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale)
  }

  await setCookies("locale", locale, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  } as ResponseCookie)
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await getCookies("locale")
  const locale = cookieStore?.value

  if (isLocale(locale)) return locale

  return (i18n.language as Locale) ?? "en"
}
