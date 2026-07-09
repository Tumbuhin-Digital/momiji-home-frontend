"use client"

import { useMemo, useState } from "react"

import { ChevronDown, Trash2 } from "lucide-react"

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
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover"
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
        title: "Could not save custom text",
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
        title: "Could not assign custom text",
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

  const confirmDelete = async () => {
    if (!pendingDelete) return

    try {
      await deleteMutation.mutateAsync(pendingDelete.id)
      setPendingDelete(null)
    } catch {
      toastManager.add({
        title: "Could not delete custom text",
        description: "Please try again in a moment.",
        type: "error",
      })
    }
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setSearch("")
        }}
      >
        <PopoverTrigger
          disabled={disabled || isBusy}
          className="flex h-10 w-52 items-center justify-between rounded border border-black/20 bg-white px-3 text-left text-sm text-slate-700 hover:bg-white disabled:opacity-50"
        >
          <span className="truncate">
            {value || "Custom text for pre-order"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-slate-400" />
        </PopoverTrigger>
        <PopoverPopup className="w-72 p-2" align="start">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void handleCreateFromSearch()
              }
            }}
            placeholder="Search or add new category"
            className="mb-2 h-10"
            disabled={isBusy}
          />
          <div className="max-h-48 overflow-y-auto">
            {isLoading || isSearchPending ? (
              <div className="flex items-center justify-center py-6">
                <Spinner />
              </div>
            ) : isError ? (
              <p className="px-2 py-3 text-center text-sm text-destructive">
                Could not load custom text options. Please try again later.
              </p>
            ) : filteredOptions.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                {search.trim()
                  ? `Press Enter to add "${search.trim()}"`
                  : "No custom text yet"}
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
                    aria-label={`Delete ${item.label}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </PopoverPopup>
      </Popover>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(nextOpen) => !nextOpen && setPendingDelete(null)}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom text?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && pendingDelete.usage_count > 0
                ? `Custom text "${pendingDelete.label}" is still used by ${pendingDelete.usage_count} variant(s). It will be removed from the list, but existing products will keep showing "${pendingDelete.label}" until updated manually.`
                : `Delete "${pendingDelete?.label}" from the custom text list?`}
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
