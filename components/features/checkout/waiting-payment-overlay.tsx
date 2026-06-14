"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { StockLockTimer } from "@/components/global/stock-lock-timer"

interface WaitingPaymentOverlayProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  checkoutUrl: string
  expiresAt?: number | string | null
  onExpire?: () => void
}

export function WaitingPaymentOverlay({
  isOpen,
  onOpenChange,
  checkoutUrl,
  expiresAt,
  onExpire,
}: WaitingPaymentOverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="rounded-2xl border-none shadow-2xl sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-4 pt-4 pb-2">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-center text-2xl font-semibold tracking-tight text-header">
              Waiting for Payment
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Please complete your checkout in the securely opened Shopify
              window.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-3 p-6">
          {expiresAt && (
            <div className="flex w-fit justify-center">
              <StockLockTimer expiresAt={expiresAt} onExpire={onExpire} />
            </div>
          )}

          <div className="rounded-md bg-muted p-4 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Once you complete your payment on Shopify, this window will
              automatically redirect you to your receipt.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 pt-2">
            <Button
              type="button"
              size="xl"
              onClick={() => {
                if (checkoutUrl) window.open(checkoutUrl, "_blank")
              }}
              className="w-full rounded-full"
            >
              Reopen Payment Window
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-auto bg-transparent p-2 text-destructive hover:bg-transparent hover:opacity-80"
              onClick={() => onOpenChange(false)}
            >
              Cancel & Return
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
