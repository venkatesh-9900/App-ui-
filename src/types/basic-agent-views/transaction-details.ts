/**
 * Transaction Details View - TypeScript interfaces
 * Mirrors the Pydantic schema from ai-agents-service
 */

export interface TransactionTimestamp {
  iso: string
  relative: string
}

export interface TransactionOverview {
  transaction_hash: string
  status: "success" | "failed" | "pending"
  block_number: number
  confirmations: number
  timestamp: TransactionTimestamp
}

export interface TransactionInputData {
  hex?: string | null
  decoded?: unknown | null
}

export interface TransactionDetailsData {
  from_address: string
  to_address?: string | null
  contract_creation?: boolean
  value_native: string
  transaction_fee: string
  gas_price: string
  gas_limit: number
  gas_used: number
  nonce: number
  transaction_index: number
  input_data: TransactionInputData
}

export interface TransactionLog {
  index: number
  topics: string[]
  data: string
}

export interface TokenTransfer {
  token_name: string
  token_contract: string
  from_address: string
  to_address: string
  amount: string
}

export interface NftTransfer {
  collection_name: string
  token_id: string
  from_address: string
  to_address: string
}

export interface TransactionData {
  overview: TransactionOverview
  details: TransactionDetailsData
  logs?: TransactionLog[] | null
  token_transfers?: TokenTransfer[] | null
  nft_transfers?: NftTransfer[] | null
}

export interface TransactionViewResponse {
  view: "transaction_details"
  chain: string
  data: TransactionData
}

export function isTransactionView(response: { view: string }): response is TransactionViewResponse {
  return response.view === "transaction_details"
}

