"use client"

import { useRef, useState } from "react"

import { CheckCircle, Download, FileText, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"

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

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadMutation.mutateAsync()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "dimensions_template.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toast.error("Failed to download CSV template")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file)
      } else {
        toast.error("Please select a valid CSV file")
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import")
      return
    }

    try {
      await importMutation.mutateAsync(selectedFile)
      toast.success("Dimensions imported successfully")
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      onClose()
    } catch {
      toast.error("Failed to import dimensions")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogPanel className="flex flex-col gap-6 sm:py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">
              Variant Dimensions (CSV)
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Manage product dimensions in bulk using CSV format
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Download Template */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <div className="mb-3 flex items-center gap-2 font-medium text-slate-700">
                <Download className="size-4 text-slate-400" />
                1. Download Template
              </div>
              <p className="mb-4 text-xs text-slate-500">
                Get the latest template to populate your variant dimensions.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={downloadMutation.isPending}
                className="w-full bg-white sm:w-auto"
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 size-4" />
                )}
                Download Template
              </Button>
            </div>

            {/* Upload File */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <div className="mb-3 flex items-center gap-2 font-medium text-slate-700">
                <Upload className="size-4 text-slate-400" />
                2. Upload CSV File
              </div>
              <p className="mb-4 text-xs text-slate-500">
                Import the populated CSV file. Max file size 5MB.
              </p>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-slate-600"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importMutation.isPending}
                >
                  Choose File
                </Button>
                {selectedFile ? (
                  <span className="flex items-center text-xs font-medium text-slate-700">
                    <CheckCircle className="mr-1 size-3 text-green-500" />
                    {selectedFile.name}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">No file chosen</span>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleImport}
                  disabled={!selectedFile || importMutation.isPending}
                  className="ml-auto w-full sm:w-auto"
                >
                  {importMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Import
                </Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </DialogContent>
    </Dialog>
  )
}
