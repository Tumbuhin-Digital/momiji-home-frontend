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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Waiting for Payment
          </DialogTitle>
          <DialogDescription className="pt-2 text-center">
            Please complete your checkout in the securely opened Shopify window.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-6 py-6">
          {expiresAt && (
            <StockLockTimer expiresAt={expiresAt} onExpire={onExpire} />
          )}

          <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/20">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/40 opacity-20 duration-3000" />
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>

          <p className="px-4 text-center text-sm text-muted-foreground">
            Once you complete your payment on Shopify, the new window will
            redirect you to your receipt.
          </p>

          <Button
            variant="outline"
            onClick={() => {
              if (checkoutUrl) window.open(checkoutUrl, "_blank")
            }}
            className="mt-2 w-full font-medium"
          >
            Click here if the window didn&apos;t open
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
