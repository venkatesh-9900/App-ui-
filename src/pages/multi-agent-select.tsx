import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
    agent_id: number
    agent_name: string
}

interface MultiAgentSelectProps {
    agents: Agent[]
    selectedAgentIds: number[]
    onChange: (ids: number[]) => void
}

export const MultiAgentSelect: React.FC<MultiAgentSelectProps> = ({
                                                                      agents,
                                                                      selectedAgentIds,
                                                                      onChange,
                                                                  }) => {
    const toggleAgent = (id: number) => {
        onChange(
            selectedAgentIds.includes(id)
                ? selectedAgentIds.filter((a) => a !== id)
                : [...selectedAgentIds, id]
        )
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="border rounded px-3 py-2 cursor-pointer text-sm text-muted-foreground bg-white">
                    {selectedAgentIds.length > 0
                        ? agents
                            .filter((a) => selectedAgentIds.includes(a.agent_id))
                            .map((a) => a.agent_name)
                            .join(", ")
                        : "Select agents"}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search agents..." />
                    <CommandList>
                        {agents.map((agent) => {
                            const selected = selectedAgentIds.includes(agent.agent_id)
                            return (
                                <CommandItem
                                    key={agent.agent_id}
                                    onSelect={() => toggleAgent(agent.agent_id)}
                                    className="cursor-pointer"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 h-4 w-4 rounded-sm border border-primary",
                                            selected && "bg-primary text-white"
                                        )}
                                    >
                                        {selected && <Check className="h-4 w-4" />}
                                    </div>
                                    {agent.agent_name}
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}