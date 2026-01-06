/**
 * Address Details View - TypeScript interfaces
 * Mirrors the Pydantic schema from ai-agents-service
 */

// ============================================
// Overview Section
// ============================================

export interface AddressOverview {
  address: string
  address_type: "eoa" | "contract"
  native_balance: string
  native_value_usd?: string | null
  token_holdings_count?: number | null
  token_holdings_value_usd?: string | null
  transaction_count: number
  first_transaction_date?: string | null
  last_transaction_date?: string | null
}

// ============================================
// Token Holdings
// ============================================

export interface TokenHolding {
  token_name: string
  token_symbol: string
  token_contract: string
  balance: string
  value_usd?: string | null
}

export interface NftHolding {
  collection_name: string
  token_ids: string[]
}

// ============================================
// Transactions Tab
// ============================================

export interface AddressTransaction {
  transaction_hash: string
  method?: string | null
  block_number: number
  age: string
  from_address: string
  to_address: string
  direction: "in" | "out" | "self"
  amount: string
  txn_fee: string
}

// ============================================
// Token Transfers Tab
// ============================================

export interface TokenTransferEvent {
  transaction_hash: string
  method?: string | null
  block_number: number
  age: string
  from_address: string
  to_address: string
  direction: "in" | "out" | "self"
  amount: string
  token_name: string
  token_symbol: string
}

// ============================================
// Analytics Tab
// ============================================

export interface AnalyticsOverview {
  transaction_count: number
  active_age: string
  unique_days_active: number
  longest_streak: number
  first_active_date: string
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface DAppActivity {
  rank: number
  project: string
  txn_count: number
  value_usd: string
}

export interface Neighbor {
  rank: number
  address: string
  label?: string | null
  inflow_usd: string
  outflow_usd: string
  net_flow_usd: string
}

export interface TransactionChartPoint {
  date: string
  transactions: number
  unique_outgoing?: number
  unique_incoming?: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  heatmap?: HeatmapDay[] | null
  dapp_activity?: DAppActivity[] | null
  neighbors?: Neighbor[] | null
  transaction_chart?: TransactionChartPoint[] | null
}

// ============================================
// Complete Address Data
// ============================================

export interface AddressData {
  overview: AddressOverview
  token_holdings?: TokenHolding[] | null
  nft_holdings?: NftHolding[] | null
  transactions?: AddressTransaction[] | null
  token_transfers?: TokenTransferEvent[] | null
  analytics?: AnalyticsData | null
}

export interface AddressViewResponse {
  view: "address_details"
  chain: string
  data: AddressData
}

export function isAddressView(response: { view: string }): response is AddressViewResponse {
  return response.view === "address_details"
}
