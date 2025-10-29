"use client"

import { useState } from "react"
import { Download, Loader2, Eye } from "lucide-react"
import { FileDetails } from "@/types/files"
import { toast } from "sonner"
import { getPresignedURLForFileRead } from "@/hooks/upload-file"

interface FileAttachmentProps {
  file: FileDetails
  sessionId: string | null
  readOnly: boolean
}

export function FileAttachment({ file, sessionId, readOnly }: FileAttachmentProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️'
    } else if (fileType.startsWith('video/')) {
      return '🎥'
    } else if (fileType.startsWith('audio/')) {
      return '🎵'
    } else if (fileType.includes('pdf')) {
      return '📄'
    }
    return '📎'
  }

  const handleFileDownload = async () => {
    setIsDownloading(true)
    if (!sessionId) {
      toast.error("No session ID available")
      setIsDownloading(false)
      return
    }
    const {presigned_url: public_url, error: errorResponse} = await getPresignedURLForFileRead(file.file_id, sessionId)
    if (errorResponse || !public_url) {
      toast.error("Failed to download file")
      setIsDownloading(false)
      return
    }
    try {
      const response = await fetch(public_url)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.original_file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Downloading ${file.original_file_name}...`)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: open in new tab
      window.open(public_url, '_blank')
      toast.success(`Opening ${file.original_file_name}...`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePreview = async () => {
    if (!sessionId) {
      toast.error("No session ID available")
      setIsDownloading(false)
      return
    }
    const {presigned_url: public_url, error: errorResponse} = await getPresignedURLForFileRead(file.file_id, sessionId)
    if (errorResponse || !public_url) {
      toast.error("Failed to download file")
      return
    }
    window.open(public_url, '_blank')
    toast.success(`Opening ${file.original_file_name}...`)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors group cursor-pointer border border-secondary-foreground/10">
      <div className="flex items-center justify-center w-6 h-6 rounded bg-secondary-foreground/10 flex-shrink-0">
        <span className="text-sm font-semibold text-secondary-foreground/70">
          {getFileIcon(file.file_type)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-secondary-foreground truncate max-w-[120px]">
          {file.original_file_name}
        </p>
        <p className="text-xs text-secondary-foreground/60">
          {(file.file_size / 1024).toFixed(1)} KB
        </p>
      </div>
      {!readOnly && <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handlePreview}
          className="cursor-pointer p-1 rounded hover:bg-secondary-foreground/10 transition-colors"
          title="Preview"
          type="button"
        >
          <Eye className="h-3.5 w-3.5 text-secondary-foreground/40 hover:text-secondary-foreground/70 transition-colors" />
        </button>
        <button
          onClick={handleFileDownload}
          disabled={isDownloading}
          className="cursor-pointer p-1 rounded hover:bg-secondary-foreground/10 transition-colors disabled:opacity-50"
          title="Download"
          type="button"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 text-secondary-foreground/40 group-hover:text-secondary-foreground/70 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 text-secondary-foreground/40 hover:text-secondary-foreground/70 transition-colors" />
          )}
        </button>
      </div>}
    </div>
  )
}
