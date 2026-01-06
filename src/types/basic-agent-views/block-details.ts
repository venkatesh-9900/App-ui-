/**
 * Block Details View - TypeScript interfaces
 * Mirrors the Pydantic schema from ai-agents-service
 */

// ============================================
// Block Overview
// ============================================

export interface BlockOverview {
  block_number: number
  block_hash: string
  status: "finalized" | "safe" | "pending"
  timestamp: string
  timestamp_relative: string
  miner_validator: string
  miner_label?: string | null
  transaction_count: number
  withdrawals_count?: number | null
}

// ============================================
// Block Metrics
// ============================================

export interface BlockMetrics {
  gas_used: number
  gas_limit: number
  gas_used_percentage: number
  base_fee?: string | null
  burnt_fees?: string | null
  priority_fee?: string | null
  size_bytes: number
  difficulty?: string | null
  total_difficulty?: string | null
  nonce?: string | null
}

// ============================================
// Block Rewards
// ============================================

export interface BlockRewards {
  block_reward?: string | null
  uncle_reward?: string | null
  total_reward?: string | null
}

// ============================================
// Block Transaction
// ============================================

export interface BlockTransaction {
  transaction_hash: string
  method?: string | null
  from_address: string
  to_address?: string | null
  amount: string
  txn_fee: string
}

// ============================================
// Complete Block Data
// ============================================

export interface BlockData {
  overview: BlockOverview
  metrics: BlockMetrics
  rewards?: BlockRewards | null
  transactions?: BlockTransaction[] | null
}

export interface BlockViewResponse {
  view: "block_details"
  chain: string
  data: BlockData
}

export function isBlockView(response: { view: string }): response is BlockViewResponse {
  return response.view === "block_details"
}

