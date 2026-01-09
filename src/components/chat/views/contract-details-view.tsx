"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Copy, 
  FileCode,
  Code2,
  Settings,
  BookOpen,
  Cpu,
  FileText,
  Zap,
  Shield
} from "lucide-react"
import { toast } from "sonner"
import { ContractViewResponse, ReadFunction } from "@/types/basic-agent-views/contract-details"

interface ContractDetailsViewProps {
  response: ContractViewResponse
}

// Utility to truncate addresses/hashes
function truncateHash(hash: string, startChars = 10, endChars = 8): string {
  if (hash.length <= startChars + endChars) return hash
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}

// Copy to clipboard helper
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied!`)
}

// Format large numbers
function formatValue(value: string | number | boolean): string {
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "number") return value.toLocaleString()
  
  // Check if it's a large number string
  if (/^\d+$/.test(value) && value.length > 10) {
    try {
      const num = BigInt(value)
      // Format with decimals if it looks like a token amount (18 decimals)
      if (value.length > 18) {
        const divisor = BigInt(10 ** 18)
        const whole = num / divisor
        const remainder = num % divisor
        const decimal = remainder.toString().padStart(18, '0').slice(0, 4)
        return `${whole.toLocaleString()}.${decimal}`
      }
      return num.toLocaleString()
    } catch {
      return value
    }
  }
  
  // Check if it's a timestamp
  if (/^\d{10}$/.test(value)) {
    const date = new Date(parseInt(value) * 1000)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return value
}

// Check if value is an address
function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

// Read function card component
function ReadFunctionCard({ func }: { func: ReadFunction }) {
  const outputValue = func.output_values?.[0]
  const formattedOutput = outputValue !== undefined ? formatValue(outputValue) : "—"
  const isAddressOutput = typeof outputValue === "string" && isAddress(outputValue)
  const rawOutputString = outputValue !== undefined ? String(outputValue) : "—"
  
  return (
    <div className="bg-muted/30 rounded-lg p-2.5 hover:bg-muted/50 transition-colors group">
      <div className="flex items-center justify-between gap-2">
        <code 
          className="text-[11px] font-mono text-primary font-medium truncate cursor-default"
          title={func.function_name}
        >
          {func.function_name}
        </code>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        {isAddressOutput ? (
          <>
            <code 
              className="text-xs font-mono text-foreground cursor-default"
              title={outputValue as string}
            >
              {truncateHash(outputValue as string, 6, 4)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 cursor-pointer"
              onClick={() => copyToClipboard(outputValue as string, "Address")}
            >
              <Copy className="h-2.5 w-2.5" />
            </Button>
          </>
        ) : (
          <span 
            className="text-xs font-mono text-foreground truncate cursor-default" 
            title={rawOutputString}
          >
            {formattedOutput}
          </span>
        )}
      </div>
    </div>
  )
}

export function ContractDetailsView({ response }: ContractDetailsViewProps) {
  const { chain, data } = response
  const { overview, source_information, read_functions } = data
  
  const MAX_DISPLAY_FUNCTIONS = 10
  const displayedFunctions = read_functions?.slice(0, MAX_DISPLAY_FUNCTIONS) || []
  const remainingCount = (read_functions?.length || 0) - MAX_DISPLAY_FUNCTIONS

  return (
    <div className="w-full max-w-4xl space-y-3">
      {/* Header Card - Contract Overview */}
      <Card className="p-3 bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              <FileCode className="h-3 w-3" />
              Smart Contract
            </div>
            <div className="flex items-center gap-1.5">
              <code className="text-xs font-mono break-all">{overview.contract_address}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 flex-shrink-0 cursor-pointer"
                onClick={() => copyToClipboard(overview.contract_address, "Contract address")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-violet-500/15 text-violet-600 border-violet-500/30 text-[10px]">
                {overview.contract_type}
              </Badge>
              {chain && (
                <Badge variant="outline" className="text-[10px] capitalize">{chain}</Badge>
              )}
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] px-2 py-0.5">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>
      </Card>

      {/* Source Information & Compiler Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Source Files */}
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Source Files
          </div>
          <div className="space-y-1.5">
            {source_information.source_files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded px-2 py-1.5">
                <Code2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-mono">{file}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Compiler Settings */}
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold">
            <Settings className="h-3.5 w-3.5 text-primary" />
            Compiler Settings
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Language</div>
              <div className="font-mono">{source_information.metadata.language}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Version</div>
              <div className="font-mono text-[11px]">{source_information.metadata.compiler_version}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Optimization</div>
              <div className="flex items-center gap-1">
                {source_information.metadata.optimization_enabled ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] px-1">
                    <Zap className="h-2.5 w-2.5 mr-0.5" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] px-1">Disabled</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Runs</div>
              <div className="font-mono">{source_information.metadata.optimization_runs}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">EVM Version</div>
              <div className="font-mono">{source_information.metadata.evm_version || "Default"}</div>
            </div>
            {source_information.metadata.license_type && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">License</div>
                <div className="font-mono">{source_information.metadata.license_type}</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Read Functions */}
      {read_functions && read_functions.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Read Functions
            </div>
            <Badge variant="outline" className="text-[10px]">
              {read_functions.length} functions
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {displayedFunctions.map((func, idx) => (
              <ReadFunctionCard key={idx} func={func} />
            ))}
          </div>
          {remainingCount > 0 && (
            <div className="text-[10px] text-muted-foreground text-center mt-3">
              +{remainingCount} more function{remainingCount > 1 ? 's' : ''}
            </div>
          )}
        </Card>
      )}

      {/* Contract Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Cpu className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-bold">{source_information.source_files.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Source Files</div>
        </Card>
        <Card className="p-3 text-center">
          <BookOpen className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-bold">{read_functions?.length || 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Read Functions</div>
        </Card>
        <Card className="p-3 text-center">
          <Code2 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-bold">{data.write_functions?.length || 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Write Functions</div>
        </Card>
      </div>
    </div>
  )
}

