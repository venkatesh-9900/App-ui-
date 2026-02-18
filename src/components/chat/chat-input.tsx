
"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUp, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FileDetails } from "@/types"
import { uploadFilesToServer, removeAttachedFile as removeAttachedFileAPI } from "@/hooks/upload-file"

interface ChatInputProps {
  onSend: (message: string, attachedFiles?: FileDetails[]) => void
  isLoading?: boolean
  initialValue?: string
  currentChatId?: string | null
}

export function ChatInput({ onSend, isLoading = false, initialValue = "", currentChatId = null }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<FileDetails[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue)
    }
  }, [initialValue])

  // Keep textarea focused - run on every render and on mount
  useEffect(() => {
    // Focus immediately on mount
    textareaRef.current?.focus()
  })

  const handleSend = () => {
    if (input.trim()) {
      onSend(input, attachedFiles)
      setInput("")
      setAttachedFiles([])
      // Restore focus after send with setTimeout to ensure it happens after state updates
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setIsUploading(true)
    try {
      // Convert FileList to array
      const filesArray = Array.from(files)
      
      // Upload all files at once
      const uploadedFiles = await uploadFilesToServer({
        files: filesArray,
        currentChatId: currentChatId || "new",
        fileFailureTask: (error: string) => {
          console.error(`File upload warning: ${error}`)
        },
        failureTask: () => {
          console.error("Failed to upload files")
        },
        errorTask: () => {
          console.error("Error uploading files")
        },
      })
      
      // Map the response to FileDetails format with constructed public links
      const formattedFiles: FileDetails[] = uploadedFiles.map((file: any) => ({
        file_id: file.file_id || file.uploadId,
        original_file_name: file.original_file_name || file.fileName,
        file_size: file.file_size,
        file_type: file.file_type,
        public_link: file.public_link || `/api/interaction/download-file?uploadId=${file.file_id || file.uploadId}`,
      }))
      
      setAttachedFiles([...attachedFiles, ...formattedFiles])
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Restore focus after upload
      textareaRef.current?.focus()
    }
  }

  const removeAttachedFile = async (fileId: string) => {
    try {
      await removeAttachedFileAPI({
        fileId,
        currentChatId: currentChatId || "new",
        successTask: () => {
          setAttachedFiles(attachedFiles.filter(f => f.file_id !== fileId))
        },
        failureTask: () => {
          console.error("Failed to remove file attachment")
        },
        errorTask: () => {
          console.error("Error removing file attachment")
        },
      })
    } catch (error) {
      console.error(`Failed to remove file with ID: ${fileId}`, error)
    }
  }

  return (
    <div className="sticky bottom-2 bg-background pb-3 shrink-0">
      {/* Attached Files Display */}
      {attachedFiles.length > 0 && (
        <div className="px-3 mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div
              key={file.file_id}
              className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md text-sm"
              data-testid="chat-input-attached-file"
            >
              <span className="truncate max-w-xs">{file.original_file_name}</span>
              <button
                onClick={() => removeAttachedFile(file.file_id)}
                disabled={isLoading}
                className="ml-1 hover:text-destructive disabled:opacity-50 cursor-pointer"
                data-testid={`chat-input-remove-file-button`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3 items-center px-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading || isUploading}
                className="flex-shrink-0 h-10 w-10 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                data-testid="chat-input-attach-file-button"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isUploading ? "Uploading..." : "Attach file"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Hidden file input */}
        <input
          data-testid="chat-input-file-input"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden cursor-pointer"
          disabled={isLoading || isUploading}
        />

        <Textarea
          data-testid="chat-input-textarea"
          ref={textareaRef}
          placeholder="Enter to send, Shift+Enter for new line..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isUploading}
          className="min-h-10 max-h-32 resize-none flex-1 py-2 px-3 !focus-visible:ring-0 !focus-visible:border-transparent"
        />

        <Button
          data-testid="chat-input-send-button"
          onClick={handleSend}
          disabled={isLoading || isUploading || !input.trim()}
          className="flex-shrink-0 h-10 w-10 px-0 cursor-pointer"
          size="icon"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
