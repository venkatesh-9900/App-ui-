"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight,
  Fuel,
  Hash,
  FileCode,
  Coins
} from "lucide-react"
import { toast } from "sonner"
import { TransactionViewResponse } from "@/types/basic-agent-views"

interface TransactionDetailsViewProps {
  response: TransactionViewResponse
}

// Utility to truncate addresses/hashes
function truncateHash(hash: string, startChars = 8, endChars = 6): string {
  if (hash.length <= startChars + endChars) return hash
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}

// Copy to clipboard helper
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied!`)
}

// Status badge component
function StatusBadge({ status }: { status: "success" | "failed" | "pending" }) {
  const config = {
    success: { 
      icon: CheckCircle2, 
      label: "Success", 
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" 
    },
    failed: { 
      icon: XCircle, 
      label: "Failed", 
      className: "bg-red-500/15 text-red-600 border-red-500/30" 
    },
    pending: { 
      icon: Clock, 
      label: "Pending", 
      className: "bg-amber-500/15 text-amber-600 border-amber-500/30" 
    },
  }
  
  const { icon: Icon, label, className } = config[status]
  
  return (
    <Badge variant="outline" className={`${className} gap-1 px-2 py-0.5 text-xs`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

// Compact row component
function DetailRow({ 
  label, 
  value, 
  copyable = false, 
  mono = false,
  truncate = false,
  valueClassName
}: { 
  label: string
  value: string | number | React.ReactNode
  copyable?: boolean
  mono?: boolean
  truncate?: boolean
  valueClassName?: string
}) {
  const displayValue = typeof value === "string" && truncate ? truncateHash(value) : value
  
  return (
    <div className="flex items-center justify-between py-1.5 gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${mono ? "font-mono" : ""} ${valueClassName || ""}`}>
          {displayValue}
        </span>
        {copyable && typeof value === "string" && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => copyToClipboard(value, label)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Section header component
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType, title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/50">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <h3 className="text-xs font-semibold">{title}</h3>
    </div>
  )
}

export function TransactionDetailsView({ response }: TransactionDetailsViewProps) {
  const { chain, data } = response
  const { overview, details, token_transfers, nft_transfers } = data

  return (
    <div className="w-full max-w-4xl space-y-3">
      {/* Header Card - Transaction Hash & Status */}
      <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              <Hash className="h-3 w-3" />
              Transaction Hash
            </div>
            <div className="flex items-center gap-1.5">
              <code className="text-xs font-mono break-all">{overview.transaction_hash}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 flex-shrink-0 cursor-pointer"
                onClick={() => copyToClipboard(overview.transaction_hash, "Transaction hash")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <StatusBadge status={overview.status} />
        </div>
        
        {/* Quick Info Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-primary/10 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Block:</span>
            <span className="font-mono font-medium">{overview.block_number.toLocaleString()}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {overview.confirmations.toLocaleString()} conf
            </Badge>
          </div>
          {chain && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Chain:</span>
              <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0">{chain}</Badge>
            </div>
          )}
          <div className="flex items-center gap-1.5" title={overview.timestamp.iso}>
            <span className="text-muted-foreground">Time:</span>
            <span>{overview.timestamp.relative}</span>
            <span className="text-muted-foreground/60">({overview.timestamp.iso})</span>
          </div>
        </div>
      </Card>

      {/* Two Column Grid for Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Transaction Details Card */}
        <Card className="p-3">
          <SectionHeader icon={ArrowRight} title="Transaction Details" />
          <div className="space-y-0">
            <DetailRow label="From" value={details.from_address} copyable mono truncate />
            <DetailRow 
              label="To" 
              value={details.contract_creation ? "Contract Creation" : (details.to_address || "—")} 
              copyable={!!details.to_address && !details.contract_creation}
              mono={!details.contract_creation}
              truncate={!details.contract_creation}
              valueClassName={details.contract_creation ? "text-amber-600" : ""}
            />
            <DetailRow label="Value" value={details.value_native} mono />
            <DetailRow label="Fee" value={details.transaction_fee} mono />
          </div>
        </Card>

        {/* Gas Details Card */}
        <Card className="p-3">
          <SectionHeader icon={Fuel} title="Gas Details" />
          <div className="space-y-0">
            <DetailRow label="Gas Price" value={details.gas_price} mono />
            <DetailRow label="Gas Limit" value={details.gas_limit.toLocaleString()} mono />
            <DetailRow 
              label="Gas Used" 
              value={
                <span className="flex items-center gap-1.5">
                  <span className="font-mono">{details.gas_used.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {((details.gas_used / details.gas_limit) * 100).toFixed(1)}%
                  </Badge>
                </span>
              }
            />
            <div className="flex items-center gap-2 pt-1.5 mt-1.5 border-t border-border/50">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Nonce: <span className="font-mono ml-0.5">{details.nonce.toLocaleString()}</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Position in block: <span className="font-mono ml-0.5">{details.transaction_index}</span>
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Input Data - Full Width if present */}
      {details.input_data?.hex && details.input_data.hex !== "0x" && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">Input Data</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 text-[10px] px-2 cursor-pointer"
              onClick={() => copyToClipboard(details.input_data.hex!, "Input data")}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
          <div className="bg-muted/50 rounded p-2 overflow-x-auto">
            <code className="text-[10px] font-mono text-muted-foreground break-all">
              {details.input_data.hex.length > 200 
                ? `${details.input_data.hex.slice(0, 200)}...` 
                : details.input_data.hex}
            </code>
          </div>
        </Card>
      )}

      {/* Token & NFT Transfers - Two Column Grid */}
      {((token_transfers && token_transfers.length > 0) || (nft_transfers && nft_transfers.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Token Transfers */}
          {token_transfers && token_transfers.length > 0 && (
            <Card className="p-3">
              <SectionHeader icon={Coins} title={`Token Transfers (${token_transfers.length})`} />
              <div className="space-y-2">
                {token_transfers.slice(0, 5).map((transfer, idx) => (
                  <div key={idx} className="bg-muted/30 rounded p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{transfer.token_name}</Badge>
                      <span className="text-xs font-mono">{transfer.amount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-mono">{truncateHash(transfer.from_address, 6, 4)}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span className="font-mono">{truncateHash(transfer.to_address, 6, 4)}</span>
                    </div>
                  </div>
                ))}
                {token_transfers.length > 5 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    +{token_transfers.length - 5} more transfers
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* NFT Transfers */}
          {nft_transfers && nft_transfers.length > 0 && (
            <Card className="p-3">
              <SectionHeader icon={FileCode} title={`NFT Transfers (${nft_transfers.length})`} />
              <div className="space-y-2">
                {nft_transfers.slice(0, 5).map((transfer, idx) => (
                  <div key={idx} className="bg-muted/30 rounded p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{transfer.collection_name}</Badge>
                      <span className="text-xs font-mono">#{transfer.token_id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-mono">{truncateHash(transfer.from_address, 6, 4)}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span className="font-mono">{truncateHash(transfer.to_address, 6, 4)}</span>
                    </div>
                  </div>
                ))}
                {nft_transfers.length > 5 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    +{nft_transfers.length - 5} more transfers
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
