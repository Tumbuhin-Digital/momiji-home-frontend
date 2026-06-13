"use client"

import React from "react"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import { Toaster } from "@/components/ui/sonner"

import I18nProvider from "@/components/providers/i18n-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

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
            {children}
            <Toaster richColors />
            <GlobalLoadingOverlay />
          </ThemeProvider>
        </NuqsAdapter>
      </I18nProvider>
    </QueryProvider>
  )
}

export default RootProvider
