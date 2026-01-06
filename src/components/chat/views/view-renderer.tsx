"use client"

import { 
  parseAgentResponse, 
  isTransactionView, 
  isAddressView,
  isBlockView, 
  isStandardConversation,
  mightBeAgentResponse,
  AddressViewResponse
} from "@/types/basic-agent-views"
import { TransactionDetailsView } from "./transaction-details-view"
import { AddressDetailsView } from "./address-details-view"
import { BlockDetailsView } from "./block-details-view"

// TODO: Remove this after testing - Dummy address data for UI visualization
const DUMMY_ADDRESS_RESPONSE: AddressViewResponse = {
  view: "address_details",
  chain: "ethereum",
  data: {
    overview: {
      address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263",
      address_type: "eoa",
      native_balance: "0.000019365193512 ETH",
      native_value_usd: "$0.06",
      token_holdings_count: 95,
      token_holdings_value_usd: "$1.76",
      transaction_count: 931063,
      first_transaction_date: "Sep 15, 2022",
      last_transaction_date: "4 mins ago"
    },
    token_holdings: [
      { token_name: "Tether USD", token_symbol: "USDT", token_contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", balance: "1,234.56", value_usd: "$1,234.56" },
      { token_name: "USD Coin", token_symbol: "USDC", token_contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", balance: "500.00", value_usd: "$500.00" },
      { token_name: "Wrapped Ether", token_symbol: "WETH", token_contract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", balance: "0.5", value_usd: "$1,650.00" }
    ],
    transactions: [
      { transaction_hash: "0x8b2d1a3c4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b", method: "Transfer", block_number: 21987654, age: "2 mins ago", from_address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263", to_address: "0x1234567890abcdef1234567890abcdef12345678", direction: "out", amount: "0.05 ETH", txn_fee: "0.0021 ETH" },
      { transaction_hash: "0x1c4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d", method: "Swap", block_number: 21987600, age: "15 mins ago", from_address: "0xabcdef1234567890abcdef1234567890abcdef12", to_address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263", direction: "in", amount: "1.2 ETH", txn_fee: "0.0045 ETH" },
      { transaction_hash: "0x2d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f", method: "Approve", block_number: 21987550, age: "1 hour ago", from_address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263", to_address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", direction: "out", amount: "0 ETH", txn_fee: "0.0012 ETH" }
    ],
    token_transfers: [
      { transaction_hash: "0x3e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f", method: "Transfer", block_number: 21987640, age: "5 mins ago", from_address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263", to_address: "0x9876543210fedcba9876543210fedcba98765432", direction: "out", amount: "100", token_name: "Tether USD", token_symbol: "USDT" },
      { transaction_hash: "0x4f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a", method: "Transfer", block_number: 21987500, age: "2 hours ago", from_address: "0xfedcba9876543210fedcba9876543210fedcba98", to_address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263", direction: "in", amount: "500", token_name: "USD Coin", token_symbol: "USDC" }
    ],
    analytics: {
      overview: {
        transaction_count: 969056,
        active_age: "3 Years 113 Days",
        unique_days_active: 1114,
        longest_streak: 114,
        first_active_date: "Sep 15, 2022"
      },
      dapp_activity: [
        { rank: 1, project: "Uniswap V3", txn_count: 45231, value_usd: "$2.5M" },
        { rank: 2, project: "OpenSea", txn_count: 12453, value_usd: "$890K" },
        { rank: 3, project: "Aave V3", txn_count: 8762, value_usd: "$1.2M" },
        { rank: 4, project: "Lido", txn_count: 5421, value_usd: "$3.1M" },
        { rank: 5, project: "Curve Finance", txn_count: 3215, value_usd: "$450K" }
      ],
      neighbors: [
        { rank: 1, address: "0xCoinbase44AD5F97", label: "Coinbase 44", inflow_usd: "$12.5M", outflow_usd: "$8.2M", net_flow_usd: "$4.3M" },
        { rank: 2, address: "0xTitanBuilder3E8F21", label: "Titan Builder", inflow_usd: "$9.4M", outflow_usd: "$9.1M", net_flow_usd: "$0.3M" },
        { rank: 3, address: "0xBinance147C9D42", label: "Binance 14", inflow_usd: "$5.2M", outflow_usd: "$6.8M", net_flow_usd: "-$1.6M" },
        { rank: 4, address: "0x8a7b6c5d4e3f2a1b", label: null, inflow_usd: "$2.1M", outflow_usd: "$1.9M", net_flow_usd: "$0.2M" }
      ],
      // Generate heatmap data for the past year
      heatmap: (() => {
        const data = []
        const endDate = new Date("2026-01-06")
        const startDate = new Date("2025-02-01")
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          // Random transaction count with some days having 0 (inactive)
          const isActive = Math.random() > 0.15
          const count = isActive ? Math.floor(Math.random() * 50) + 1 : 0
          data.push({ date: d.toISOString().split('T')[0], count })
        }
        return data
      })(),
      transaction_chart: [
        { date: "2024-01", transactions: 12500 },
        { date: "2024-02", transactions: 18900 },
        { date: "2024-03", transactions: 15600 },
        { date: "2024-04", transactions: 22300 },
        { date: "2024-05", transactions: 19800 },
        { date: "2024-06", transactions: 25100 },
        { date: "2024-07", transactions: 31200 },
        { date: "2024-08", transactions: 28400 },
        { date: "2024-09", transactions: 35600 },
        { date: "2024-10", transactions: 42100 },
        { date: "2024-11", transactions: 38900 },
        { date: "2024-12", transactions: 45200 }
      ]
    }
  }
}

// Set to true to use dummy data for address details view
const USE_DUMMY_ADDRESS_DATA = false

interface ViewRendererProps {
  content: string
  fallbackRenderer: (content: string) => React.ReactNode
}

/**
 * ViewRenderer - Detects if content is a structured agent response
 * and renders the appropriate view component.
 * 
 * If the content is not a valid agent response or is a standard_conversation,
 * it falls back to the default rendering logic.
 */
export function ViewRenderer({ content, fallbackRenderer }: ViewRendererProps) {
  // Try to parse as agent response
  const agentResponse = parseAgentResponse(content)
  
  // DEBUG: Use dummy address data if enabled and content mentions "address"
  if (USE_DUMMY_ADDRESS_DATA && content.toLowerCase().includes("address")) {
    return <AddressDetailsView response={DUMMY_ADDRESS_RESPONSE} />
  }
  
  // If not a valid agent response, use fallback
  if (!agentResponse) {
    return <>{fallbackRenderer(content)}</>
  }
  
  // Handle standard conversation - extract message and use fallback renderer
  if (isStandardConversation(agentResponse)) {
    const message = agentResponse.data.message
    return <>{fallbackRenderer(message)}</>
  }
  
  // Handle transaction details view
  if (isTransactionView(agentResponse)) {
    return <TransactionDetailsView response={agentResponse} />
  }
  
  // Handle address details view
  if (isAddressView(agentResponse)) {
    return <AddressDetailsView response={agentResponse} />
  }
  
  // Handle block details view
  if (isBlockView(agentResponse)) {
    return <BlockDetailsView response={agentResponse} />
  }
  
  // Unknown view type - use fallback
  return <>{fallbackRenderer(content)}</>
}

// Re-export mightBeAgentResponse for convenience
export { mightBeAgentResponse }
