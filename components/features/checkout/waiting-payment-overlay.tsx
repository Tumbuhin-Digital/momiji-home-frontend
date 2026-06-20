"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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
      <DialogContent
        className="rounded-3xl border-none p-6 sm:max-w-115"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="relative flex size-14 items-center justify-center rounded-full bg-primary/5">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 opacity-50 duration-3000" />
            <Loader2
              className="relative z-10 size-8 animate-spin text-primary"
              strokeWidth={2.5}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-2 text-center">
            <p className="font-medium text-primary">Securing Your Order</p>
            <h2 className="text-2xl text-alternate">Taking you to Payment</h2>
            <p className="max-w-85 text-alternate/60">
              We&apos;re setting up a secure checkout for your order. This
              usually takes just a moment.
            </p>
          </div>

          {expiresAt && (
            <div className="flex w-full justify-center">
              <StockLockTimer expiresAt={expiresAt} onExpire={onExpire} />
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-2.25">
            <p className="text-center text-alternate">
              Not redirected automatically?
            </p>
            <Button
              type="button"
              onClick={() => {
                if (checkoutUrl) window.open(checkoutUrl, "_blank")
              }}
              className="h-13! w-full rounded-sm text-lg font-medium"
            >
              Take me to payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
