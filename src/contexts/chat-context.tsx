"use client"

import { createContext } from "react"

export const ChatContext = createContext<{
  selectedModel: string
  setSelectedModel: (model: string) => void
  isShared: boolean
  setIsShared: (isShared: boolean) => void
  shareableLink: string
  setShareableLink: (link: string) => void
  isSharedByOther: boolean
  setIsSharedByOther: (isSharedByOther: boolean) => void
}>({
  selectedModel: "default",
  setSelectedModel: () => {},
  isShared: false,
  setIsShared: () => {},
  shareableLink: "",
  setShareableLink: () => {},
  isSharedByOther: false,
  setIsSharedByOther: () => {},
})
