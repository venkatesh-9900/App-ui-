/**
 * Standard Conversation View - TypeScript interfaces
 * Used for general responses, greetings, errors, etc.
 */

export interface StandardConversationData {
  message: string
}

export interface StandardConversationResponse {
  view: "standard_conversation"
  chain: string
  data: StandardConversationData
}

export function isStandardConversation(response: { view: string }): response is StandardConversationResponse {
  return response.view === "standard_conversation"
}

