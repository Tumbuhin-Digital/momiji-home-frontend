"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Download, Upload, Loader2, FileText, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  useDownloadDimensionsTemplate,
  useImportDimensions,
} from "@/hooks/use-products"

export function DimensionsCsvSection() {
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
    } catch {
      toast.error("Failed to import dimensions")
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-slate-800">
          Variant Dimensions (CSV)
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Manage product dimensions in bulk using CSV format
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Download Template */}
        <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
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
        <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
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
    </div>
  )
}
