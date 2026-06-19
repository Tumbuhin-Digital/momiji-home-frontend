/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, createContext, useContext } from "react"

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "@/lib/utils"

import type React from "react"

const PreviewCardContext = createContext<{
  open: boolean
  setOpen: (open: boolean, event?: any) => void
  isTouchDevice: boolean
} | null>(null)

export function PreviewCard({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Root>): React.ReactElement {
  const [localOpen, setLocalOpen] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : localOpen
  const onOpenChange = (nextOpen: boolean, event?: any) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(nextOpen, event)
    } else {
      setLocalOpen(nextOpen)
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice(!mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches)
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <PreviewCardContext.Provider
      value={{ open, setOpen: onOpenChange, isTouchDevice }}
    >
      <PreviewCardPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        {...props}
      >
        {children}
      </PreviewCardPrimitive.Root>
    </PreviewCardContext.Provider>
  )
}

export function PreviewCardTrigger({
  children,
  onClick,
  ...props
}: PreviewCardPrimitive.Trigger.Props): React.ReactElement {
  const context = useContext(PreviewCardContext)

  const handleClick = (e: any) => {
    if (context?.isTouchDevice) {
      // Toggle open state on touch/mobile devices
      context.setOpen(!context.open)
    }
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      onClick={handleClick}
      {...props}
    >
      {children}
    </PreviewCardPrimitive.Trigger>
  )
}

export function PreviewCardPopup({
  className,
  children,
  align = "center",
  sideOffset = 4,
  anchor,
  portalProps,
  ...props
}: PreviewCardPrimitive.Popup.Props & {
  align?: PreviewCardPrimitive.Positioner.Props["align"]
  sideOffset?: PreviewCardPrimitive.Positioner.Props["sideOffset"]
  anchor?: PreviewCardPrimitive.Positioner.Props["anchor"]
  portalProps?: PreviewCardPrimitive.Portal.Props
}): React.ReactElement {
  return (
    <PreviewCardPrimitive.Portal {...portalProps}>
      <PreviewCardPrimitive.Positioner
        align={align}
        anchor={anchor}
        className="z-50"
        data-slot="preview-card-positioner"
        sideOffset={sideOffset}
      >
        <PreviewCardPrimitive.Popup
          className={cn(
            "relative flex w-64 origin-(--transform-origin) rounded-lg border bg-popover p-4 text-sm text-balance text-popover-foreground shadow-lg/5 transition-[scale,opacity] not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
            className
          )}
          data-slot="preview-card-content"
          {...props}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export {
  PreviewCardPrimitive,
  PreviewCard as HoverCard,
  PreviewCardTrigger as HoverCardTrigger,
  PreviewCardPopup as HoverCardContent,
}
