import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Safely renders Markdown that contains HTML + D3.js scripts
 * by executing them inside sandboxed iframes.
 */
export default function MarkdownWithD3IframeRenderer({ content }: { content: string }) {
  const isMobile = useIsMobile()

  const components: Components = {
    code({ inline, className, children, ...props }: any) {
      const txt = String(children);
      const lang = className?.replace("language-", "");

      // Render normal inline code
      if (inline) return <code className={className}>{children}</code>;

      // If HTML block: render it in a sandboxed iframe (executes D3 safely)
      if (lang === "html") {
        const iframeSrcDoc = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>D3 Visualization</title>
            <script src="https://d3js.org/d3.v7.min.js"></script>
          </head>
          <body>${txt}</body>
          </html>
        `;

        return (
          <iframe
            srcDoc={iframeSrcDoc}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: isMobile ? "100%" : "98%",
              height: isMobile ? "450px" : "600px",
              border: isMobile ? "none" : "1px solid #e0e0e0",
              borderRadius: "6px",
              margin: isMobile ? "12px 0" : "20px 0",
              padding: isMobile ? "8px" : "0",
            }}
            {...props}
          />
        );
      }

      // Default: render as code block
       return (
        <code className={`${className} bg-muted px-2 py-1 rounded text-sm inline-block`} {...props}>
          {children}
        </code>
       );
    },
  };

  return (
    <div className="text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none prose-p:m-0 prose-headings:my-1">
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
