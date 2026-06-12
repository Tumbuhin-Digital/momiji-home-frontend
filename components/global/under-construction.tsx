"use client"

import Link from "next/link"
import { Construction } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UnderConstructionProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function UnderConstruction({
  title = "Under Development",
  description = "This section of the MOMIJI dashboard is currently undergoing system maintenance or is under active construction. We are building a premium experience for you.",
  actionLabel = "Back to Dashboard",
  actionHref = "/dashboard",
}: UnderConstructionProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative flex max-w-md flex-col items-center rounded-3xl border border-neutral-100 bg-[#FFFAF0]/50 p-8 shadow-xl ring-1 ring-foreground/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-black/5">
        <div className="absolute -top-10 flex size-20 items-center justify-center rounded-2xl bg-[#2E7F9C]/10 text-[#2E7F9C] shadow-lg ring-1 shadow-[#2E7F9C]/10 ring-[#2E7F9C]/20">
          <Construction className="size-10 animate-bounce" />
        </div>
        <div className="mt-8 space-y-4">
          <h1 className="text-3xl font-black tracking-tighter text-neutral-800 uppercase sm:text-4xl dark:text-neutral-200">
            {title.split("").map((word, idx) => (
              <span key={idx}>
                {idx > 0 && ""}
                {idx === title.split("").length - 1 ? (
                  <span className="font-light text-[#2E7F9C] lowercase italic">
                    {word}
                  </span>
                ) : (
                  word
                )}
              </span>
            ))}
          </h1>
          <p className="text-sm leading-relaxed text-[#697586] dark:text-neutral-400">
            {description}
          </p>
        </div>
        <div className="mt-8 flex w-full justify-center">
          <Button
            asChild
            type="button"
            className="h-17.75 w-57.5 gap-2.5 border border-primary p-6 backdrop-blur-md hover:scale-105 hover:bg-primary"
          >
            <Link href={actionHref}>
              <span className="text-base font-medium uppercase">
                {actionLabel}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
