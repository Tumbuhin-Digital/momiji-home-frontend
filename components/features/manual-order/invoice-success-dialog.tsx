"use client"

import { useState } from "react"

import { Check, Copy, ExternalLink, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"
import { toastManager } from "@/components/ui/toast"
import { useSendManualOrderInvoice } from "@/hooks/use-manual-order"
import { copyText } from "@/lib/copy-text"

interface InvoiceSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceUrl: string
  draftOrderId: string
  email: string
}

export function InvoiceSuccessDialog({
  open,
  onOpenChange,
  invoiceUrl,
  draftOrderId,
  email,
}: InvoiceSuccessDialogProps) {
  const [copied, setCopied] = useState(false)
  const sendInvoice = useSendManualOrderInvoice()

  const handleCopy = async () => {
    try {
      await copyText(invoiceUrl)
      setCopied(true)
      toastManager.add({
        title: "Copied",
        description: "Invoice link copied to clipboard",
        type: "success",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toastManager.add({
        title: "Copy failed",
        description: "Could not copy the link",
        type: "error",
      })
    }
  }

  const handleSendInvoice = async () => {
    try {
      await sendInvoice.mutateAsync({ draftOrderId, email })
      toastManager.add({
        title: "Invoice sent",
        description: `Shopify emailed the invoice to ${email}.`,
        type: "success",
      })
    } catch (err: any) {
      toastManager.add({
        title: "Failed to send invoice",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Shopify could not send the email. You can still copy the payment link.",
        type: "error",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice created</DialogTitle>
          <DialogDescription className="text-pretty">
            Copy the payment link below for payment or send the invoice if
            needed.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-3 pt-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Payment link
          </p>
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1 rounded-lg border border-black/10 bg-muted/50 px-3 py-2.5">
              <p className="font-mono text-xs leading-relaxed break-all text-alternate">
                {invoiceUrl}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-auto shrink-0 px-3"
              onClick={handleCopy}
              aria-label="Copy invoice link"
            >
              {copied ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            loading={sendInvoice.isPending}
            disabled={!draftOrderId || !email}
            onClick={handleSendInvoice}
          >
            <Mail className="mr-2 size-4" />
            Send invoice
          </Button>
        </DialogPanel>

        <DialogFooter variant="bare" className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full sm:flex-1"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
          <Button
            type="button"
            className="h-11 w-full bg-[#5B7C8A] text-white hover:bg-[#4d6a76] sm:flex-1"
            onClick={() =>
              window.open(invoiceUrl, "_blank", "noopener,noreferrer")
            }
          >
            <ExternalLink className="mr-2 size-4" />
            Open link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
