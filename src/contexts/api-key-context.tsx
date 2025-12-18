"use client"

import { CreatedApiKeyResponse } from "@/types/api-keys"
import React, { createContext, useContext, useMemo, useState } from "react"

/**
 * Context value shape
 */
type ApiKeyContextContextValue = {
  setApiKeyContext: (token: CreatedApiKeyResponse) => void
  peekApiKeyContext: () => CreatedApiKeyResponse | null
  takeApiKeyContext: () => CreatedApiKeyResponse | null
}

/**
 * Create the context (undefined default to force hook usage within provider)
 */
const ApiKeyContextContext = createContext<ApiKeyContextContextValue | undefined>(undefined)

/**
 * Provider component — wrap your app (or subtree) with this.
 */
export function ApiKeyContextProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<CreatedApiKeyResponse | null>(null)

  // memoize api so consumers don't re-render unnecessarily
  const value = useMemo<ApiKeyContextContextValue>(() => {
    return {
      setApiKeyContext: (t: CreatedApiKeyResponse) => setToken(t),
      peekApiKeyContext: () => token,
      takeApiKeyContext: () => {
        const current = token
        if (current !== null) setToken(null)
        return current
      },
    }
    // we purposely include token in deps so peek/take reflect latest
  }, [token])

  return <ApiKeyContextContext.Provider value={value}>{children}</ApiKeyContextContext.Provider>
}

/**
 * Hook to consume the context.
 * Throws if used outside of provider to avoid silent errors.
 */
export function useApiKeyContext() {
  const ctx = useContext(ApiKeyContextContext)
  if (!ctx) {
    throw new Error("useApiKeyContext must be used within a ApiKeyContextProvider")
  }
  return ctx
}
