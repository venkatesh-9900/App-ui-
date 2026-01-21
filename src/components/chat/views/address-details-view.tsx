"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Copy, 
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  FileCode,
  BarChart3,
  Coins,
  Activity,
  TrendingUp,
  Calendar,
  Users,
  GitBranch
} from "lucide-react"
import { toast } from "sonner"
import { AddressViewResponse, AddressTransaction, TokenTransferEvent, HeatmapDay, Neighbor } from "@/types/basic-agent-views"

interface AddressDetailsViewProps {
  response: AddressViewResponse
}

type MainTab = "transactions" | "token_transfers" | "analytics"
type AnalyticsSubTab = "overview" | "heatmap" | "transactions_chart"

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

// Direction badge
function DirectionBadge({ direction }: { direction: "in" | "out" | "self" }) {
  if (direction === "in") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] px-1.5 py-0">
        <ArrowDownLeft className="h-2.5 w-2.5 mr-0.5" />
        IN
      </Badge>
    )
  }
  if (direction === "self") {
    return (
      <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] px-1.5 py-0">
        SELF
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0">
      <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
      OUT
    </Badge>
  )
}

// Tab button component
function TabButton({ 
  active, 
  onClick, 
  children,
  count
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
        active 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-1.5 ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </button>
  )
}

// Sub-tab button for analytics
function SubTabButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
        active 
          ? "bg-primary/10 text-primary border border-primary/30" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {children}
    </button>
  )
}

// Transactions table
function TransactionsTable({ transactions }: { transactions: AddressTransaction[] }) {
  if (!transactions || transactions.length === 0) {
    return <div className="text-xs text-muted-foreground text-center py-4">No transactions found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Txn Hash</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Method</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Block</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Age</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">From</th>
            <th className="text-center py-2 px-2 font-medium text-muted-foreground"></th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">To</th>
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Amount</th>
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Txn Fee</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, 25).map((tx, idx) => (
            <tr key={idx} className="border-b border-border/30 hover:bg-muted/30">
              <td className="py-2 px-2">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-primary">{truncateHash(tx.transaction_hash, 8, 4)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 cursor-pointer"
                    onClick={() => copyToClipboard(tx.transaction_hash, "Transaction hash")}
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </td>
              <td className="py-2 px-2">
                {tx.method && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tx.method}</Badge>
                )}
              </td>
              <td className="py-2 px-2 font-mono text-primary">{tx.block_number.toLocaleString()}</td>
              <td className="py-2 px-2 text-muted-foreground">{tx.age}</td>
              <td className="py-2 px-2 font-mono">{truncateHash(tx.from_address, 6, 4)}</td>
              <td className="py-2 px-2 text-center">
                <DirectionBadge direction={tx.direction} />
              </td>
              <td className="py-2 px-2 font-mono">{truncateHash(tx.to_address, 6, 4)}</td>
              <td className="py-2 px-2 text-right font-mono">{tx.amount}</td>
              <td className="py-2 px-2 text-right font-mono text-muted-foreground">{tx.txn_fee}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length > 25 && (
        <div className="text-[10px] text-muted-foreground text-center py-2">
          Showing 25 of {transactions.length.toLocaleString()} transactions
        </div>
      )}
    </div>
  )
}

// Token transfers table
function TokenTransfersTable({ transfers }: { transfers: TokenTransferEvent[] }) {
  if (!transfers || transfers.length === 0) {
    return <div className="text-xs text-muted-foreground text-center py-4">No token transfers found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Txn Hash</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Method</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Block</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Age</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">From</th>
            <th className="text-center py-2 px-2 font-medium text-muted-foreground"></th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">To</th>
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Amount</th>
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Token</th>
          </tr>
        </thead>
        <tbody>
          {transfers.slice(0, 25).map((transfer, idx) => (
            <tr key={idx} className="border-b border-border/30 hover:bg-muted/30">
              <td className="py-2 px-2">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-primary">{truncateHash(transfer.transaction_hash, 8, 4)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 cursor-pointer"
                    onClick={() => copyToClipboard(transfer.transaction_hash, "Transaction hash")}
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </td>
              <td className="py-2 px-2">
                {transfer.method && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30">
                    {transfer.method}
                  </Badge>
                )}
              </td>
              <td className="py-2 px-2 font-mono text-primary">{transfer.block_number.toLocaleString()}</td>
              <td className="py-2 px-2 text-muted-foreground">{transfer.age}</td>
              <td className="py-2 px-2 font-mono">{truncateHash(transfer.from_address, 6, 4)}</td>
              <td className="py-2 px-2 text-center">
                <DirectionBadge direction={transfer.direction} />
              </td>
              <td className="py-2 px-2 font-mono">{truncateHash(transfer.to_address, 6, 4)}</td>
              <td className="py-2 px-2 text-right font-mono">{transfer.amount}</td>
              <td className="py-2 px-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {transfer.token_symbol}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transfers.length > 25 && (
        <div className="text-[10px] text-muted-foreground text-center py-2">
          Showing 25 of {transfers.length.toLocaleString()} transfers
        </div>
      )}
    </div>
  )
}

// Analytics Overview
function AnalyticsOverviewView({ data }: { data: AddressViewResponse["data"] }) {
  const analytics = data.analytics
  
  if (!analytics) {
    return <div className="text-xs text-muted-foreground text-center py-4">No analytics data available</div>
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Transaction Count
          </div>
          <div className="text-lg font-bold mt-1">{analytics.overview.transaction_count.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Since {analytics.overview.first_active_date}</div>
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Active Age
          </div>
          <div className="text-lg font-bold mt-1">{analytics.overview.active_age}</div>
          <div className="text-[10px] text-muted-foreground">Since {analytics.overview.first_active_date}</div>
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Unique Days Active
          </div>
          <div className="text-lg font-bold mt-1">{analytics.overview.unique_days_active.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Since {analytics.overview.first_active_date}</div>
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Longest Streak
          </div>
          <div className="text-lg font-bold mt-1">{analytics.overview.longest_streak} Days</div>
          <div className="text-[10px] text-muted-foreground">Since {analytics.overview.first_active_date}</div>
        </Card>
      </div>

      {/* DApp Activity & Neighbors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* DApp Activity */}
        {analytics.dapp_activity && analytics.dapp_activity.length > 0 && (
          <Card className="p-3">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold">
              <FileCode className="h-3.5 w-3.5 text-primary" />
              dApp Activity
            </div>
            <div className="space-y-2">
              {analytics.dapp_activity.slice(0, 5).map((dapp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">{dapp.rank}</span>
                    <span className="font-medium">{dapp.project}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{dapp.txn_count.toLocaleString()} txns</span>
                    <span className="font-mono">{dapp.value_usd}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Neighbors Sankey Chart */}
        {analytics.neighbors && analytics.neighbors.length > 0 && (
          <NeighborsSankey 
            neighbors={analytics.neighbors} 
            centerAddress={data.overview.address}
          />
        )}
      </div>
    </div>
  )
}

// Transaction Heatmap (GitHub-style contribution graph)
function TransactionHeatmap({ heatmapData }: { heatmapData: HeatmapDay[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null)
  
  if (!heatmapData || heatmapData.length === 0) {
    return <div className="text-xs text-muted-foreground text-center py-4">No heatmap data available</div>
  }

  // Sort data by date
  const sortedData = [...heatmapData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Get date range
  const startDate = new Date(sortedData[0].date)
  const endDate = new Date(sortedData[sortedData.length - 1].date)
  
  // Create a map for quick lookup
  const dataMap = new Map(sortedData.map(d => [d.date, d.count]))
  
  // Calculate max count for color intensity
  const maxCount = Math.max(...sortedData.map(d => d.count), 1)
  
  // Get color class based on count
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted/30"
    const intensity = count / maxCount
    if (intensity < 0.25) return "bg-emerald-200 dark:bg-emerald-900/50"
    if (intensity < 0.5) return "bg-emerald-400 dark:bg-emerald-700"
    if (intensity < 0.75) return "bg-emerald-500 dark:bg-emerald-600"
    return "bg-emerald-600 dark:bg-emerald-500"
  }
  
  // Generate weeks of data (~13 weeks for 90 days)
  const weeks: { date: Date; count: number }[][] = []
  
  // Start from the beginning of the week containing startDate
  const currentDate = new Date(startDate)
  currentDate.setDate(currentDate.getDate() - currentDate.getDay()) // Go to Sunday
  
  while (currentDate <= endDate) {
    const week: { date: Date; count: number }[] = []
    for (let day = 0; day < 7; day++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      week.push({
        date: new Date(currentDate),
        count: dataMap.get(dateStr) || 0
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }
  
  // Get month labels
  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, weekIdx) => {
    const month = week[0].date.getMonth()
    if (month !== lastMonth) {
      monthLabels.push({
        month: week[0].date.toLocaleDateString('en-US', { month: 'short' }),
        weekIndex: weekIdx
      })
      lastMonth = month
    }
  })

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }
  
  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  const handleMouseEnter = (e: React.MouseEvent, date: Date, count: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const parentRect = e.currentTarget.closest('.heatmap-container')?.getBoundingClientRect()
    if (parentRect) {
      setTooltip({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
        date: formatDate(date),
        count
      })
    }
  }

  return (
    <Card className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">Transaction Heatmap (Last 3 Months)</div>
        <div className="text-xs text-muted-foreground">
          {formatShortDate(startDate)} - {formatShortDate(endDate)}
        </div>
      </div>
      
      <div className="flex gap-2 heatmap-container relative w-full">
        {/* Tooltip */}
        {tooltip && (
          <div 
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg px-2.5 py-1.5 text-xs whitespace-nowrap">
              <div className="font-semibold text-center">{tooltip.count} transaction{tooltip.count !== 1 ? 's' : ''}</div>
              <div className="text-muted-foreground text-[10px] text-center">{tooltip.date}</div>
            </div>
            <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
          </div>
        )}
        
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1 flex-shrink-0">
          {dayLabels.map((label, idx) => (
            <div key={idx} className="h-5 text-[9px] text-muted-foreground leading-5 w-6">
              {label}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid - full width */}
        <div className="flex-1 min-w-0">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`aspect-square w-full min-h-4 max-h-6 rounded-sm ${getColorClass(day.count)} cursor-pointer transition-all hover:ring-2 hover:ring-foreground/30 hover:scale-110`}
                    onMouseEnter={(e) => handleMouseEnter(e, day.date, day.count)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Month labels - evenly distributed */}
          <div className="flex justify-between mt-2 px-1">
            {monthLabels.map((label, idx) => (
              <div key={idx} className="text-[10px] text-muted-foreground">
                {label.month}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4">
        <span className="text-[10px] text-muted-foreground">Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted/30" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/50" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
        <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </Card>
  )
}

// Analytics Transactions Chart (simplified representation)
function AnalyticsTransactionsChart({ data }: { data: AddressViewResponse["data"] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null)
  const chartData = data.analytics?.transaction_chart
  
  if (!chartData || chartData.length === 0) {
    return <div className="text-xs text-muted-foreground text-center py-4">No chart data available</div>
  }

  // Simple bar representation since we don't have a chart library
  const maxTxns = Math.max(...chartData.map(d => d.transactions))
  
  // Format date string (e.g., "2024-06" → "Jun 2024")
  const formatDateLabel = (dateStr: string) => {
    try {
      // Handle YYYY-MM format
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateStr.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
      // Handle full date format
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }
  
  const handleMouseEnter = (e: React.MouseEvent, dateStr: string, count: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const parentRect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect()
    if (parentRect) {
      setTooltip({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
        date: formatDateLabel(dateStr),
        count
      })
    }
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold">Transactions Over Time</div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-sm" />
            <span className="text-muted-foreground">Transactions</span>
          </div>
        </div>
      </div>
      
      <div className="h-32 flex items-end gap-1 chart-container relative">
        {/* Tooltip */}
        {tooltip && (
          <div 
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg px-2.5 py-1.5 text-xs whitespace-nowrap">
              <div className="font-semibold text-center">{tooltip.count.toLocaleString()} transactions</div>
              <div className="text-muted-foreground text-[10px] text-center">{tooltip.date}</div>
            </div>
            <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
          </div>
        )}
        
        {chartData.slice(-12).map((point, idx) => (
          <div
            key={idx}
            className="flex-1 bg-primary/60 hover:bg-primary rounded-t-sm transition-all cursor-pointer hover:scale-105"
            style={{ height: `${(point.transactions / maxTxns) * 100}%`, minHeight: '4px' }}
            onMouseEnter={(e) => handleMouseEnter(e, point.date, point.transactions)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>{formatDateLabel(chartData[0]?.date)}</span>
        <span>{formatDateLabel(chartData[chartData.length - 1]?.date)}</span>
      </div>
    </Card>
  )
}

// Helper to parse USD value string to number
function parseUsdToNumber(usdStr: string | null | undefined): number {
  if (!usdStr) return 0
  const match = usdStr.match(/[\d,.]+/)
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0
}

// Helper to format number as USD
function formatUsd(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`
  } else if (value >= 1) {
    return `$${value.toFixed(2)}`
  } else if (value > 0) {
    return `$${value.toFixed(4)}`
  }
  return "$0.00"
}

export function AddressDetailsView({ response }: AddressDetailsViewProps) {
  const { chain, data } = response
  const { overview, token_holdings, transactions, token_transfers, analytics } = data
  
  const [mainTab, setMainTab] = useState<MainTab>("transactions")
  const [analyticsSubTab, setAnalyticsSubTab] = useState<AnalyticsSubTab>("overview")
  
  // Calculate total token holdings value from individual tokens
  const totalTokenHoldingsValue = token_holdings?.reduce((sum, token) => {
    // First try to use pre-calculated value_usd
    if (token.value_usd) {
      return sum + parseUsdToNumber(token.value_usd)
    }
    // Otherwise calculate from balance * price_usd
    if (token.price_usd && token.balance) {
      const balance = parseFloat(token.balance) || 0
      return sum + (balance * token.price_usd)
    }
    return sum
  }, 0) || 0

  return (
    <div className="w-full max-w-5xl space-y-3">
      {/* Header Card - Address Overview */}
      <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              <Wallet className="h-3 w-3" />
              {overview.address_type === "contract" ? "Contract Address" : "Wallet Address"}
            </div>
            <div className="flex items-center gap-1.5">
              <code className="text-xs font-mono break-all">{overview.address}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 flex-shrink-0 cursor-pointer"
                onClick={() => copyToClipboard(overview.address, "Address")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${
            overview.address_type === "contract" 
              ? "bg-purple-500/15 text-purple-600 border-purple-500/30" 
              : "bg-blue-500/15 text-blue-600 border-blue-500/30"
          }`}>
            {overview.address_type === "contract" ? "Contract" : "EOA"}
          </Badge>
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Balance</div>
          <div className="text-sm font-bold font-mono mt-1">{overview.native_balance}</div>
          {overview.native_value_usd && (
            <div className="text-[10px] text-muted-foreground">{overview.native_value_usd}</div>
          )}
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Token Holdings</div>
          <div className="text-sm font-bold mt-1">
            {totalTokenHoldingsValue > 0 
              ? formatUsd(totalTokenHoldingsValue)
              : (overview.token_holdings_value_usd || "$0.00")}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {token_holdings?.length || overview.token_holdings_count || 0} Tokens
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Transactions</div>
          <div className="text-sm font-bold font-mono mt-1">{overview.transaction_count.toLocaleString()}</div>
          {chain && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1 capitalize">{chain}</Badge>
          )}
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Activity</div>
          <div className="text-xs mt-1">
            {overview.first_transaction_date && (
              <div>First: <span className="text-muted-foreground">{overview.first_transaction_date}</span></div>
            )}
            {overview.last_transaction_date && (
              <div>Last: <span className="text-muted-foreground">{overview.last_transaction_date}</span></div>
            )}
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <TabButton 
            active={mainTab === "transactions"} 
            onClick={() => setMainTab("transactions")}
            count={transactions?.length}
          >
            <Activity className="h-3 w-3 inline mr-1" />
            Transactions
          </TabButton>
          <TabButton 
            active={mainTab === "token_transfers"} 
            onClick={() => setMainTab("token_transfers")}
            count={token_transfers?.length}
          >
            <Coins className="h-3 w-3 inline mr-1" />
            Token Transfers
          </TabButton>
          <TabButton 
            active={mainTab === "analytics"} 
            onClick={() => setMainTab("analytics")}
          >
            <BarChart3 className="h-3 w-3 inline mr-1" />
            Analytics
          </TabButton>
        </div>

        {/* Analytics Sub-tabs */}
        {mainTab === "analytics" && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-3 border-b border-border/50">
            <SubTabButton 
              active={analyticsSubTab === "overview"} 
              onClick={() => setAnalyticsSubTab("overview")}
            >
              Overview
            </SubTabButton>
            <SubTabButton 
              active={analyticsSubTab === "heatmap"} 
              onClick={() => setAnalyticsSubTab("heatmap")}
            >
              Heatmap
            </SubTabButton>
            <SubTabButton 
              active={analyticsSubTab === "transactions_chart"} 
              onClick={() => setAnalyticsSubTab("transactions_chart")}
            >
              Transactions
            </SubTabButton>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-3">
          {mainTab === "transactions" && (
            <TransactionsTable transactions={transactions || []} />
          )}
          
          {mainTab === "token_transfers" && (
            <TokenTransfersTable transfers={token_transfers || []} />
          )}
          
          {mainTab === "analytics" && analyticsSubTab === "overview" && (
            <AnalyticsOverviewView data={data} />
          )}
          
          {mainTab === "analytics" && analyticsSubTab === "heatmap" && (
            <TransactionHeatmap heatmapData={analytics?.heatmap || []} />
          )}
          
          {mainTab === "analytics" && analyticsSubTab === "transactions_chart" && (
            <AnalyticsTransactionsChart data={data} />
          )}
        </div>
      </Card>

      {/* Token Holdings (if present) */}
      {token_holdings && token_holdings.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold">
            <Coins className="h-3.5 w-3.5 text-primary" />
            Token Holdings ({token_holdings.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {token_holdings.slice(0, 10).map((token, idx) => {
              // Calculate token value if not provided
              const tokenValue = token.value_usd 
                ? parseUsdToNumber(token.value_usd)
                : (token.price_usd && token.balance)
                  ? parseFloat(token.balance) * token.price_usd
                  : 0
              
              return (
                <div key={idx} className="flex items-center justify-between bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{token.token_symbol}</Badge>
                    <span className="text-xs truncate max-w-[120px]">{token.token_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono">{token.balance}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {tokenValue > 0 ? formatUsd(tokenValue) : "$0.00"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {token_holdings.length > 10 && (
            <div className="text-[10px] text-muted-foreground text-center mt-2">
              +{token_holdings.length - 10} more tokens
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// Neighbors Sankey Chart - Flow visualization
function NeighborsSankey({ neighbors, centerAddress }: { neighbors: Neighbor[]; centerAddress: string }) {
  const [hoveredLink, setHoveredLink] = useState<number | null>(null)
  const [hoveredAddress, setHoveredAddress] = useState<{ x: number; y: number; address: string; label?: string; side: 'left' | 'center' | 'right' } | null>(null)
  
  // Parse USD values to numbers
  const parseUsdValue = (value: string): number => {
    const match = value.match(/[\d,]+/)
    return match ? parseFloat(match[0].replace(/,/g, '')) : 0
  }
  
  // Prepare data - separate inflow and outflow neighbors
  const inflowNeighbors = neighbors
    .filter(n => parseUsdValue(n.inflow_usd) > 0)
    .sort((a, b) => parseUsdValue(b.inflow_usd) - parseUsdValue(a.inflow_usd))
    .slice(0, 5)
  
  const outflowNeighbors = neighbors
    .filter(n => parseUsdValue(n.outflow_usd) > 0)
    .sort((a, b) => parseUsdValue(b.outflow_usd) - parseUsdValue(a.outflow_usd))
    .slice(0, 5)
  
  // Calculate max values for proportional widths
  const maxInflow = Math.max(...inflowNeighbors.map(n => parseUsdValue(n.inflow_usd)), 1)
  const maxOutflow = Math.max(...outflowNeighbors.map(n => parseUsdValue(n.outflow_usd)), 1)
  
  // SVG dimensions
  const width = 600
  const height = 300
  const nodeWidth = 12
  const centerX = width / 2
  const leftX = 80
  const rightX = width - 80
  
  // Calculate node positions
  const centerNodeHeight = Math.max(inflowNeighbors.length, outflowNeighbors.length, 1) * 40
  const centerNodeY = (height - centerNodeHeight) / 2
  
  // Calculate link path with curved bezier
  const createLinkPath = (
    startX: number, startY: number, startHeight: number,
    endX: number, endY: number, endHeight: number
  ) => {
    const controlOffset = Math.abs(endX - startX) * 0.4
    return `
      M ${startX} ${startY}
      C ${startX + controlOffset} ${startY},
        ${endX - controlOffset} ${endY},
        ${endX} ${endY}
      L ${endX} ${endY + endHeight}
      C ${endX - controlOffset} ${endY + endHeight},
        ${startX + controlOffset} ${startY + startHeight},
        ${startX} ${startY + startHeight}
      Z
    `
  }
  
  // Truncate address for display
  const truncAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  return (
    <Card className="p-3 md:col-span-2">
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold">
        <GitBranch className="h-3.5 w-3.5 text-primary" />
        Fund Flow - Neighbors
      </div>
      
      <div className="relative overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          <defs>
            <linearGradient id="inflowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="outflowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="inflowGradientHover" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="outflowGradientHover" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Inflow links (left side to center) */}
          {inflowNeighbors.map((neighbor, idx) => {
            const value = parseUsdValue(neighbor.inflow_usd)
            const linkHeight = Math.max((value / maxInflow) * 25, 4)
            const sourceY = 30 + idx * 50
            const targetY = centerNodeY + (idx / Math.max(inflowNeighbors.length - 1, 1)) * (centerNodeHeight - linkHeight)
            const linkIndex = idx
            
            return (
              <g key={`inflow-${idx}`}>
                <path
                  d={createLinkPath(
                    leftX + nodeWidth, sourceY + 10 - linkHeight/2, linkHeight,
                    centerX - nodeWidth/2, targetY, linkHeight
                  )}
                  fill={hoveredLink === linkIndex ? "url(#inflowGradientHover)" : "url(#inflowGradient)"}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredLink(linkIndex)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
                {hoveredLink === linkIndex && (
                  <text
                    x={(leftX + centerX) / 2}
                    y={sourceY + (targetY - sourceY) / 2}
                    textAnchor="middle"
                    className="fill-current text-[10px] font-semibold pointer-events-none"
                  >
                    {neighbor.inflow_usd}
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Outflow links (center to right side) */}
          {outflowNeighbors.map((neighbor, idx) => {
            const value = parseUsdValue(neighbor.outflow_usd)
            const linkHeight = Math.max((value / maxOutflow) * 25, 4)
            const sourceY = centerNodeY + (idx / Math.max(outflowNeighbors.length - 1, 1)) * (centerNodeHeight - linkHeight)
            const targetY = 30 + idx * 50
            const linkIndex = 100 + idx
            
            return (
              <g key={`outflow-${idx}`}>
                <path
                  d={createLinkPath(
                    centerX + nodeWidth/2, sourceY, linkHeight,
                    rightX - nodeWidth, targetY + 10 - linkHeight/2, linkHeight
                  )}
                  fill={hoveredLink === linkIndex ? "url(#outflowGradientHover)" : "url(#outflowGradient)"}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredLink(linkIndex)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
                {hoveredLink === linkIndex && (
                  <text
                    x={(centerX + rightX) / 2}
                    y={sourceY + (targetY - sourceY) / 2}
                    textAnchor="middle"
                    className="fill-current text-[10px] font-semibold pointer-events-none"
                  >
                    {neighbor.outflow_usd}
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Left nodes (inflow sources) */}
          {inflowNeighbors.map((neighbor, idx) => {
            const y = 30 + idx * 50
            return (
              <g 
                key={`left-node-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAddress({ x: leftX - 8, y: y - 10, address: neighbor.address, label: neighbor.label || undefined, side: 'left' })}
                onMouseLeave={() => setHoveredAddress(null)}
                onClick={() => copyToClipboard(neighbor.address, "Address")}
              >
                <rect
                  x={leftX}
                  y={y}
                  width={nodeWidth}
                  height={20}
                  rx={2}
                  className="fill-emerald-500"
                />
                <text
                  x={leftX - 8}
                  y={y + 10}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-current text-[10px] font-mono"
                >
                  {truncAddr(neighbor.address)}
                </text>
                {neighbor.label && (
                  <text
                    x={leftX - 8}
                    y={y + 22}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[8px]"
                  >
                    {neighbor.label}
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Center node (analyzed address) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredAddress({ x: centerX, y: centerNodeY - 35, address: centerAddress, side: 'center' })}
            onMouseLeave={() => setHoveredAddress(null)}
            onClick={() => copyToClipboard(centerAddress, "Address")}
          >
            <rect
              x={centerX - nodeWidth/2}
              y={centerNodeY}
              width={nodeWidth}
              height={centerNodeHeight}
              rx={3}
              className="fill-primary"
            />
            <text
              x={centerX}
              y={centerNodeY - 20}
              textAnchor="middle"
              className="fill-current text-[11px] font-semibold"
            >
              Analyzed Address
            </text>
            <text
              x={centerX}
              y={centerNodeY - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {truncAddr(centerAddress)}
            </text>
          </g>
          
          {/* Right nodes (outflow destinations) */}
          {outflowNeighbors.map((neighbor, idx) => {
            const y = 30 + idx * 50
            return (
              <g 
                key={`right-node-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAddress({ x: rightX - 8, y: y - 10, address: neighbor.address, label: neighbor.label || undefined, side: 'right' })}
                onMouseLeave={() => setHoveredAddress(null)}
                onClick={() => copyToClipboard(neighbor.address, "Address")}
              >
                <rect
                  x={rightX - nodeWidth}
                  y={y}
                  width={nodeWidth}
                  height={20}
                  rx={2}
                  className="fill-amber-500"
                />
                <text
                  x={rightX + 8}
                  y={y + 10}
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="fill-current text-[10px] font-mono"
                >
                  {truncAddr(neighbor.address)}
                </text>
                {neighbor.label && (
                  <text
                    x={rightX + 8}
                    y={y + 22}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[8px]"
                  >
                    {neighbor.label}
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Legend */}
          <g transform={`translate(${width/2 - 80}, ${height - 25})`}>
            <rect x={0} y={0} width={12} height={12} rx={2} className="fill-emerald-500" />
            <text x={18} y={10} className="fill-muted-foreground text-[10px]">Inflow</text>
            <rect x={70} y={0} width={12} height={12} rx={2} className="fill-amber-500" />
            <text x={88} y={10} className="fill-muted-foreground text-[10px]">Outflow</text>
          </g>
          
          {/* Address Tooltip */}
          {hoveredAddress && (() => {
            const tooltipWidth = hoveredAddress.address.length * 5.5 + 16
            const tooltipHeight = hoveredAddress.label ? 34 : 22
            // For right side, position tooltip to the left; for center, center it; for left, position to the right
            const xOffset = hoveredAddress.side === 'right' 
              ? -tooltipWidth - 4 
              : hoveredAddress.side === 'center' 
                ? -tooltipWidth / 2 
                : -4
            return (
              <g transform={`translate(${hoveredAddress.x}, ${hoveredAddress.y})`}>
                <rect
                  x={xOffset}
                  y={-16}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx={4}
                  className="fill-popover stroke-border"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                />
                <text
                  x={xOffset + 8}
                  y={-2}
                  className="fill-current text-[9px] font-mono"
                >
                  {hoveredAddress.address}
                </text>
                {hoveredAddress.label && (
                  <text
                    x={xOffset + 8}
                    y={12}
                    className="fill-muted-foreground text-[8px]"
                  >
                    {hoveredAddress.label}
                  </text>
                )}
                <text
                  x={xOffset + tooltipWidth / 2}
                  y={tooltipHeight - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[7px]"
                >
                  Click to copy
                </text>
              </g>
            )
          })()}
        </svg>
      </div>
      
      {/* Fallback table for small screens or no data */}
      {(inflowNeighbors.length === 0 && outflowNeighbors.length === 0) && (
        <div className="text-xs text-muted-foreground text-center py-4">
          No fund flow data available
        </div>
      )}
    </Card>
  )
}
