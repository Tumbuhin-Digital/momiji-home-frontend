"use client"

import { useState } from "react"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"

import { StockLockTimer } from "@/components/global/stock-lock-timer"

import { useBeforeUnload } from "@/hooks/use-before-unload"

interface WaitingPaymentOverlayProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  checkoutUrl: string
  expiresAt?: number | string | null
  onExpire?: () => void
  onAbandon?: () => void | Promise<void>
}

export function WaitingPaymentOverlay({
  isOpen,
  onOpenChange,
  checkoutUrl,
  expiresAt,
  onExpire,
  onAbandon,
}: WaitingPaymentOverlayProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useBeforeUnload(isOpen)

  const handleOpenChange = (open: boolean) => {
    if (open) {
      onOpenChange(true)
      return
    }
    setShowExitConfirm(true)
  }

  const handleLeave = async () => {
    setShowExitConfirm(false)
    await onAbandon?.()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        disablePointerDismissal
      >
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
              <p className="max-w-85 text-sm text-alternate/60">
                Keep this page open until your payment is complete. We&apos;ll
                redirect you automatically once payment succeeds.
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
                  if (!checkoutUrl) return
                  const win = window.open(
                    checkoutUrl,
                    "momiji_shopify_checkout",
                    "noopener=no,noreferrer=no"
                  )
                  if (!win) {
                    window.location.assign(checkoutUrl)
                  }
                }}
                className="h-13! w-full rounded-sm text-lg font-medium"
              >
                Take me to payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogPanel className="p-4!">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="text-xl text-alternate">
                Leave checkout?
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-alternate/70">
                Payment is in progress. Leaving or refreshing this page may
                prevent us from confirming your order automatically.
              </DialogDescription>
            </DialogHeader>
          </DialogPanel>

          <DialogFooter
            variant="bare"
            className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse sm:space-x-0"
          >
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full font-medium"
                  onClick={() => setShowExitConfirm(false)}
                />
              }
            >
              Stay on page
            </DialogClose>
            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="w-full font-medium"
              onClick={handleLeave}
            >
              Leave anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
