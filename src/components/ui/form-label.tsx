"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  tooltip?: string
}

export function FormLabel({
  children,
  tooltip,
  htmlFor,
  className,
  ...props
}: FormLabelProps) {
  if (!tooltip) {
    return (
      <Label htmlFor={htmlFor} className={className} {...props}>
        {children}
      </Label>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className={className} {...props}>
        {children}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-help flex items-center justify-center animate-none"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[280px] p-2 bg-popover text-popover-foreground border border-border shadow-md rounded-md text-xs font-normal normal-case">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
