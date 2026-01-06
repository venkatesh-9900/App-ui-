"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Copy, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Fuel,
  Hash,
  Box,
  Flame,
  HardDrive,
  Layers,
  Coins,
  Award
} from "lucide-react"
import { toast } from "sonner"
import { BlockViewResponse } from "@/types/basic-agent-views"

interface BlockDetailsViewProps {
  response: BlockViewResponse
}

// Utility to truncate hashes
function truncateHash(hash: string, startChars = 10, endChars = 8): string {
  if (hash.length <= startChars + endChars) return hash
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}

// Copy to clipboard helper
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied!`)
}

// Status badge component for block finality
function StatusBadge({ status }: { status: "finalized" | "safe" | "pending" }) {
  const config = {
    finalized: { 
      icon: CheckCircle2, 
      label: "Finalized", 
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" 
    },
    safe: { 
      icon: CheckCircle2, 
      label: "Safe", 
      className: "bg-blue-500/15 text-blue-600 border-blue-500/30" 
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

// Stat card for overview metrics
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  valueClassName 
}: { 
  icon: React.ElementType
  label: string 
  value: string | number
  subValue?: string
  valueClassName?: string
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-2.5 text-center">
      <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
      <div className={`text-sm font-semibold ${valueClassName || ""}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {subValue && (
        <div className="text-[9px] text-muted-foreground/70 mt-0.5">{subValue}</div>
      )}
    </div>
  )
}

export function BlockDetailsView({ response }: BlockDetailsViewProps) {
  const { chain, data } = response
  const { overview, metrics, rewards, transactions } = data

  return (
    <div className="w-full max-w-4xl space-y-3">
      {/* Header Card - Block Number & Hash */}
      <Card className="p-3 bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              <Box className="h-3 w-3" />
              Block
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-violet-600">
                #{overview.block_number.toLocaleString()}
              </span>
              <StatusBadge status={overview.status} />
            </div>
          </div>
        </div>
        
        {/* Block Hash Row */}
        <div className="mt-2 pt-2 border-t border-violet-500/10">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Hash:</span>
            <code className="text-[11px] font-mono text-muted-foreground">{truncateHash(overview.block_hash, 14, 12)}</code>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 cursor-pointer"
              onClick={() => copyToClipboard(overview.block_hash, "Block hash")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-violet-500/10 text-xs">
          {chain && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Chain:</span>
              <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0">{chain}</Badge>
            </div>
          )}
          <div className="flex items-center gap-1.5" title={overview.timestamp}>
            <span className="text-muted-foreground">Time:</span>
            <span>{overview.timestamp_relative}</span>
            <span className="text-muted-foreground/60">({overview.timestamp})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Transactions:</span>
            <span className="font-mono font-medium">{overview.transaction_count.toLocaleString()}</span>
          </div>
          {overview.withdrawals_count != null && overview.withdrawals_count > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Withdrawals:</span>
              <span className="font-mono">{overview.withdrawals_count.toLocaleString()}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard 
          icon={Layers} 
          label="Transactions" 
          value={overview.transaction_count.toLocaleString()}
        />
        <StatCard 
          icon={Fuel} 
          label="Gas Used" 
          value={`${metrics.gas_used_percentage.toFixed(1)}%`}
          subValue={`${metrics.gas_used.toLocaleString()} / ${metrics.gas_limit.toLocaleString()}`}
        />
        <StatCard 
          icon={Flame} 
          label="Burnt Fees" 
          value={metrics.burnt_fees || "—"}
        />
        <StatCard 
          icon={HardDrive} 
          label="Size" 
          value={`${(metrics.size_bytes / 1024).toFixed(2)} KB`}
          subValue={`${metrics.size_bytes.toLocaleString()} bytes`}
        />
      </div>

      {/* Two Column Grid for Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Block Info Card */}
        <Card className="p-3">
          <SectionHeader icon={Box} title="Block Info" />
          <div className="space-y-0">
            <DetailRow 
              label="Miner / Validator" 
              value={overview.miner_label || truncateHash(overview.miner_validator, 8, 6)} 
              copyable 
              mono={!overview.miner_label}
            />
            {overview.miner_label && (
              <DetailRow label="Miner Address" value={overview.miner_validator} copyable mono truncate />
            )}
            {metrics.base_fee && (
              <DetailRow label="Base Fee" value={metrics.base_fee} mono />
            )}
            {metrics.priority_fee && (
              <DetailRow label="Priority Fee" value={metrics.priority_fee} mono />
            )}
            {metrics.difficulty && (
              <DetailRow label="Difficulty" value={metrics.difficulty} mono />
            )}
            {metrics.nonce && (
              <DetailRow label="Nonce" value={metrics.nonce} mono />
            )}
          </div>
        </Card>

        {/* Gas & Metrics Card */}
        <Card className="p-3">
          <SectionHeader icon={Fuel} title="Gas & Metrics" />
          <div className="space-y-0">
            <DetailRow label="Gas Limit" value={metrics.gas_limit.toLocaleString()} mono />
            <DetailRow 
              label="Gas Used" 
              value={
                <span className="flex items-center gap-1.5">
                  <span className="font-mono">{metrics.gas_used.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {metrics.gas_used_percentage.toFixed(2)}%
                  </Badge>
                </span>
              }
            />
            {metrics.base_fee && (
              <DetailRow label="Base Fee Per Gas" value={metrics.base_fee} mono />
            )}
            {metrics.burnt_fees && (
              <DetailRow label="Burnt Fees" value={metrics.burnt_fees} mono valueClassName="text-orange-500" />
            )}
            <DetailRow label="Size" value={`${metrics.size_bytes.toLocaleString()} bytes`} mono />
            {metrics.total_difficulty && (
              <DetailRow label="Total Difficulty" value={metrics.total_difficulty} mono />
            )}
          </div>
        </Card>
      </div>

      {/* Rewards Card - if present */}
      {rewards && (rewards.block_reward || rewards.uncle_reward || rewards.total_reward) && (
        <Card className="p-3">
          <SectionHeader icon={Award} title="Block Rewards" />
          <div className="grid grid-cols-3 gap-3">
            {rewards.block_reward && (
              <div className="bg-emerald-500/10 rounded-lg p-2.5 text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Block Reward</div>
                <div className="text-sm font-semibold font-mono text-emerald-600">{rewards.block_reward}</div>
              </div>
            )}
            {rewards.uncle_reward && (
              <div className="bg-blue-500/10 rounded-lg p-2.5 text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Uncle Reward</div>
                <div className="text-sm font-semibold font-mono text-blue-600">{rewards.uncle_reward}</div>
              </div>
            )}
            {rewards.total_reward && (
              <div className="bg-violet-500/10 rounded-lg p-2.5 text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Total Reward</div>
                <div className="text-sm font-semibold font-mono text-violet-600">{rewards.total_reward}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transactions List - if present */}
      {transactions && transactions.length > 0 && (
        <Card className="p-3">
          <SectionHeader icon={Coins} title={`Transactions (${transactions.length})`} />
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx, idx) => (
              <div key={idx} className="bg-muted/30 rounded p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <code className="text-[11px] font-mono truncate">{truncateHash(tx.transaction_hash, 8, 6)}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 cursor-pointer flex-shrink-0"
                      onClick={() => copyToClipboard(tx.transaction_hash, "Transaction hash")}
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  {tx.method && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{tx.method}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] flex-shrink-0">
                  <span className="font-mono text-muted-foreground">{truncateHash(tx.from_address, 4, 4)}</span>
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="font-mono text-muted-foreground">{tx.to_address ? truncateHash(tx.to_address, 4, 4) : "Contract"}</span>
                  <span className="font-mono font-medium">{tx.amount}</span>
                </div>
              </div>
            ))}
            {transactions.length > 10 && (
              <div className="text-[10px] text-muted-foreground text-center pt-1">
                +{transactions.length - 10} more transactions
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

