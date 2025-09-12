import { Dispatch, SetStateAction } from "react";
import {
    createTeam,
    getAllTeams,
    getSingleTeam,
    updateTeam,
    deleteTeam,
    createAgent,
    getAllAgents,
    updateAgent,
    deleteAgent,
    createMcpUrl,
    getAllMcpUrls,
    updateMcpUrl,
    deleteMcpUrl, getSingleAgent, updateSystemInstruction, deleteSystemInstruction, createSystemInstruction,
} from "@/hooks/team-service";
import {
    Team,
    CreateTeamRequest,
    CreateAgentRequest,
    CreateMcpUrlRequest,
    Agent,
    McpUrl,
    UpdateTeamRequest,
    TeamDetails,
    GenericResponse,
    AgentDetails,
    McpUrlDetails,
    UpdateAgentRequest,
    SystemInstructionDetails,
    UpdateSystemInstruction,
    CreateSystemInstructionRequest
} from "@/types";
import {useToast} from "@/hooks/use-toast.ts";
type ToastFn = ReturnType<typeof useToast>['toast'];

interface HandleCreateTeamParams {
    newTeam: Omit<CreateTeamRequest, 'coordinator' | 'team_agents'> & {
        coordinator: string;
        team_agents: string[];
    };
    setTeams: (teams: Team[]) => void;
    setNewTeam: (newTeam: any) => void;
    setActiveTeamTab: (tab: string) => void;
    toast: (options: { title: string; description: string; variant?: "default" | "destructive"; }) => void;
}

export const handleCreateTeam = async ({
                                           newTeam,
                                           setTeams,
                                           setNewTeam,
                                           setActiveTeamTab,
                                           toast,
                                       }: HandleCreateTeamParams) => {
    if (!newTeam.team_name || !newTeam.team_description || !newTeam.coordinator) return;

    const payload: CreateTeamRequest = {
        team_name: newTeam.team_name,
        team_description: newTeam.team_description,
        coordinator: parseInt(newTeam.coordinator, 10),
        team_agents: newTeam.team_agents.map((id) => parseInt(id, 10)),
    };

    try {
        const response: GenericResponse = await createTeam(payload);
        if (response.status === 'Success') {
            setTeams(await getAllTeams());
            setNewTeam({
                team_name: '',
                team_description: '',
                coordinator: '',
                team_agents: [],
            });
            setActiveTeamTab('view');
            toast({
                title: 'Team Created',
                description: `Team "${newTeam.team_name}" has been created successfully.`,
            });
        } else {
            toast({
                title: 'Error',
                description: response.message || 'Failed to create team.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to create team.',
            variant: 'destructive',
        });
    }
};

interface UpdateTeamParams {
    selectedTeam: TeamDetails | null;
    setSelectedTeam: (team: TeamDetails | null) => void;
    toast: ToastFn;
}

interface DeleteTeamParams {
    teamId: number;
    setTeams: (teams: Team[]) => void;
    setSelectedTeam: (team: TeamDetails | null) => void;
    handleSelectTeam: (id: number) => Promise<void>;
    toast: ToastFn;
}

interface SelectTeamParams {
    teamId: number;
    setSelectedTeam: (team: TeamDetails | null) => void;
    toast: ToastFn;
}

export const handleUpdateTeam = async ({
                                           selectedTeam,
                                           setSelectedTeam,
                                           toast,
                                       }: UpdateTeamParams) => {
    if (!selectedTeam) return;

    const payload: UpdateTeamRequest = {
        team_name: selectedTeam.team_name,
        team_description: selectedTeam.team_description,
        coordinator: selectedTeam.coordinator,
        updated_team_agents: selectedTeam.agents_list.map((agent) => agent.agent_id),
    };

    try {
        await updateTeam(selectedTeam.team_id, payload);
        const refreshedTeam = await getSingleTeam(selectedTeam.team_id);
        setSelectedTeam(refreshedTeam);
        toast({
            title: "Team Updated",
            description: "Team information has been updated successfully.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update team.",
            variant: "destructive"
        });
    }
};

export const handleDeleteTeam = async ({
                                           teamId,
                                           setTeams,
                                           setSelectedTeam,
                                           handleSelectTeam,
                                           toast,
                                       }: DeleteTeamParams) => {
    try {
        await deleteTeam(teamId);
        const updatedTeams = await getAllTeams();
        setTeams(updatedTeams);

        if (updatedTeams.length > 0) {
            // After deleting, select the new first team in the list
            await handleSelectTeam(updatedTeams[0].team_id);
        } else {
            setSelectedTeam(null);
        }

        toast({
            title: "Team Deleted",
            description: "Team has been deleted successfully."
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete team.",
            variant: "destructive"
        });
    }
};

export const handleSelectTeam = async ({
                                           teamId,
                                           setSelectedTeam,
                                           toast,
                                       }: SelectTeamParams) => {
    try {
        const fullTeam = await getSingleTeam(teamId);
        if (fullTeam) {
            setSelectedTeam(fullTeam);
        } else {
            toast({
                title: "Error",
                description: "Failed to load team details.",
                variant: "destructive",
            });
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "Unexpected error while loading team.",
            variant: "destructive",
        });
    }
};

export const handleCreateAgent = async (
    // Parameters for this function
    newAgent: CreateAgentRequest,
    setAgents: Dispatch<SetStateAction<Agent[]>>,
    setNewAgent: Dispatch<SetStateAction<CreateAgentRequest>>,
    setActiveAgentTab: Dispatch<SetStateAction<string>>,
    toast: ToastFn
) => {
    if (!newAgent.agent_name || !newAgent.agent_description) return;

    // The payload is simply the newAgent state
    const payload: CreateAgentRequest = newAgent;

    try {
        await createAgent(payload);
        const updatedAgents = await getAllAgents();
        setAgents(updatedAgents);
        setNewAgent({
            agent_name: "",
            agent_description: "",
            llm_model: "",
            mcp_urls_list: [],
            system_instruction: { version: "", instruction: "" },
        });
        setActiveAgentTab("view");
        toast({
            title: "Agent Created",
            description: `Agent "${payload.agent_name}" has been created successfully.`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to create agent.",
            variant: "destructive",
        });
    }
};

export const handleUpdateAgent = async (
    selectedAgent: AgentDetails | null,
    setAgents: Dispatch<SetStateAction<Agent[]>>,
    toast: ToastFn
) => {
    if (!selectedAgent) return;

    const payload: UpdateAgentRequest = {
        agent_name: selectedAgent.agent_name,
        agent_description: selectedAgent.agent_description,
        llm_model: selectedAgent.llm_model,
        mcp_urls_list: selectedAgent.mcp_urls_list.map((m) => m.mcp_url_id),
        system_instruction: Number(selectedAgent.system_instruction),
    };

    try {
        await updateAgent(selectedAgent.agent_id, payload);
        setAgents(await getAllAgents());
        toast({
            title: "Agent Updated",
            description: `Agent "${selectedAgent.agent_name}" updated successfully.`,
        });
    } catch (error) {
        console.error("Update agent failed", error);
        toast({
            title: "Error",
            description: "Failed to update agent.",
            variant: "destructive",
        });
    }
};

export const handleDeleteAgent = async (
    agentId: number,
    setAgents: Dispatch<SetStateAction<Agent[]>>,
    setSelectedAgent: Dispatch<SetStateAction<AgentDetails | null>>,
    handleSelectAgent: (agentId: number) => Promise<void>,
    toast: ToastFn
) => {
    try {
        await deleteAgent(agentId);
        const updatedAgents = await getAllAgents();
        setAgents(updatedAgents);

        if (updatedAgents.length > 0) {
            await handleSelectAgent(updatedAgents[0].agent_id);
        } else {
            setSelectedAgent(null);
        }
        toast({ title: "Agent Deleted", description: "Agent has been deleted successfully." });
    } catch (error) {
        console.error("Failed to delete agent:", error);
        toast({ title: "Error", description: "Failed to delete agent.", variant: "destructive" });
    }
};

export const handleSelectAgent = async (
    agentId: number,
    setSelectedAgent: Dispatch<SetStateAction<AgentDetails | null>>,
    setSystemInstructions: Dispatch<SetStateAction<SystemInstructionDetails[]>>,
    setSelectedSystemInstruction: Dispatch<SetStateAction<SystemInstructionDetails | null>>
) => {
    try {
        const agentDetail = await getSingleAgent(agentId);
        if (agentDetail) {
            setSelectedAgent(agentDetail);

            const instructions = agentDetail.system_instructions_list || [];
            setSystemInstructions(instructions);

            if (instructions.length > 0) {
                setSelectedSystemInstruction(instructions[0]);
            } else {
                setSelectedSystemInstruction(null);
            }
        } else {
            setSelectedAgent(null);
            setSystemInstructions([]);
            setSelectedSystemInstruction(null);
        }
    } catch (error) {
        console.error("Failed to load agent:", error);
        setSelectedAgent(null);
        setSystemInstructions([]);
    }
};

// --- Synchronous utility functions ---

export const handleAddAgent = (
    setSelectedTeam: Dispatch<SetStateAction<TeamDetails | null>>,
    teamId: number,
    agent: { agent_id: number; agent_name: string }
) => {
    setSelectedTeam((prev) => {
        if (!prev || prev.team_id !== teamId) return prev;

        const alreadyExists = prev.agents_list.some(
            (a) => a.agent_id === agent.agent_id
        );
        if (alreadyExists) return prev;

        const newAgent: AgentDetails = {
            agent_id: agent.agent_id,
            agent_name: agent.agent_name,
            llm_model: '',
            agent_description: '',
            system_instruction: 0,
            system_instructions_list: [],
            mcp_urls_list: [],
        };

        return {
            ...prev,
            agents_list: [...prev.agents_list, newAgent],
        };
    });
};

export const handleRemoveAgent = (
    setSelectedTeam: Dispatch<SetStateAction<TeamDetails | null>>,
    teamId: number,
    agent: { agent_id: number; agent_name: string }
) => {
    setSelectedTeam((prev) => {
        if (!prev || prev.team_id !== teamId) return prev;
        return { ...prev, agents_list: prev.agents_list.filter((a) => a.agent_id !== agent.agent_id) };
    });
};
export const toggleAgentInTeam = (
    value: string,
    selectedTeam: TeamDetails | null,
    agents: Agent[],
    setSelectedTeam: Dispatch<SetStateAction<TeamDetails | null>>
) => {
    // Guard clauses
    if (!value || !selectedTeam) return;

    const selectedAgent = agents.find((a) => a.agent_name === value);
    if (!selectedAgent) return;

    // Check if the agent is already in the team
    const isAlreadySelected = selectedTeam.agents_list.some(
        (a) => a.agent_id === selectedAgent.agent_id
    );

    const agentDetail = {
        agent_id: selectedAgent.agent_id,
        agent_name: selectedAgent.agent_name,
    };

    // Call the appropriate handler function
    if (isAlreadySelected) {
        handleRemoveAgent(setSelectedTeam, selectedTeam.team_id, agentDetail);
    } else {
        handleAddAgent(setSelectedTeam, selectedTeam.team_id, agentDetail);
    }
};

export const handleAddAgentToNewTeam = (
    setNewTeam: Dispatch<SetStateAction<Omit<CreateTeamRequest, 'coordinator' | 'team_agents'> & { coordinator: string; team_agents: string[]; }>>,
    agentId: string
) => {
    setNewTeam((prev) => {
        if (prev.team_agents.includes(agentId)) return prev;
        return { ...prev, team_agents: [...prev.team_agents, agentId] };
    });
};

export const handleRemoveAgentFromNewTeam = (
    setNewTeam: Dispatch<SetStateAction<Omit<CreateTeamRequest, 'coordinator' | 'team_agents'> & { coordinator: string; team_agents: string[]; }>>,
    agentId: string
) => {
    setNewTeam((prev) => ({
        ...prev,
        team_agents: prev.team_agents.filter((id) => id !== agentId),
    }));
};

export const getSelectedAgents = (
    agents: Agent[],
    newTeam: Omit<CreateTeamRequest, 'coordinator' | 'team_agents'> & { coordinator: string; team_agents: string[]; }
) => {
    return agents.filter((agent) => newTeam.team_agents.includes(agent.agent_id.toString()));
};

export const isAgentSelected = (agentList: AgentDetails[], targetAgent: Agent): boolean => {
    return agentList.some((a) => a.agent_id === targetAgent.agent_id);
};

export const handleCreateMcpUrl = async (
    newMcpUrl: CreateMcpUrlRequest,
    setMcpUrls: Dispatch<SetStateAction<McpUrl[]>>,
    setNewMcpUrl: Dispatch<SetStateAction<CreateMcpUrlRequest>>,
    setActiveMcpTab: Dispatch<SetStateAction<string>>,
    toast: ToastFn
) => {
    if (!newMcpUrl.url_link || !newMcpUrl.mcp_url_description) return;

    try {
        await createMcpUrl(newMcpUrl);
        setMcpUrls(await getAllMcpUrls());
        setNewMcpUrl({
            url_link: "",
            mcp_protocol: "streamable-http",
            mcp_url_description: "",
        });
        setActiveMcpTab("view");
        toast({
            title: "MCP URL Created",
            description: `MCP URL has been created successfully.`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to create MCP URL.",
            variant: "destructive",
        });
    }
};

export const handleUpdateMcpUrl = async (
    selectedMcpUrl: McpUrlDetails | null,
    toast: ToastFn
) => {
    if (!selectedMcpUrl) return;

    const payload = {
        url_link: selectedMcpUrl.url_link,
        mcp_url_description: selectedMcpUrl.mcp_url_description,
        mcp_protocol: selectedMcpUrl.mcp_protocol || null,
    };

    try {
        const response = await updateMcpUrl(selectedMcpUrl.mcp_url_id, payload);

        if (response.status === "Success") {
            toast({
                title: "Success",
                description: "MCP URL updated successfully",
            });
        } else {
            toast({
                title: "Error",
                description: response.message || "Failed to update MCP URL",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Update MCP failed:", error);
        toast({
            title: "Server Error",
            description: "Server error while updating MCP URL",
            variant: "destructive",
        });
    }
};

export const handleDeleteMcpUrl = (
    id: number,
    setMcpUrls: Dispatch<SetStateAction<McpUrl[]>>,
    toast: ToastFn
) => {
    setMcpUrls((prevMcpUrls) => prevMcpUrls.filter((m) => m.mcp_url_id !== id));
    toast({
        title: "MCP URL Deleted",
        description: "MCP URL has been deleted successfully.",
    });
};

export const handleUpdateSystemInstruction = async (
    selectedAgent: AgentDetails | null,
    selectedInstruction: SystemInstructionDetails | null,
    toast: ToastFn,
    setSystemInstructions: Dispatch<SetStateAction<SystemInstructionDetails[]>>,
    setSelectedSystemInstruction: Dispatch<SetStateAction<SystemInstructionDetails | null>>
) => {
    if (!selectedAgent || !selectedInstruction) return;

    const payload: UpdateSystemInstruction = {
        agent_id: selectedAgent.agent_id,
        version: selectedInstruction.version,
        instruction: selectedInstruction.instruction,
    };

    try {
        await updateSystemInstruction(selectedInstruction.system_instruction_id, payload);

        // Refresh the instruction list
        const updatedAgent = await getSingleAgent(selectedAgent.agent_id);
        const updatedInstructions = updatedAgent?.system_instructions_list ?? [];

        setSystemInstructions(updatedInstructions);
        const updatedSelected = updatedInstructions.find(
            (inst) => inst.system_instruction_id === selectedInstruction.system_instruction_id
        );
        setSelectedSystemInstruction(updatedSelected ?? null);
        toast({
            title: "Instruction Updated",
            description: `Instruction v${selectedInstruction.version} updated successfully.`,
        });
    } catch (error) {
        console.error("Update instruction failed", error);
        setSelectedSystemInstruction(null);
        toast({
            title: "Error",
            description: "Failed to update system instruction.",
            variant: "destructive",
        });
    }
};
export const handleDeleteSystemInstruction = async (
    id: number,
    agentId: number,
    toast: ToastFn,
    setSystemInstructions: Dispatch<SetStateAction<SystemInstructionDetails[]>>,
    setSelectedSystemInstruction: Dispatch<SetStateAction<SystemInstructionDetails | null>>
) => {
    try {
        await deleteSystemInstruction(id);
        // Refresh instructions
        const updatedAgent = await getSingleAgent(agentId);
        const updatedInstructions = updatedAgent?.system_instructions_list ?? [];

        setSystemInstructions(updatedInstructions);
        setSelectedSystemInstruction(null);

        toast({
            title: "Instruction Deleted",
            description: `System instruction #${id} deleted successfully.`,
        });
    } catch (error) {
        console.error("Failed to delete system instruction:", error);
        toast({
            title: "Error",
            description: "Failed to delete system instruction.",
            variant: "destructive",
        });
    }
};

export const handleCreateSystemInstruction = async (
    selectedAgent: AgentDetails | null,
    newSystemInstruction: { version: string; instruction: string },
    toast: ToastFn,
    setSystemInstructions: Dispatch<SetStateAction<SystemInstructionDetails[]>>,
    setSelectedSystemInstruction: Dispatch<SetStateAction<SystemInstructionDetails | null>>,
    resetNewSystemInstruction: () => void
) => {
    if (!selectedAgent) {
        toast({
            title: "Error",
            description: "Please select an agent before creating instructions.",
            variant: "destructive",
        });
        return;
    }

    try {
        const payload: CreateSystemInstructionRequest = {
            agent_id: selectedAgent.agent_id, // ✅ required
            system_instruction: {
                version: newSystemInstruction.version,
                instruction: newSystemInstruction.instruction,
            },
            make_default: false,
        };

        await createSystemInstruction(payload);

        // Refresh list
        const updatedAgent = await getSingleAgent(selectedAgent.agent_id);
        const updatedList = updatedAgent?.system_instructions_list ?? [];

        setSystemInstructions(updatedList);
        setSelectedSystemInstruction(updatedList.at(-1) ?? null);

        resetNewSystemInstruction();

        toast({
            title: "Created",
            description: `Instruction v${newSystemInstruction.version} created successfully.`,
        });
    } catch (error) {
        console.error("Create system instruction failed", error);
        toast({
            title: "Error",
            description: "Failed to create system instruction.",
            variant: "destructive",
        });
    }
};