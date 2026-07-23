"use client"

import { useRef, useState } from "react"

import {
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react"
import { toastManager } from "@/components/ui/toast"

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
import { Spinner } from "@/components/ui/spinner"

import {
  useDownloadDimensionsTemplate,
  useImportDimensions,
} from "@/hooks/use-products"

interface DimensionsCsvModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DimensionsCsvModal({
  isOpen,
  onClose,
}: DimensionsCsvModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadMutation = useDownloadDimensionsTemplate()
  const importMutation = useImportDimensions()

  const isPending = importMutation.isPending

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadMutation.mutateAsync()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "variant-packaging-template.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toastManager.add({
        title: "Error",
        description: "Failed to download packaging template",
        type: "error",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const name = file.name.toLowerCase()
      if (name.endsWith(".csv") || name.endsWith(".xlsx")) {
        setSelectedFile(file)
      } else {
        toastManager.add({
          title: "Error",
          description: "Please select a valid Excel (.xlsx) or CSV file",
          type: "error",
        })
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toastManager.add({
        title: "Error",
        description: "Please select a file to import",
        type: "error",
      })
      return
    }

    try {
      await importMutation.mutateAsync(selectedFile)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      onClose()
    } catch {}
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <FileSpreadsheet className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Variant Packaging
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Import weight in pounds (lb) and length, width, height in inches
                via Excel. Variants with missing weight (0 lb) are listed first in
                the template.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Step sections */}
        <div className="flex flex-col gap-4 px-6">
          {/* Step 1: Download Template */}
          <div className="rounded border border-primary/30 bg-primary/20 p-4">
            <div className="mb-3 flex items-center gap-2 font-medium text-slate-700">
              <Download className="size-4 text-primary" />
              1. Download Template
            </div>
            <p className="mb-4 text-xs text-slate-500">
              Get the latest Excel template to populate weight (lb) and
              dimensions (inches). Columns are sized to fit; zero-weight
              variants appear first.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white hover:bg-white sm:w-auto"
              onClick={handleDownloadTemplate}
              disabled={downloadMutation.isPending}
            >
              {downloadMutation.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <FileText className="mr-2 size-4" />
                  Download Template
                </>
              )}
            </Button>
          </div>

          {/* Step 2: Upload file */}
          <div className="rounded border border-primary/30 bg-primary/20 p-4">
            <div className="mb-3 flex items-center gap-2 font-medium text-slate-700">
              <Upload className="size-4 text-primary" />
              2. Upload Excel or CSV
            </div>
            <p className="mb-4 text-xs text-slate-500">
              Import the filled template (.xlsx or .csv). Max file size 5MB.
            </p>
            <input
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 bg-white hover:bg-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                Choose File
              </Button>
              {selectedFile ? (
                <span className="flex min-w-0 items-center text-xs font-medium text-slate-700">
                  <CheckCircle className="mr-1 size-3 shrink-0 text-green-500" />
                  <span className="truncate">{selectedFile.name}</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">No file chosen</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse sm:space-x-0 sm:px-6"
        >
          <DialogClose
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full font-medium text-slate-500"
                onClick={onClose}
                disabled={isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="w-full font-medium"
            onClick={handleImport}
            disabled={!selectedFile || isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Import File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
