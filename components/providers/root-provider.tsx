"use client"

import React from "react"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import { Toaster } from "@/components/ui/sonner"

import I18nProvider from "@/components/providers/i18n-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

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
          </ThemeProvider>
        </NuqsAdapter>
      </I18nProvider>
    </QueryProvider>
  )
}

export default RootProvider
