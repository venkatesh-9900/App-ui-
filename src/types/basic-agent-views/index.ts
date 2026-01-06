/**
 * Basic Agent Views - Barrel exports
 * Import from @/types/basic-agent-views
 */

// Re-export all view types
export * from "./transaction-details"
export * from "./address-details"
export * from "./block-details"
export * from "./standard-conversation"

// Import for union type
import { TransactionViewResponse } from "./transaction-details"
import { AddressViewResponse } from "./address-details"
import { BlockViewResponse } from "./block-details"
import { StandardConversationResponse } from "./standard-conversation"

// ============================================
// Shared Types
// ============================================

export type ViewType = "transaction_details" | "address_details" | "block_details" | "standard_conversation"

export type AgentResponse = 
  | TransactionViewResponse 
  | AddressViewResponse 
  | BlockViewResponse
  | StandardConversationResponse

// ============================================
// Type Guards & Utilities
// ============================================

export function isAgentResponse(obj: unknown): obj is AgentResponse {
  if (typeof obj !== "object" || obj === null) return false
  const response = obj as Record<string, unknown>
  return (
    typeof response.view === "string" &&
    ["transaction_details", "address_details", "block_details", "standard_conversation"].includes(response.view) &&
    typeof response.data === "object"
  )
}

/**
 * Parse agent response from string
 * Returns null if parsing fails or content is not a valid agent response
 */
export function parseAgentResponse(content: string): AgentResponse | null {
  try {
    const parsed = JSON.parse(content)
    if (isAgentResponse(parsed)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

/**
 * Check if content might be a structured agent response
 * Quick check before attempting full parsing
 */
export function mightBeAgentResponse(content: string): boolean {
  const trimmed = content.trim()
  if (!trimmed.startsWith("{")) return false
  
  try {
    const parsed = JSON.parse(trimmed)
    return typeof parsed === "object" && "view" in parsed && "data" in parsed
  } catch {
    return false
  }
}

