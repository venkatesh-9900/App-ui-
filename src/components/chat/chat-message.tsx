
"use client"

import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { extractRenderVizUrls, stripRenderVizUrls } from "@/utils/utils"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { FileDetails } from "@/types/files"
import { FileAttachments } from "./file-attachments"
import MarkdownHTMLRenderer from "./html-markdown-renderer"
import { ViewRenderer, mightBeAgentResponse } from "./views"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  attachments?: FileDetails[]
  sessionId: string | null
  readOnly: boolean
}

export function ChatMessage({ role, content, timestamp, attachments, sessionId, readOnly }: ChatMessageProps) {
  const { userInfo } = useAuth()
  const isUser = role === "user"
  const vizUrls = extractRenderVizUrls(content)
  const cleanContent = stripRenderVizUrls(content)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect if content is HTML
  const isHtmlContent = /<[^>]*>/.test(cleanContent)

  // Get user initial from user info
  const getUserInitial = () => {
    if (!userInfo) return "U"
    const name = userInfo.name || userInfo.email || ""
    return name.charAt(0).toUpperCase()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent)
    toast.success("Message copied!")
  }

  // Post-render fix for lingering **bold** text
  useEffect(() => {
    if (containerRef.current && !isUser && !isHtmlContent) {
      const el = containerRef.current
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      let node: Text | null

      while ((node = walker.nextNode() as Text | null)) {
        const match = node.nodeValue?.match(/\*\*(.+?)\*\*/)
        if (match) {
          const strong = document.createElement("strong")
          strong.textContent = match[1]

          const parts = node.nodeValue!.split(match[0])
          const after = node.splitText(parts[0].length)
          node.nodeValue = parts[0]

          after.nodeValue = after.nodeValue?.substring(match[0].length) || ""
          node.parentNode?.insertBefore(strong, after)
        }
      }
    }
  }, [cleanContent, isUser, isHtmlContent])

  if (isUser) {
    return (
      <div className="flex gap-3 mb-3 justify-end px-3 group">
        <div className="flex flex-col items-end gap-1 max-w-3xl">
          <div className="flex items-end gap-2">
            <Card
              className="w-fit px-4 py-3 bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-md"
            >
              <FileAttachments
                attachments={attachments}
                sessionId={sessionId}
                readOnly={readOnly}
              />
              <p className="text-sm leading-7 break-words whitespace-pre-wrap">{cleanContent}</p>
            </Card>
            {/* Copy button - visible on hover only for user messages */}
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Copy message"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {/* {timestamp && (
            <p className="text-xs px-2 font-medium text-primary/70">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )} */}
        </div>

        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/avatars/default.jpg" alt="User" />
          <AvatarFallback>{getUserInitial()}</AvatarFallback>
        </Avatar>
      </div>
    )
  }

  // Check if content is a structured agent response
  const isStructuredResponse = mightBeAgentResponse(cleanContent)

  // Default content renderer (markdown/HTML)
  const renderDefaultContent = (contentToRender: string) => {
    const isHtml = /<[^>]*>/.test(contentToRender)
    
    if (isHtml) {
      return <MarkdownHTMLRenderer content={contentToRender} />
    }
    
    return (
      <div className="text-sm leading-7 break-words prose prose-sm dark:prose-invert max-w-none prose-p:m-0 prose-headings:my-1">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {contentToRender.replace(/\\n/g, "\n")}
        </ReactMarkdown>
      </div>
    )
  }

  // Assistant message - full width with view-based or markdown/HTML rendering
  return (
    <div className="mb-4 py-4">
      <div className="flex gap-3 px-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/logo.png" alt="Argus" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-start gap-3 flex-1 w-full" ref={containerRef}>
          {cleanContent && (
            <>
              {isStructuredResponse ? (
                // Use ViewRenderer for structured agent responses
                <ViewRenderer 
                  content={cleanContent} 
                  fallbackRenderer={renderDefaultContent}
                />
              ) : (
                // Use default rendering for non-structured content
                renderDefaultContent(cleanContent)
              )}
            </>
          )}
          
          {vizUrls.length > 0 && (
            <div className="w-full space-y-2">
              {vizUrls.map((url, idx) => (
                <div key={idx} className="w-full border rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={url}
                    className="w-full h-96 border-0"
                    title={`Visualization ${idx + 1}`}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-modals"
                  />
                </div>
              ))}
            </div>
          )}

          {cleanContent && !isStructuredResponse && (
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Copy message"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
            </Button>
          )}
          
          {/* {timestamp && (
            <p className="text-xs font-medium text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )} */}
        </div>
      </div>
    </div>
  )
}
