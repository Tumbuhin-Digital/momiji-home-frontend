"use client"

import type { HTMLAttributes } from "react"
import { GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { Batch } from "@/types/batches"

interface BatchCardProps {
  batch: Batch
  dragHandleProps?: HTMLAttributes<HTMLButtonElement> | null
  isDragging?: boolean
  isPending?: boolean
  onCancel?: (batch: Batch) => void
  onClose?: (batch: Batch) => void
  onEdit?: (batch: Batch) => void
}

function statusStyles(status: Batch["status"]) {
  switch (status) {
    case "active":
      return {
        card: "border-[#A9C8D6] bg-[#F3FAFD]",
        dot: "bg-[#29CE2D]",
        label: "Batch Active",
        remaining: "text-[#29CE2D]",
      }
    case "queued":
      return {
        card: "border-slate-300 bg-white",
        dot: "bg-slate-500",
        label: "Batch Queued",
        remaining: "text-slate-500",
      }
    case "closed":
      return {
        card: "border-slate-200 bg-slate-50",
        dot: "bg-[#FF8A8A]",
        label: "Batch Close",
        remaining: "text-[#FF8A8A]",
      }
    default:
      return {
        card: "border-slate-200 bg-slate-50",
        dot: "bg-slate-400",
        label: "Batch Cancelled",
        remaining: "text-slate-400",
      }
  }
}

export function BatchCard({
  batch,
  dragHandleProps,
  isDragging,
  onClose,
  onCancel,
  onEdit,
  isPending,
}: BatchCardProps) {
  const styles = statusStyles(batch.status)
  const actionLabel =
    batch.status === "active"
      ? "Close Batch"
      : batch.status === "queued"
        ? "Cancel Batch"
        : null
  const canDrag = Boolean(dragHandleProps)
  const canEdit = batch.status === "active" || batch.status === "queued"

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        styles.card,
        isDragging && "opacity-80 shadow-md ring-1 ring-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {canDrag ? (
            <button
              type="button"
              className="mt-0.5 shrink-0 cursor-grab touch-none rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Reorder ${batch.name}`}
              disabled={isPending}
              {...dragHandleProps}
            >
              <GripVertical className="size-4" />
            </button>
          ) : (
            <div className="mt-0.5 size-6 shrink-0" aria-hidden />
          )}
          <div className="min-w-0 space-y-3">
            <div className="text-[15px] font-semibold text-slate-800">
              {batch.name}
            </div>
            <div className="space-y-1 text-sm text-slate-500">
              <div>Qty Allocated: {batch.qtyAllocated}</div>
              <div>
                Sold: {batch.qtySold}{" "}
                <span className="mx-1 text-slate-300">|</span>
                <span className={styles.remaining}>
                  Remaining: {batch.qtyRemaining}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <div className={`size-3 rounded-full ${styles.dot}`} />
            {styles.label}
          </div>
          {actionLabel ? (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm text-slate-600"
              disabled={isPending}
              onClick={() =>
                batch.status === "active" ? onClose?.(batch) : onCancel?.(batch)
              }
            >
              {actionLabel}
            </Button>
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-slate-500"
              disabled={isPending}
              onClick={() => onEdit?.(batch)}
            >
              Edit batch
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
