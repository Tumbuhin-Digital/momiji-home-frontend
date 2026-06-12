"use client"

import { useEffect, useState } from "react"

import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    window.addEventListener("scroll", toggleVisibility)
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <div
      className={cn(
        "fixed bottom-8 left-8 z-50 transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-10 opacity-0"
      )}
    >
      <Button
        onClick={scrollToTop}
        size="icon"
        className="size-10 rounded-full bg-primary/20 text-primary shadow-2xl ring-1 shadow-primary/20 ring-primary/20 hover:bg-primary/10 sm:size-12"
        aria-label="Scroll to top"
      >
        <ArrowUp className="size-4 sm:size-6" />
      </Button>
    </div>
  )
}
