"use client"

import { 
  parseAgentResponse, 
  isTransactionView, 
  isAddressView,
  isBlockView,
  isContractView,
  isStandardConversation,
  mightBeAgentResponse
} from "@/types/basic-agent-views"
import { TransactionDetailsView } from "./transaction-details-view"
import { AddressDetailsView } from "./address-details-view"
import { BlockDetailsView } from "./block-details-view"
import { ContractDetailsView } from "./contract-details-view"

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
  
  // Handle contract details view
  if (isContractView(agentResponse)) {
    return <ContractDetailsView response={agentResponse} />
  }
  
  // Unknown view type - use fallback
  return <>{fallbackRenderer(content)}</>
}

// Re-export mightBeAgentResponse for convenience
export { mightBeAgentResponse }
