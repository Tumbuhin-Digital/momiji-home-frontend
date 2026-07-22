"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { toastManager } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import {
  useCancelBatch,
  useCloseBatch,
  useCreateBatch,
  useReorderBatch,
  useUpdateBatch,
  useVariantBatches,
} from "@/hooks"

import { BatchCard } from "./batch-card"
import { BatchQtyStepper } from "./batch-qty-stepper"

import type { Batch } from "@/types/batches"

interface ManageBatchModalProps {
  isOpen: boolean
  productName: string
  onClose: () => void
  variantId: string
}

function isOpenBatch(status: Batch["status"]) {
  return status === "active" || status === "queued"
}

function SortableBatchRow({
  batch,
  isPending,
  onCancel,
  onClose,
  onEdit,
}: {
  batch: Batch
  isPending: boolean
  onCancel: (batch: Batch) => void
  onClose: (batch: Batch) => void
  onEdit: (batch: Batch) => void
}) {
  const canDrag = isOpenBatch(batch.status)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: batch.id,
    disabled: !canDrag || isPending,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <BatchCard
        batch={batch}
        isDragging={isDragging}
        isPending={isPending}
        dragHandleProps={canDrag ? { ...attributes, ...listeners } : null}
        onClose={onClose}
        onCancel={onCancel}
        onEdit={onEdit}
      />
    </div>
  )
}

export function ManageBatchModal({
  isOpen,
  onClose,
  variantId,
  productName,
}: ManageBatchModalProps) {
  const { data, isLoading } = useVariantBatches(variantId, isOpen)
  const createBatchMutation = useCreateBatch()
  const updateBatchMutation = useUpdateBatch()
  const closeBatchMutation = useCloseBatch()
  const cancelBatchMutation = useCancelBatch()
  const reorderBatchMutation = useReorderBatch()

  const [isCreating, setIsCreating] = useState(false)
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [qtyAllocated, setQtyAllocated] = useState(1)
  const [wasOpen, setWasOpen] = useState(isOpen)

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setIsCreating(false)
      setEditingBatchId(null)
      setName("")
      setQtyAllocated(1)
    }
  }

  const isPending =
    createBatchMutation.isPending ||
    updateBatchMutation.isPending ||
    closeBatchMutation.isPending ||
    cancelBatchMutation.isPending ||
    reorderBatchMutation.isPending

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortedBatches = useMemo(
    () => [...(data?.batches || [])].sort((a, b) => a.sequence - b.sequence),
    [data?.batches]
  )

  const sortableIds = useMemo(
    () => sortedBatches.map((batch) => batch.id),
    [sortedBatches]
  )

  const startCreate = () => {
    setEditingBatchId(null)
    setName("")
    setQtyAllocated(1)
    setIsCreating(true)
  }

  const startEdit = (batch: Batch) => {
    setEditingBatchId(batch.id)
    setName(batch.name)
    setQtyAllocated(batch.qtyAllocated)
    setIsCreating(true)
  }

  const handleCancelForm = () => {
    setEditingBatchId(null)
    setName("")
    setQtyAllocated(1)
    setIsCreating(false)
  }

  const validate = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toastManager.add({
        title: "Error",
        description: "Batch name is required",
        type: "error",
      })
      return null
    }
    const duplicate = sortedBatches.some(
      (batch) =>
        batch.id !== editingBatchId &&
        batch.name.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      toastManager.add({
        title: "Error",
        description: "Batch name must be unique per variant",
        type: "error",
      })
      return null
    }
    return trimmed
  }

  const handleSave = async () => {
    const trimmed = validate()
    if (!trimmed) return

    try {
      if (editingBatchId) {
        await updateBatchMutation.mutateAsync({
          batchId: editingBatchId,
          input: { name: trimmed, qty_allocated: qtyAllocated },
          variantId,
        })
      } else {
        await createBatchMutation.mutateAsync({
          input: { name: trimmed, qty_allocated: qtyAllocated },
          variantId,
        })
      }
      handleCancelForm()
    } catch {}
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedBatches.findIndex((batch) => batch.id === active.id)
    const newIndex = sortedBatches.findIndex((batch) => batch.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const moving = sortedBatches[oldIndex]
    if (!isOpenBatch(moving.status)) return

    reorderBatchMutation.mutate({
      batchId: moving.id,
      input: { sequence: newIndex + 1 },
      variantId,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="pb-1 text-sm text-slate-400">Manage Batch</div>
          <DialogTitle className="text-[18px] text-slate-900 sm:text-[22px]">
            {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner />
            </div>
          ) : sortedBatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              There are no active batches for this product
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedBatches.map((batch) => (
                    <SortableBatchRow
                      key={batch.id}
                      batch={batch}
                      isPending={isPending}
                      onClose={(item) =>
                        closeBatchMutation.mutate({
                          batchId: item.id,
                          variantId,
                        })
                      }
                      onCancel={(item) =>
                        cancelBatchMutation.mutate({
                          batchId: item.id,
                          variantId,
                        })
                      }
                      onEdit={startEdit}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          {isCreating ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-name">Batch Name</Label>
                  <Input
                    id="batch-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g Batch - November"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch Qty</Label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <BatchQtyStepper
                      value={qtyAllocated}
                      onChange={setQtyAllocated}
                      disabled={isPending}
                    />
                    <div className="text-sm text-slate-500">
                      Qty Allocated: {qtyAllocated}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={isPending}
                    onClick={handleSave}
                  >
                    {isPending ? <Spinner className="mr-2" /> : null}
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isPending}
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              className="h-11 w-full"
              disabled={isLoading || isPending}
              onClick={startCreate}
            >
              Add New Batch
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
