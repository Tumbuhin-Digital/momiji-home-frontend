"use client"

import { useState } from "react"

import { Settings } from "lucide-react"
import { toastManager } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { WarehouseCard } from "@/components/features/settings/warehouse-card"
import {
  useSettings,
  useUpdateCheckoutNotes,
  useWarehouses,
} from "@/hooks/use-settings"

export default function SettingsClient() {
  const defaultStoreClosedMessage =
    "Store is currently closed. Checkout is temporarily unavailable."
  const { data, isLoading } = useSettings()
  const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses()
  const updateMutation = useUpdateCheckoutNotes()

  const [draft, setDraft] = useState<{
    dueNowNote: string
    dueLaterNote: string
    storeClosed: boolean
    storeClosedMessage: string
  } | null>(null)

  const currentDueNowNote = draft?.dueNowNote ?? data?.dueNowNote ?? ""
  const currentDueLaterNote = draft?.dueLaterNote ?? data?.dueLaterNote ?? ""
  const currentStoreClosed = draft?.storeClosed ?? data?.storeClosed ?? false
  const currentStoreClosedMessage =
    draft?.storeClosedMessage ??
    data?.storeClosedMessage ??
    defaultStoreClosedMessage

  const isPending = updateMutation.isPending

  const handleSave = async () => {
    if (!currentDueNowNote.trim() || !currentDueLaterNote.trim()) {
      toastManager.add({
        title: "Error",
        description: "Both checkout notes are required",
        type: "error",
      })
      return
    }

    try {
      await updateMutation.mutateAsync({
        dueNowNote: currentDueNowNote.trim(),
        dueLaterNote: currentDueLaterNote.trim(),
        storeClosed: currentStoreClosed,
        storeClosedMessage: currentStoreClosedMessage.trim(),
      })
      toastManager.add({
        title: "Saved",
        description: "Checkout notes updated successfully",
        type: "success",
      })
    } catch {
      toastManager.add({
        title: "Error",
        description: "Failed to update checkout notes",
        type: "error",
      })
    }
  }

  const handleSaveStoreStatus = async () => {
    if (currentStoreClosed && !currentStoreClosedMessage.trim()) {
      toastManager.add({
        title: "Error",
        description: "Store closed message is required when store is closed",
        type: "error",
      })
      return
    }

    if (!currentDueNowNote.trim() || !currentDueLaterNote.trim()) {
      toastManager.add({
        title: "Error",
        description: "Both checkout notes are required",
        type: "error",
      })
      return
    }

    try {
      await updateMutation.mutateAsync({
        dueNowNote: currentDueNowNote.trim(),
        dueLaterNote: currentDueLaterNote.trim(),
        storeClosed: currentStoreClosed,
        storeClosedMessage: currentStoreClosedMessage.trim(),
      })
      toastManager.add({
        title: "Saved",
        description: "Store status updated successfully",
        type: "success",
      })
    } catch {
      toastManager.add({
        title: "Error",
        description: "Failed to update store status",
        type: "error",
      })
    }
  }

  if (isLoading || isWarehousesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Settings className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-medium text-alternate">Settings</h1>
          <p className="text-sm text-alternate/70">
            Manage checkout copy and warehouse ship-from addresses.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl rounded-xl border-neutral-200 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div>
            <h2 className="text-lg font-medium text-alternate">Store Status</h2>
            <p className="text-sm text-alternate/70">
              Disable checkout payment when the store is closed.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
            <div>
              <Label htmlFor="store-closed" className="text-sm font-medium">
                Store Closed
              </Label>
              <p className="text-xs text-alternate/60">
                When active, the checkout button will be disabled.
              </p>
            </div>
            <Switch
              id="store-closed"
              checked={currentStoreClosed}
              onCheckedChange={(value) =>
                setDraft({
                  dueNowNote: currentDueNowNote,
                  dueLaterNote: currentDueLaterNote,
                  storeClosed: value,
                  storeClosedMessage: currentStoreClosedMessage,
                })
              }
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="store-closed-message"
              className="text-sm font-medium"
            >
              Store closed message
            </Label>
            <Textarea
              id="store-closed-message"
              value={currentStoreClosedMessage}
              onChange={(e) =>
                setDraft({
                  dueNowNote: currentDueNowNote,
                  dueLaterNote: currentDueLaterNote,
                  storeClosed: currentStoreClosed,
                  storeClosedMessage: e.target.value,
                })
              }
              disabled={isPending}
              rows={3}
              placeholder={defaultStoreClosedMessage}
              className="resize-y text-sm"
            />
            <p className="text-xs text-alternate/60">
              Displayed on the checkout page when the store is closed.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleSaveStoreStatus}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Store Status"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-3xl rounded-xl border-neutral-200 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div>
            <h2 className="text-lg font-medium text-alternate">
              Checkout Notes
            </h2>
            <p className="text-sm text-alternate/70">
              Shipping descriptions shown to customers on checkout.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-now-note" className="text-sm font-medium">
              Due Now note
            </Label>
            <Textarea
              id="due-now-note"
              value={currentDueNowNote}
              onChange={(e) =>
                setDraft({
                  dueNowNote: e.target.value,
                  dueLaterNote: currentDueLaterNote,
                  storeClosed: currentStoreClosed,
                  storeClosedMessage: currentStoreClosedMessage,
                })
              }
              disabled={isPending}
              rows={3}
              placeholder="Shipping description for items due now"
              className="resize-y text-sm"
            />
            <p className="text-xs text-alternate/60">
              Shown below the Total Due Now amount on checkout.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-later-note" className="text-sm font-medium">
              Due Later note
            </Label>
            <Textarea
              id="due-later-note"
              value={currentDueLaterNote}
              onChange={(e) =>
                setDraft({
                  dueNowNote: currentDueNowNote,
                  dueLaterNote: e.target.value,
                  storeClosed: currentStoreClosed,
                  storeClosedMessage: currentStoreClosedMessage,
                })
              }
              disabled={isPending}
              rows={3}
              placeholder="Shipping description for pre-order items due later"
              className="resize-y text-sm"
            />
            <p className="text-xs text-alternate/60">
              Shown below the Due Later amount when pre-order items are in the
              cart.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Checkout Notes"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-alternate">Warehouses</h2>
          <p className="text-sm text-alternate/70">
            Ship-from addresses for rate calculation. Ship-ready orders always
            use East Coast.
          </p>
        </div>

        {warehouses?.map((warehouse) => (
          <WarehouseCard key={warehouse.code} warehouse={warehouse} />
        ))}
      </div>
    </div>
  )
}
