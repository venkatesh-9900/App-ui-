
"use client"

import { ChatNavbar } from "@/components/chat/chat-navbar"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getAgentsList } from "@/hooks/agent-service"
import { ChatContext } from "@/contexts"

interface Agent {
  name: string
  description?: string
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const [selectedModel, setSelectedModel] = useState("default")
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(true)
  const [isShared, setIsShared] = useState(false)
  const [shareableLink, setShareableLink] = useState("")
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    getAgentsList({
      successTask: (agentsList: string[]) => {
        console.log('Agents list:', agentsList)
        // Convert agent names to Agent objects
        const agentsData: Agent[] = agentsList.map((agent) => ({
          name: agent,
          description: '',
        }))
        setAgents(agentsData)
        
        // Set first agent as default
        if (agentsList.length > 0) {
          setSelectedModel(agentsList[0])
        }
      },
      failureTask: () => {
        console.error('Failed to load agents')
        setIsLoadingAgents(false)
      },
      errorTask: () => {
        console.error('Error loading agents')
        setIsLoadingAgents(false)
      },
    })
    setIsLoadingAgents(false)
  }, [])

  return (
    <ChatContext.Provider value={{ selectedModel, setSelectedModel, isShared, setIsShared, shareableLink, setShareableLink }}>
      <div className="flex flex-col h-screen">
        <ChatNavbar
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          chatId="chat-123"
          agents={agents}
          isLoadingAgents={isLoadingAgents}
          sessionId={sessionId}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </ChatContext.Provider>
  )
}
