"use client"

import { FileDetails } from "@/types/files"
import { FileAttachment } from "./file-attachment"

interface FileAttachmentsProps {
  attachments?: FileDetails[]
}

export function FileAttachments({ attachments }: FileAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((file) => (
        <FileAttachment key={file.file_id} file={file} />
      ))}
    </div>
  )
}
