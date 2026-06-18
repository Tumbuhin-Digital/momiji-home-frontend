"use client"

import React from "react"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import I18nProvider from "@/components/providers/i18n-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

import { CartSessionBootstrap } from "@/components/providers/cart-session-bootstrap"
import { ToastProvider } from "@/components/ui/toast"
import { GlobalLoadingOverlay } from "@/components/global/global-loading-overlay"

function RootProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <I18nProvider>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider position="bottom-right">{children}</ToastProvider>
            <CartSessionBootstrap />
            <GlobalLoadingOverlay />
          </ThemeProvider>
        </NuqsAdapter>
      </I18nProvider>
    </QueryProvider>
  )
}

export default RootProvider
