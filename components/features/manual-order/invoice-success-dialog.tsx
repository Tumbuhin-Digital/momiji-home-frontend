"use client"

import { useState } from "react"

import { Check, Copy, ExternalLink } from "lucide-react"

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

interface InvoiceSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceUrl: string
  invoiceEmailSent: boolean
}

export function InvoiceSuccessDialog({
  open,
  onOpenChange,
  invoiceUrl,
  invoiceEmailSent,
}: InvoiceSuccessDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoiceUrl)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice created</DialogTitle>
          <DialogDescription className="text-pretty">
            {invoiceEmailSent
              ? "Shopify emailed the invoice to the customer. You can also copy or open the payment link below."
              : "The draft invoice was created, but Shopify could not send the email. Copy the link and share it with the customer."}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-3 pt-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Payment link
          </p>
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1 rounded-lg border border-black/10 bg-muted/50 px-3 py-2.5">
              <p className="break-all font-mono text-xs leading-relaxed text-alternate">
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
