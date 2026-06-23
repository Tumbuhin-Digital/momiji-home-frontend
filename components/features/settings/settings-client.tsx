"use client"

import { useEffect, useState } from "react"

import { Settings } from "lucide-react"
import { toastManager } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import { useSettings, useUpdateCheckoutNotes } from "@/hooks/use-settings"

export default function SettingsClient() {
  const { data, isLoading } = useSettings()
  const updateMutation = useUpdateCheckoutNotes()

  const [dueNowNote, setDueNowNote] = useState("")
  const [dueLaterNote, setDueLaterNote] = useState("")

  useEffect(() => {
    if (data) {
      setDueNowNote(data.dueNowNote)
      setDueLaterNote(data.dueLaterNote)
    }
  }, [data])

  const isPending = updateMutation.isPending

  const handleSave = async () => {
    if (!dueNowNote.trim() || !dueLaterNote.trim()) {
      toastManager.add({
        title: "Error",
        description: "Both checkout notes are required",
        type: "error",
      })
      return
    }

    try {
      await updateMutation.mutateAsync({
        dueNowNote: dueNowNote.trim(),
        dueLaterNote: dueLaterNote.trim(),
      })
    } catch {}
  }

  if (isLoading) {
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
            Manage checkout shipping descriptions shown to customers.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl rounded-xl border-neutral-200 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="due-now-note" className="text-sm font-medium">
              Due Now note
            </Label>
            <Textarea
              id="due-now-note"
              value={dueNowNote}
              onChange={(e) => setDueNowNote(e.target.value)}
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
              value={dueLaterNote}
              onChange={(e) => setDueLaterNote(e.target.value)}
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
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
