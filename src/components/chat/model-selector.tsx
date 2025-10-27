
"use client"

import { useState, useMemo } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const AVAILABLE_MODELS = [
  { id: "genesis", name: "Genesis", description: "Fastest" },
  { id: "explorer", name: "Explorer", description: "Balanced" },
  { id: "quantum", name: "Quantum", description: "Most Powerful" },
]

interface Agent {
  name: string
  description?: string
}

interface ModelSelectorProps {
  selectedModel?: string
  onModelChange?: (modelId: string) => void
  agents?: Agent[]
  isLoadingAgents?: boolean
}

export function ModelSelector({
  selectedModel = "genesis",
  onModelChange,
  agents = [],
  isLoadingAgents = false
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  
  // Convert agents to model format
  const models = useMemo(() => {
    if (agents.length > 0) {
      return agents.map((agent, idx) => ({
        id: typeof agent === 'string' ? agent : agent.name || `agent-${idx}`,
        name: typeof agent === 'string' ? agent : agent.name || `Agent ${idx}`,
        description: typeof agent === 'string' ? '' : agent.description || '',
      }))
    }
    return AVAILABLE_MODELS
  }, [agents])

  const selected = models.find((m) => m.id === selectedModel) || models[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button
          variant="outline"
          size="sm"
          className="w-40"
          disabled={isLoadingAgents}
        >
          <span className="truncate capitalize">{isLoadingAgents ? "Loading..." : selected?.name || "Select Model"}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Agents</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => {
              onModelChange?.(model.id)
              setOpen(false)
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-medium capitalize">{model.name}</p>
                {model.description && (
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                )}
              </div>
              {selectedModel === model.id && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
