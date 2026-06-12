"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { FileQuestion, Lock, ShieldAlert, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

const ICON_MAP = {
  lock: Lock,
  "shield-alert": ShieldAlert,
  "file-question": FileQuestion,
  wrench: Wrench,
}

type IconName = keyof typeof ICON_MAP

interface ActionButton {
  label: string
  href: string
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link"
}

interface ErrorViewProps {
  code: string
  title: string
  description: string
  hint?: string
  icon: IconName
  iconColorClass?: string
  iconBgClass?: string
  actions?: ActionButton[]
}

export function ErrorView({
  code,
  title,
  description,
  hint,
  icon,
  iconColorClass = "text-[#2E7F9C]",
  iconBgClass = "bg-[#2E7F9C]/10 ring-[#2E7F9C]/20",
  actions,
}: ErrorViewProps) {
  const pathname = usePathname()
  const isAdmin =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")

  const defaultActions: ActionButton[] = [
    {
      label: isAdmin ? "Dashboard" : "Home",
      href: isAdmin ? "/dashboard" : "/",
      variant: "default",
    },
  ]

  const finalActions = actions || defaultActions

  const Icon = ICON_MAP[icon] || FileQuestion
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl",
            iconBgClass
          )}
        >
          <Icon className={cn("size-8", iconColorClass)} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Error {code}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
          {hint && <p className="text-sm text-muted-foreground/80">{hint}</p>}
        </div>

        <div className="flex w-full flex-col gap-3 pt-4 sm:w-auto sm:min-w-50">
          {finalActions.map((act, index) => (
            <Button
              key={index}
              asChild
              type="button"
              className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
            >
              <Link href={act.href}>
                <span className="text-base font-medium uppercase">
                  {act.label}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
