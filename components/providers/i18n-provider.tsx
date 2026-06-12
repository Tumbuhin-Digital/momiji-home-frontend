"use client"

import { useEffect, useState } from "react"

import i18n from "i18next"
import { I18nextProvider, initReactI18next } from "react-i18next"

import en from "@/constants/locales/en"
import id from "@/constants/locales/id"

import type { ReactNode } from "react"

const resources = {
  id: { translation: id },
  en: { translation: en },
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initLanguage = async () => {
      try {
        const currentLng = "en"

        if (currentLng && currentLng !== i18n.language) {
          await i18n.changeLanguage(currentLng)
        }
      } catch (error) {
        console.error("Failed to initialize language:", error)
      } finally {
        setIsReady(true)
      }
    }

    initLanguage()
  }, [])

  if (!isReady) {
    return null
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
