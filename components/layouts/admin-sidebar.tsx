"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LogoutConfirmModal } from "@/components/layouts/logout-confirm-modal"
import { Separator } from "@/components/ui/separator"

import { navItems } from "@/constants/navigation"
import { IconlyLogout } from "@/public/icons/iconly-logout"

import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  className?: string
  onClose?: () => void
}

export function AdminSidebar({ className, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowLogoutConfirm(true)
  }

  return (
    <aside
      className={cn(
        "flex h-screen w-full flex-col gap-4 border-r-2 border-neutral-200 bg-secondary px-4 pt-8 pb-4 xl:w-64",
        className
      )}
    >
      <div className="flex justify-center">
        <Link href="/dashboard" onClick={onClose}>
          <Image
            src="/images/logo.png"
            alt="MOMIJI Logo"
            width={240}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
      </div>
      <nav className="flex flex-col gap-2">
        <p className="font-medium text-neutral-400">Operations</p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 border-l-4 border-transparent p-3 font-medium transition-colors",
                isActive
                  ? "border-[#2E7F9C] bg-primary text-secondary"
                  : "text-[#697586] hover:opacity-80"
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  isActive ? "text-secondary" : "text-[#697586]"
                )}
              />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <Separator className="bg-neutral-400" />
      <span
        onClick={(e) => {
          handleLogoutClick(e)
          onClose?.()
        }}
        className="group relative flex cursor-pointer items-center gap-3 border-l-4 border-transparent p-3 font-medium text-[#697586] transition-colors hover:opacity-80"
      >
        <IconlyLogout className="size-5 text-[#697586]" />
        Log Out
      </span>

      <div className="mt-auto">
        <p className="font-medium text-neutral-400">Powered by Tumbuhin</p>
      </div>
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </aside>
  )
}
