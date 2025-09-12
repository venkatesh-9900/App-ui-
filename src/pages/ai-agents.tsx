import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useToast} from "@/hooks/use-toast";
import {getAllAgents, getAllMcpUrls, getAllTeams, getSingleAgent,} from "@/hooks/team-service";

import {
  Agent,
  AgentDetails,
  CreateAgentRequest,
  CreateMcpUrlRequest,
  CreateTeamRequest,
  McpUrl,
  McpUrlDetails, SystemInstructionDetails,
  Team,
  TeamDetails
} from "@/types";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {
  getSelectedAgents,
  handleAddAgentToNewTeam,
  handleCreateAgent,
  handleCreateMcpUrl, handleCreateSystemInstruction,
  handleCreateTeam,
  handleDeleteAgent,
  handleDeleteMcpUrl, handleDeleteSystemInstruction,
  handleDeleteTeam,
  handleRemoveAgent,
  handleRemoveAgentFromNewTeam,
  handleSelectAgent,
  handleSelectTeam,
  handleUpdateAgent,
  handleUpdateMcpUrl, handleUpdateSystemInstruction,
  handleUpdateTeam,
  toggleAgentInTeam
} from "@/components/ai/ai-agent-handlers.ts";


export default function AIAgentsPage() {
  const { toast } = useToast();
  const [activeMainTab, setActiveMainTab] = useState("teams");
  const [activeTeamTab, setActiveTeamTab] = useState("view");
  const [activeAgentTab, setActiveAgentTab] = useState("view");
  const [activeMcpTab, setActiveMcpTab] = useState("view");
  const [activeSystemInstructionTab, setActiveSystemInstructionTab] = useState("manage");

  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [mcpUrls, setMcpUrls] = useState<McpUrl[]>([]);


  // State for selected items
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetails | null>(null);
  const [selectedMcpUrl, setSelectedMcpUrl] = useState<McpUrlDetails | null>(null);
  const [systemInstructions, setSystemInstructions] = useState<SystemInstructionDetails[]>([]);
  const [selectedSystemInstruction, setSelectedSystemInstruction] = useState<SystemInstructionDetails | null>(null);
  const [newSystemInstruction, setNewSystemInstruction] = useState({
    version: "",
    instruction: ""
  });


  const [newTeam, setNewTeam] = useState<
      Omit<CreateTeamRequest, 'coordinator' | 'team_agents'> & {
    coordinator: string;
    team_agents: string[];
  }
  >({
    team_name: "",
    team_description: "",
    coordinator: "",
    team_agents: [],
  });

  const [newAgent, setNewAgent] = useState<CreateAgentRequest>({
    agent_name: "",
    agent_description: "",
    llm_model: "",
    system_instruction: {
      version: "",
      instruction: "",
    },
    mcp_urls_list: [],
  });

  const [newMcpUrl, setNewMcpUrl] = useState<CreateMcpUrlRequest>({
    url_link: "",
    mcp_protocol: "streamable-http",
    mcp_url_description: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, agentsData, mcpUrlsData] = await Promise.all([
          getAllTeams(),
          getAllAgents(),
          getAllMcpUrls(),
        ]);
        setTeams(teamsData);
        setAgents(agentsData);
        setMcpUrls(mcpUrlsData);
        if (teamsData.length > 0) {
          await selectTeamHandler(teamsData[0].team_id);
        } else {
          setSelectedTeam(null);
        }
        if (agentsData.length > 0) {
          const firstAgent = agentsData[0];
          const agentDetail = await getSingleAgent(firstAgent.agent_id);
          setSelectedAgent(agentDetail)
          if (agentDetail?.system_instructions_list?.length && agentDetail.system_instructions_list[0]) {
            setSystemInstructions(agentDetail.system_instructions_list);
            setSelectedSystemInstruction(agentDetail.system_instructions_list[0]);
          } else {
            setSystemInstructions([]);
            setSelectedSystemInstruction(null);
          }
        } else {
          setSelectedAgent(null);
          setSystemInstructions([]);
          setSelectedSystemInstruction(null);
        }
        if (mcpUrlsData.length > 0) {
          setSelectedMcpUrl(mcpUrlsData[0]);
        } else {
          setSelectedMcpUrl(null);
        }

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data from the server.",
          variant: "destructive"
        });
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [toast]);

  const createTeamHandler = async  () => {
    await handleCreateTeam({
      newTeam,
      setTeams,
      setNewTeam,
      setActiveTeamTab,
      toast,
    });
  };
  const selectTeamHandler = async (teamId: number) => {
    await handleSelectTeam({ teamId, setSelectedTeam, toast });
  };

  const updateTeamHandler = async () => {
    await handleUpdateTeam({ selectedTeam, setSelectedTeam, toast });
  };

  const deleteTeamHandler = async (teamId: number) => {
    await handleDeleteTeam({
      teamId,
      setTeams,
      setSelectedTeam,
      handleSelectTeam: selectTeamHandler, // Pass the handler
      toast,
    });
  };

  const updateSelectedAgentSystemInstruction = (instructionId: number) => {
    setSelectedAgent((prev): AgentDetails | null => {
      if (!prev) return null;
      return {
        ...prev,
        system_instruction: instructionId,
      };
    });
  };
  const createMcpUrlHandler = async () => {
    await handleCreateMcpUrl(newMcpUrl, setMcpUrls, setNewMcpUrl, setActiveMcpTab, toast);
  };

  const updateMcpUrlHandler = async () => {
    await handleUpdateMcpUrl(selectedMcpUrl, toast);
  };

  const deleteMcpUrlHandler = (id: number) => {
    handleDeleteMcpUrl(id, setMcpUrls, toast);
  };

  return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Agents Management</h1>
          <p className="text-slate-600">
            Manage your team of AI agents, configure their capabilities, and monitor MCP URLs
          </p>
        </div>

        {/* Main Navigation Buttons */}
        <div className="flex space-x-1 mb-6 border-b border-slate-200">
          <button
              onClick={() => setActiveMainTab("teams")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeMainTab === "teams"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            Manage Teams
          </button>
          <button
              onClick={() => setActiveMainTab("agents")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeMainTab === "agents"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            Manage Agents
          </button>
          <button
              onClick={() => setActiveMainTab("mcp")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeMainTab === "mcp"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            Manage MCP URLs
          </button>
        </div>

        {/* Manage Teams Content */}
        {activeMainTab === "teams" && (
            <div className="space-y-6">
              {/* Team Sub-navigation Buttons */}
              <div className="flex space-x-1 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTeamTab("view")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTeamTab === "view"
                            ? "border-orange-500 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  View Teams
                </button>
                <button
                    onClick={() => setActiveTeamTab("create")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTeamTab === "create"
                            ? "border-orange-500 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  Create New Team
                </button>
              </div>

              {/* View Teams */}
              {activeTeamTab === "view" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Teams List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>All Teams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-[60px_1fr_2fr] gap-4 text-sm font-semibold text-slate-700 px-3">
                            <div>ID</div>
                            <div>Team Name</div>
                            <div>Description</div>
                          </div>
                          {teams.map((team) => (
                              <div
                                  key={team.team_id}
                                  className={`grid grid-cols-[60px_1fr_2fr] gap-4 items-center text-sm p-3 rounded-lg cursor-pointer hover:bg-slate-50 ${
                                      selectedTeam?.team_id === team.team_id
                                          ? "bg-blue-50 border border-blue-200"
                                          : ""
                                  }`}
                                  onClick={() =>  selectTeamHandler(team.team_id)}
                              >
                                {/* Column 1: ID */}
                                <div className="w-12">{team.team_id}</div>

                                {/* Column 2: Team Name */}
                                <div className="font-medium">{team.team_name}</div>

                                {/* Column 3: Description with Tooltip */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-slate-600 truncate">
                                        {team.team_description}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{team.team_description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected Team Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Selected Team</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600">ID</Label>
                          <div className="text-sm mt-1">{selectedTeam?.team_id}</div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-600">Team Name</Label>
                          <Input
                              value={selectedTeam?.team_name}
                              placeholder="Enter team name"
                              className="mt-1"
                              onChange={(e) => {
                                if (selectedTeam) {
                                  // If it's not null, update the state
                                  setSelectedTeam({
                                    ...selectedTeam, // Spread the existing, valid team object
                                    team_name: e.target.value, // Overwrite just the property that changed
                                  });
                                }
                              }}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-600">Description</Label>
                          <Textarea
                              value={selectedTeam?.team_description}
                              placeholder="Enter description"
                              className="mt-1"
                              onChange={(e) => {
                                if (selectedTeam) {
                                  // If it's not null, update the state
                                  setSelectedTeam({
                                    ...selectedTeam, // Spread the existing, valid team object
                                    team_description: e.target.value, // Overwrite just the property that changed
                                  });
                                }
                              }}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-600">Coordinator</Label>
                          <Select
                              value={selectedTeam?.coordinator?.toString() ?? ""}
                              onValueChange={(value) => {
                                if (selectedTeam) {
                                  setSelectedTeam({
                                    ...selectedTeam,
                                    coordinator: parseInt(value),
                                  });
                                }
                              }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select coordinator" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map((agent) => (
                                  <SelectItem key={agent.agent_id} value={agent.agent_id.toString()}>
                                    {agent.agent_name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Other Agents</Label>
                          <div className="mt-1 space-y-2">
                            {/* Selected Agents */}
                            {selectedTeam?.agents_list && selectedTeam.agents_list.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {selectedTeam.agents_list.map((agent) => {
                                    const fullAgent = agents.find(a => a.agent_id === agent.agent_id);
                                    return (
                                        <div
                                            key={agent.agent_id}
                                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                        >
                                          <span>{agent.agent_name}</span>
                                          <button
                                              type="button"
                                              onClick={() => {
                                                if (fullAgent) {
                                                  handleRemoveAgent(setSelectedTeam, selectedTeam.team_id, {
                                                    agent_id: fullAgent.agent_id,
                                                    agent_name: fullAgent.agent_name,
                                                  });
                                                }
                                              }}
                                              className="text-blue-600 hover:text-blue-800 ml-1"
                                          >
                                            ×
                                          </button>
                                        </div>
                                    );
                                  })}
                                </div>
                            )}

                            {/* Add/Remove Agent Dropdown */}
                            <Select
                                onValueChange={(value) => {
                                  toggleAgentInTeam(value, selectedTeam, agents, setSelectedTeam);
                                }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select/deselect agents" />
                              </SelectTrigger>
                              <SelectContent>
                                {agents.map((agent) => {
                                  const isSelected = selectedTeam?.agents_list.some(
                                      (a) => a.agent_id === agent.agent_id
                                  );
                                  return (
                                      <SelectItem
                                          key={agent.agent_id}
                                          value={agent.agent_name}
                                          className={isSelected ? "bg-blue-50 text-blue-800" : ""}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span>{agent.agent_name}</span>
                                          {isSelected && (
                                              <span className="text-blue-600 text-xs ml-2">✓ Selected</span>
                                          )}
                                        </div>
                                      </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-4">
                          <Button
                              className="flex-1"
                              disabled={!selectedTeam}
                              onClick={updateTeamHandler}
                          >
                            Update Team
                          </Button>
                          <Button
                              variant="destructive"
                              className="flex-1"
                              disabled={!selectedTeam}
                              onClick={ async () => {
                                if (selectedTeam) {
                                  await deleteTeamHandler(selectedTeam.team_id);
                                }
                              }}
                          >
                            Delete Team
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
              )}

              {/* Create New Team */}
              {activeTeamTab === "create" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Team Name</Label>
                        <Input
                            value={newTeam.team_name}
                            placeholder="Enter team name"
                            onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                            value={newTeam.team_description}
                            placeholder="Enter description"
                            onChange={(e) => setNewTeam({...newTeam, team_description: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Coordinator</Label>
                        <Select
                            value={newTeam.coordinator}
                            onValueChange={(value) =>
                                setNewTeam({ ...newTeam, coordinator: value })
                            }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select coordinator" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((agent) => (
                                <SelectItem key={agent.agent_id} value={agent.agent_id.toString()}>
                                  {agent.agent_name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Other Agents</Label>
                        <div className="mt-1 space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {getSelectedAgents(agents, newTeam).map((agent) => (
                                  <div
                                      key={agent.agent_id}
                                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                  >
                                    <span>{agent.agent_name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAgentFromNewTeam(setNewTeam, agent.agent_id.toString())}
                                        className="text-blue-600 hover:text-blue-800 ml-1"
                                    >
                                      ×
                                    </button>
                                  </div>
                              ))}
                            </div>
                            <Select
                                onValueChange={(value) => {
                                  const isSelected = newTeam.team_agents.includes(value);
                                  if (isSelected) {
                                    handleRemoveAgentFromNewTeam(setNewTeam, value);
                                  } else {
                                    handleAddAgentToNewTeam(setNewTeam, value);
                                  }
                                }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select/deselect agents" />
                              </SelectTrigger>
                              <SelectContent>
                                {agents.map((agent) => {
                                  const isSelected = newTeam.team_agents.includes(agent.agent_id.toString());
                                  return (
                                      <SelectItem
                                          key={agent.agent_id}
                                          value={agent.agent_id.toString()}
                                          className={isSelected ? "bg-blue-50 text-blue-800" : ""}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span>{agent.agent_name}</span>
                                          {isSelected && (
                                              <span className="text-blue-600 text-xs ml-2">✓ Selected</span>
                                          )}
                                        </div>
                                      </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                        </div>
                      </div>
                      <Button onClick={createTeamHandler} className="w-full">
                        Create Team
                      </Button>
                    </CardContent>
                  </Card>
              )}
            </div>
        )}

        {/* Manage Agents Content */}
        {activeMainTab === "agents" && (
            <div className="space-y-6">
              {/* Agent Sub-navigation Buttons */}
              <div className="flex space-x-1 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveAgentTab("view")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeAgentTab === "view"
                            ? "border-orange-500 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  View Agents
                </button>
                <button
                    onClick={() => setActiveAgentTab("create")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeAgentTab === "create"
                            ? "border-orange-500 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  Create New Agent
                </button>
              </div>

              {/* View Agents */}
              {activeAgentTab === "view" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Agents List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>All Agents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Change 'items-center' to 'items-start' for top alignment */}
                          <div className="grid grid-cols-[auto,1fr,2fr] gap-4 items-start text-sm font-medium text-slate-600 pb-2 border-b">
                            <div>ID</div>
                            <div>Agent Name</div>
                            <div>Description</div>
                          </div>
                          {agents.map((agent) => (
                              <div
                                  key={agent.agent_id}
                                  // Change 'items-center' to 'items-start' here as well
                                  className={`grid grid-cols-[auto,1fr,2fr] gap-4 items-start text-sm p-3 rounded-lg cursor-pointer hover:bg-slate-50 ${
                                      selectedAgent?.agent_id === agent.agent_id
                                          ? "bg-blue-50 border border-blue-200"
                                          : ""
                                  }`}
                                  onClick={() => handleSelectAgent(agent.agent_id, setSelectedAgent, setSystemInstructions, setSelectedSystemInstruction)}
                              >
                                <div>{agent.agent_id}</div>
                                <div className="font-medium">{agent.agent_name}</div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-slate-600 truncate">
                                        {agent.agent_description}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{agent.agent_description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected Agent Details */}
                    {selectedAgent && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Selected Agent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-600">ID</Label>
                            <div className="text-sm mt-1">{selectedAgent.agent_id}</div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">Agent Name</Label>
                            <Input
                                value={selectedAgent.agent_name}
                                placeholder="Enter agent name"
                                className="mt-1"
                                onChange={(e) => setSelectedAgent({...selectedAgent, agent_name: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">Description</Label>
                            <Textarea
                                value={selectedAgent.agent_description}
                                placeholder="Enter description"
                                className="mt-1"
                                onChange={(e) => setSelectedAgent({...selectedAgent, agent_description: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">LLM Model</Label>
                            <Input
                                value={selectedAgent.llm_model}
                                placeholder="E.g., gemini-2.5-pro-preview-05-06"
                                className="mt-1"
                                onChange={(e) => setSelectedAgent({...selectedAgent, llm_model: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">MCP URL</Label>
                            <Select
                                value={selectedAgent.mcp_urls_list?.[0]?.url_link || ""}
                                onValueChange={(value) => {
                                  const newUrl = mcpUrls.find((mcp) => mcp.url_link === value);
                                  if (!newUrl) return;
                                  setSelectedAgent({
                                    ...selectedAgent,
                                    mcp_urls_list: [newUrl],
                                  });
                                }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select MCP URL" />
                              </SelectTrigger>
                              <SelectContent>
                                {mcpUrls.map((mcp) => (
                                    <SelectItem key={mcp.mcp_url_id} value={mcp.url_link}>
                                      <span className="font-semibold text-sm">{mcp.mcp_url_description}</span>
                                      <span className="text-muted-foreground text-xs truncate">{mcp.url_link}</span>
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">System Instruction</Label>
                            <Select onValueChange={(value) => updateSelectedAgentSystemInstruction(parseInt(value, 10))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select system instruction version" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedAgent?.system_instructions_list.map((instruction) => (
                                    <SelectItem key={instruction.system_instruction_id} value={String(instruction.system_instruction_id)}>
                                      <span className="font-semibold text-sm">{instruction.version}</span>
                                      <span className="text-muted-foreground text-xs truncate">{instruction.instruction}</span>
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button
                                className="flex-1"
                                disabled={!selectedAgent}
                                onClick={() => handleUpdateAgent(selectedAgent, setAgents, toast)}
                            >
                              Update Agent
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={ async () => {
                                  if (selectedAgent) {
                                    await handleDeleteAgent(
                                        selectedAgent.agent_id,
                                        setAgents,
                                        setSelectedAgent,
                                        (agentId) => handleSelectAgent(agentId, setSelectedAgent, setSystemInstructions, setSelectedSystemInstruction),
                                        toast
                                    );
                                  }
                                }}
                            >
                              Delete Agent
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    </div>
              )}
              {/* System Instructions Management */}
              {activeAgentTab === "view" && selectedAgent && (
                  <div className="mt-8">
                    {/* System Instructions Sub-navigation Buttons */}
                    <div className="flex space-x-1 mb-6 border-b border-slate-200">
                      <button
                          onClick={() => setActiveSystemInstructionTab("manage")}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              activeSystemInstructionTab === "manage"
                                  ? "border-orange-500 text-orange-600 bg-orange-50"
                                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                          }`}
                      >
                        Manage System Instructions
                      </button>
                      <button
                          onClick={() => setActiveSystemInstructionTab("create")}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              activeSystemInstructionTab === "create"
                                  ? "border-orange-500 text-orange-600 bg-orange-50"
                                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                          }`}
                      >
                        Create New System Instruction
                      </button>
                    </div>

                    {/* Manage System Instructions */}
                    {activeSystemInstructionTab === "manage" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* System Instructions List */}
                          <Card>
                            <CardHeader>
                              <CardTitle>All system instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-slate-600 pb-2 border-b">
                                  <div>ID</div>
                                  <div>Version</div>
                                  <div>System Instruction</div>
                                </div>
                                {systemInstructions.map((instruction) => (
                                    <div
                                        key={instruction.system_instruction_id}
                                        className={`grid grid-cols-3 gap-4 text-sm p-3 rounded-lg cursor-pointer hover:bg-slate-50 ${
                                            selectedSystemInstruction?.system_instruction_id === instruction.system_instruction_id
                                                ? 'bg-blue-50 border border-blue-200'
                                                : ''
                                        }`}
                                        onClick={() => setSelectedSystemInstruction(instruction)}
                                    >
                                      <div>{instruction.system_instruction_id}</div>
                                      <div className="font-medium">{instruction.version}</div>
                                      <div className="text-slate-600 truncate">{instruction.instruction.substring(0, 50)}...</div>
                                    </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Selected System Instruction Details */}
                      {selectedSystemInstruction && (
                          <Card>
                            <CardHeader>
                              <CardTitle>System instruction selected from table:</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-slate-600">ID</Label>
                                <div className="text-sm mt-1">{selectedSystemInstruction.system_instruction_id}</div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-slate-600">Version</Label>
                                <Input
                                    value={selectedSystemInstruction.version}
                                    placeholder="E.g., v1"
                                    className="mt-1"
                                    onChange={(e) => setSelectedSystemInstruction({...selectedSystemInstruction, version: e.target.value})}
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-slate-600">System Instruction</Label>
                                <Textarea
                                    value={selectedSystemInstruction.instruction}
                                    placeholder="Add system instruction here"
                                    className="mt-1 h-32"
                                    onChange={(e) => setSelectedSystemInstruction({...selectedSystemInstruction, instruction: e.target.value})}
                                />
                              </div>

                              <div className="flex space-x-2 pt-4">
                                <Button
                                    className="flex-1"
                                    onClick={() =>
                                        handleUpdateSystemInstruction(
                                            selectedAgent,
                                            selectedSystemInstruction,
                                            toast,
                                            setSystemInstructions,
                                            setSelectedSystemInstruction
                                        )
                                    }
                                >
                                  Update System Instruction
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={!selectedSystemInstruction}
                                    onClick={() =>
                                        handleDeleteSystemInstruction(
                                            selectedSystemInstruction.system_instruction_id,
                                            selectedAgent.agent_id,
                                            toast,
                                            setSystemInstructions,
                                            setSelectedSystemInstruction
                                        )
                                    }
                                >
                                  Delete System Instruction
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Create New System Instruction */}
                    {activeSystemInstructionTab === "create" && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Create New System Instruction</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Version</Label>
                              <Input
                                  value={newSystemInstruction.version}
                                  placeholder="E.g., v1"
                                  onChange={(e) => setNewSystemInstruction({...newSystemInstruction, version: e.target.value})}
                              />
                            </div>

                            <div>
                              <Label>System Instruction</Label>
                              <Textarea
                                  value={newSystemInstruction.instruction}
                                  placeholder="Add system instruction here"
                                  className="h-32"
                                  onChange={(e) => setNewSystemInstruction({...newSystemInstruction, instruction: e.target.value})}
                              />
                            </div>

                            <Button
                                className="w-full"
                                onClick={() =>
                                    handleCreateSystemInstruction(
                                        selectedAgent,
                                        newSystemInstruction,
                                        toast,
                                        setSystemInstructions,
                                        setSelectedSystemInstruction,
                                        () => setNewSystemInstruction({ version: "", instruction: "" })
                                    )
                                }
                            >
                              Create System Instruction
                            </Button>
                          </CardContent>
                        </Card>
                    )}
                  </div>
              )}

              {/* Create New Agent */}
              {activeAgentTab === "create" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Agent Name</Label>
                        <Input
                            value={newAgent.agent_name}
                            placeholder="Enter agent name"
                            onChange={(e) => setNewAgent({...newAgent, agent_name: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                            value={newAgent.agent_description}
                            placeholder="Enter description"
                            onChange={(e) => setNewAgent({...newAgent, agent_description: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>LLM Model</Label>
                        <Input
                            value={newAgent.llm_model}
                            placeholder="E.g., gemini-2.5-pro-preview-05-06"
                            onChange={(e) => setNewAgent({...newAgent, llm_model: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>MCP URL</Label>
                        <Select
                            value={String(newAgent.mcp_urls_list[0] ?? "")}
                            onValueChange={(value) => {
                              setNewAgent({
                                ...newAgent,
                                mcp_urls_list: [parseInt(value, 10)],
                              });
                            }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select MCP URL" />
                          </SelectTrigger>
                          <SelectContent>
                            {mcpUrls.map((mcp) => (
                                <SelectItem
                                    key={mcp.mcp_url_id}
                                    value={mcp.mcp_url_id.toString()}
                                >
                                  {mcp.mcp_url_description}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Add system instruction</Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm">Version</Label>
                            <Input
                                value={newAgent.system_instruction.version}
                                placeholder="E.g., 2025-07-04.v1"
                                onChange={(e) =>
                                    setNewAgent({
                                      ...newAgent,
                                      system_instruction: {
                                        ...newAgent.system_instruction,
                                        version: e.target.value,
                                      },
                                    })
                                }
                            />
                          </div>
                          <div>
                            <Label className="text-sm">System Instruction</Label>
                            <Textarea
                                value={newAgent.system_instruction.instruction}
                                placeholder="Add system instruction here"
                                className="h-32"
                                onChange={(e) =>
                                    setNewAgent({
                                      ...newAgent,
                                      system_instruction: {
                                        ...newAgent.system_instruction,
                                        instruction: e.target.value,
                                      },
                                    })
                                }
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                          onClick={() =>
                            handleCreateAgent(
                                newAgent,
                                setAgents,
                                setNewAgent,
                                setActiveAgentTab,
                                toast
                            )
                        }
                        className="w-full">
                        Create Agent
                      </Button>
                    </CardContent>
                  </Card>
              )}
            </div>
        )}

        {/* Manage MCP URLs Content */}
        {activeMainTab === "mcp" && (
            <div className="space-y-6">
              {/* MCP Sub-navigation Buttons */}
              <div className="flex space-x-1 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveMcpTab("view")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeMcpTab === "view"
                            ? "border-orange-500 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  View MCP URLs
                </button>
                <button
                    onClick={() => setActiveMcpTab("create")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeMcpTab === "create"
                            ? "border-orange-500 text-orange-600 bg-orange-50"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  Create new MCP URL
                </button>
              </div>

              {/* View MCP URLs */}
              {activeMcpTab === "view" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* MCP URLs List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>All MCP URLs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* 1. Use custom grid columns and top-alignment */}
                          <div className="grid grid-cols-[auto,2fr,1fr,2fr] gap-4 items-start text-sm font-medium text-slate-600 pb-2 border-b">
                            <div>ID</div>
                            <div>MCP URL</div>
                            <div>MCP Protocol</div>
                            <div>Description</div>
                          </div>
                          {mcpUrls.map((mcp) => (
                              <div
                                  key={mcp.mcp_url_id}
                                  // Use the same custom grid columns and top-alignment here
                                  className={`grid grid-cols-[auto,2fr,1fr,2fr] gap-4 items-start text-sm p-3 rounded-lg cursor-pointer hover:bg-slate-50 ${
                                      selectedMcpUrl?.mcp_url_id === mcp.mcp_url_id
                                          ? "bg-blue-50 border border-blue-200"
                                          : ""
                                  }`}
                                  onClick={() => setSelectedMcpUrl(mcp)}
                              >
                                {/* Column 1: ID */}
                                <div>{mcp.mcp_url_id}</div>

                                {/* Column 2: MCP URL with Tooltip */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="font-medium truncate">{mcp.url_link}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{mcp.url_link}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {/* 2. Corrected to show the protocol */}
                                <div>{mcp.mcp_protocol}</div>

                                {/* Column 4: Description with Tooltip */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-slate-600 truncate">
                                        {mcp.mcp_url_description}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{mcp.mcp_url_description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected MCP URL Details */}
                    {selectedMcpUrl && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Selected MCP URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-600">ID</Label>
                            <div className="text-sm mt-1">{selectedMcpUrl.mcp_url_id}</div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">MCP URL</Label>
                            <Input
                                value={selectedMcpUrl.url_link}
                                placeholder="https://example.com"
                                className="mt-1"
                                onChange={(e) => {
                                  if (selectedMcpUrl) {
                                    setSelectedMcpUrl({...selectedMcpUrl, url_link: e.target.value});
                                  }
                                }}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">MCP Protocol</Label>
                            <Select
                                value={selectedMcpUrl.mcp_protocol}
                                onValueChange={(value) => {
                                  if (selectedMcpUrl) {
                                    setSelectedMcpUrl({...selectedMcpUrl, mcp_protocol: value});
                                  }
                                }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sse">sse</SelectItem>
                                <SelectItem value="streamable-http">streamable-http</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">Description</Label>
                            <Textarea
                                value={selectedMcpUrl.mcp_url_description}
                                placeholder="Enter description for URL"
                                className="mt-1"
                                onChange={(e) => {
                                  if (selectedMcpUrl) {
                                    setSelectedMcpUrl({...selectedMcpUrl, mcp_url_description: e.target.value});
                                  }
                                }}
                            />
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button
                                className="flex-1"
                                onClick={updateMcpUrlHandler}
                                disabled={!selectedMcpUrl}
                            >
                              Update MCP URL
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => deleteMcpUrlHandler(selectedMcpUrl.mcp_url_id)}
                            >
                              Delete MCP URL
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    </div>
              )}

              {/* Create New MCP URL */}
              {activeMcpTab === "create" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New MCP URL</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>MCP URL</Label>
                        <Input
                            value={newMcpUrl.url_link}
                            placeholder="https://example.com"
                            onChange={(e) =>
                                setNewMcpUrl({ ...newMcpUrl, url_link: e.target.value })
                            }
                        />
                      </div>

                      <div>
                        <Label>MCP Protocol</Label>
                        <Select
                            value={newMcpUrl.mcp_protocol}
                            onValueChange={(value) =>
                                setNewMcpUrl({ ...newMcpUrl, mcp_protocol: value as "sse" | "streamable-http" })
                            }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sse">sse</SelectItem>
                            <SelectItem value="streamable-http">streamable-http</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                            value={newMcpUrl.mcp_url_description}
                            placeholder="Enter description for URL"
                            onChange={(e) =>
                                setNewMcpUrl({ ...newMcpUrl, mcp_url_description: e.target.value })
                            }
                        />
                      </div>

                      <Button onClick={createMcpUrlHandler} className="w-full">
                        Create MCP URL
                      </Button>
                    </CardContent>
                  </Card>
              )}
            </div>
        )}
      </div>
  );
}