"use client"

import { useMemo, useState } from "react"

import { ChevronDown, Trash2, X } from "lucide-react"

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { toastManager } from "@/components/ui/toast"

import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useDeletePreorderCustomText,
  usePreorderCustomTexts,
} from "@/hooks/use-preorder-custom-texts"
import { useUpdateVariantCustomText } from "@/hooks/use-products"

import type { PreorderCustomTextDto } from "@/lib/services/preorder-custom-text.service"

const SEARCH_DEBOUNCE_MS = 350

export interface PreorderCustomTextComboboxProps {
  disabled?: boolean
  value?: string
  variantId: string
}

export function PreorderCustomTextCombobox({
  disabled = false,
  value = "",
  variantId,
}: PreorderCustomTextComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] =
    useState<PreorderCustomTextDto | null>(null)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const isSearchPending = open && search !== debouncedSearch

  const {
    data: options = [],
    isLoading,
    isError,
  } = usePreorderCustomTexts(open ? debouncedSearch : undefined, open)
  const deleteMutation = useDeletePreorderCustomText()
  const assignMutation = useUpdateVariantCustomText()

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter((item) => item.label.toLowerCase().includes(query))
  }, [options, search])

  const isBusy = deleteMutation.isPending || assignMutation.isPending
  const hasValue = Boolean(value.trim())

  const assignLabel = async (label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return

    try {
      await assignMutation.mutateAsync({
        variant_id: variantId,
        preorder_batch_label: trimmed,
      })
      setOpen(false)
      setSearch("")
    } catch {
      toastManager.add({
        title: "Could not save catalog text",
        description: "Please try again in a moment.",
        type: "error",
      })
    }
  }

  const handleSelect = async (item: PreorderCustomTextDto) => {
    try {
      await assignMutation.mutateAsync({
        variant_id: variantId,
        preorder_batch_label: item.label,
      })
      setOpen(false)
      setSearch("")
    } catch {
      toastManager.add({
        title: "Could not assign catalog text",
        description: "Please try again in a moment.",
        type: "error",
      })
    }
  }

  const handleCreateFromSearch = async () => {
    const trimmed = search.trim()
    if (!trimmed) return

    const existing = options.find(
      (item) => item.label.toLowerCase() === trimmed.toLowerCase()
    )
    if (existing) {
      await handleSelect(existing)
      return
    }

    await assignLabel(trimmed)
  }

  const handleClear = async () => {
    try {
      await assignMutation.mutateAsync({
        variant_id: variantId,
        preorder_batch_label: "",
      })
      setOpen(false)
      setSearch("")
      toastManager.add({
        title: "Catalog text removed",
        type: "success",
      })
    } catch {
      toastManager.add({
        title: "Could not clear catalog text",
        description: "Please try again in a moment.",
        type: "error",
      })
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return

    try {
      await deleteMutation.mutateAsync(pendingDelete.id)
      setPendingDelete(null)
    } catch {
      toastManager.add({
        title: "Could not delete catalog text",
        description: "Please try again in a moment.",
        type: "error",
      })
    }
  }

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen)
            if (!nextOpen) setSearch("")
          }}
        >
          <PopoverTrigger
            disabled={disabled || isBusy}
            className="flex h-10 min-w-0 flex-1 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <span
              className={
                hasValue
                  ? "truncate font-medium text-slate-800"
                  : "truncate text-slate-400"
              }
            >
              {hasValue ? value : "None — show PRE-ORDER only"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          </PopoverTrigger>
          <PopoverPopup className="w-80 p-2" align="start">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleCreateFromSearch()
                }
              }}
              placeholder="Search or type e.g. SEPTEMBER"
              className="mb-2 h-10"
              disabled={isBusy}
            />
            {hasValue ? (
              <button
                type="button"
                className="mb-1 flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-slate-600 hover:bg-accent"
                disabled={isBusy}
                onClick={() => void handleClear()}
              >
                <X className="size-3.5 shrink-0" />
                None — show PRE-ORDER only
              </button>
            ) : null}
            <div className="max-h-48 overflow-y-auto">
              {isLoading || isSearchPending ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner />
                </div>
              ) : isError ? (
                <p className="px-2 py-3 text-center text-sm text-destructive">
                  Could not load options. Please try again later.
                </p>
              ) : filteredOptions.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  {search.trim()
                    ? `Press Enter to add "${search.trim()}"`
                    : "No saved texts yet"}
                </p>
              ) : (
                filteredOptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-sm px-2 py-2 hover:bg-accent"
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-sm"
                      onClick={() => void handleSelect(item)}
                    >
                      {item.label}
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-destructive"
                      onClick={() => setPendingDelete(item)}
                      aria-label={`Delete ${item.label} from saved list`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </PopoverPopup>
        </Popover>
        {hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-slate-400 hover:text-slate-700"
            disabled={disabled || isBusy}
            onClick={() => void handleClear()}
            aria-label="Clear catalog text"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(nextOpen) => !nextOpen && setPendingDelete(null)}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved text?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && pendingDelete.usage_count > 0
                ? `"${pendingDelete.label}" is still used by ${pendingDelete.usage_count} variant(s). It will leave the saved list, but products keep showing it until you clear them.`
                : `Remove "${pendingDelete?.label}" from the saved list?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              Cancel
            </AlertDialogClose>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
