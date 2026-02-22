
"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUp, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FileDetails } from "@/types"
import { uploadFilesToServer, removeAttachedFile as removeAttachedFileAPI } from "@/hooks/upload-file"
import Image from "next/image"

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
      let tempFiles: FileDetails[] = filesArray.map((file) => ({
        file_id: "",
        original_file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        public_link: URL.createObjectURL(file),
      }))
      // Upload all files at once
      const uploadedFiles = await uploadFilesToServer({
        files: filesArray,
        currentChatId: currentChatId || "new",
        fileFailureTask: (error: string) => {
          toast.error(`File upload warning: ${error}`)
        },
        failureTask: () => {
          toast.error("Failed to upload files")
        },
        errorTask: () => {
          toast.error("Error uploading files")
        },
      })
      
      // Map the response to FileDetails format with constructed public links
      const formattedFiles: FileDetails[] = uploadedFiles.map((file: any, index: number) => ({
        file_id: file.file_id || file.uploadId,
        original_file_name: file.original_file_name || file.fileName,
        file_size: file.file_size,
        file_type: file.file_type,
        public_link: file.public_link || tempFiles[index].public_link,
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
      <div className="flex gap-4 flex-wrap mb-2 px-3 items-center">
        {attachedFiles.map((file) => (
          <div key={file.file_id} className="relative border rounded-lg overflow-visible max-w-xs h-auto" data-testid="chat-input-attached-file">
            <button
              onClick={() => removeAttachedFile(file.file_id)}
              disabled={isLoading}
              className="absolute -top-2 -right-2 z-10 bg-black text-white dark:bg-white dark:text-black rounded-full p-1 shadow-md hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
              aria-label="Remove image"
              data-testid={`chat-input-remove-file-button`}
            >
              <svg xmlns="http://www.w3.org" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {file.file_type.startsWith('image/') ? (
              <div className="relative rounded-lg overflow-hidden flex">
                <Image
                  src={file.public_link}
                  alt={file.original_file_name}
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="rounded-lg text-[10px] py-2 px-2 text-center truncate max-w-xs">
                {file.original_file_name}
              </div>
            )}
          </div>
        ))}
      </div>

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
