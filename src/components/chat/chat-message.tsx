
"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
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
  isStreaming?: boolean  // True while message is being streamed
}

export function ChatMessage({ role, content, timestamp, attachments, sessionId, readOnly, isStreaming = false }: ChatMessageProps) {
  const { userInfo } = useAuth()
  const isUser = role === "user"
  const vizUrls = extractRenderVizUrls(content)
  const cleanContent = stripRenderVizUrls(content)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect if content is HTML
  const isHtmlContent = /<[^>]*>/.test(cleanContent)

  const [hasCopied, setHasCopied] = useState(false)

  // Get user initial from user info
  const getUserInitial = () => {
    if (!userInfo) return "U"
    const name = userInfo.name || userInfo.email || ""
    return name.charAt(0).toUpperCase()
  }

  // Message Copy Action
  // Handles async copy-to-clipboard with temporary toast feedback
  const handleCopy = async () => {
    if (hasCopied) return;
    try {
      await navigator.clipboard.writeText(cleanContent)
      setHasCopied(true)
      toast.success("Message copied to clipboard")
      setTimeout(() => setHasCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("Failed to copy message")
    }
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
      <div className="flex gap-1.5 mb-1 justify-end px-3 group">
        {/* Responsive Message Layout
            Constrains user bubble width and enforces text wrap to prevent overflow */}
        <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-3xl">
          <div className="flex items-end gap-2 max-w-full">
            <Card
              className="w-fit max-w-full px-3 py-2 bg-muted text-foreground rounded-2xl rounded-tr-sm shadow-sm"
            >
              <FileAttachments
                attachments={attachments}
                sessionId={sessionId}
                readOnly={readOnly}
              />
              <div 
                className="text-sm leading-6"
                style={{ 
                  overflowWrap: 'anywhere', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'pre-wrap' 
                }}
              >
                {cleanContent}
              </div>
            </Card>
            {/* Copy button - permanently visible on mobile/tablet, hover on desktop */}
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-6 w-6 md:h-7 md:w-7 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
              title="Copy message"
            >
              {hasCopied ? <Check className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />}
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
  // Only check for structured response when NOT streaming (to avoid parsing incomplete JSON)
  const isStructuredResponse = !isStreaming && mightBeAgentResponse(cleanContent)

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
    <div className="mb-4 py-4 group">
      <div className="flex gap-3 px-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/logo.png" alt="Argus" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-start gap-3 flex-1 min-w-0" ref={containerRef}>
          <div className="flex items-start gap-2 max-w-full w-full">
            <div className="flex-1 min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
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
            </div>
            {cleanContent && !isStructuredResponse && (
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-6 w-6 md:h-7 md:w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0"
                title="Copy message"
              >
                {hasCopied ? <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" /> : <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />}
              </Button>
            )}
          </div>
          
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
