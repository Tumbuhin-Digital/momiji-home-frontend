/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"

import { AdminSidebar } from "./admin-sidebar"

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isSidebarOpen])

  return (
    <div className="relative flex min-h-screen gap-6 bg-white">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-[#FFFAF0] px-4 shadow-sm xl:hidden">
        <div className="flex w-12 justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="hover:bg-transparent"
          >
            <Menu className="size-6 text-slate-600" />
          </Button>
        </div>

        <div className="flex flex-1 justify-center">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Momiji Logo"
              width={180}
              height={45}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="w-12" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden xl:block">
        <AdminSidebar className="sticky top-0" />
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 xl:hidden ${
          isSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Overlay Gelap */}
        <div
          className="absolute inset-0 bg-black/40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Panel Sidebar */}
        <div
          className={`relative h-full w-full transform bg-[#FFFAF0] shadow-2xl transition-transform duration-300 ease-in-out sm:w-64 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-16 xl:pt-0">{children}</main>
    </div>
  )
}
