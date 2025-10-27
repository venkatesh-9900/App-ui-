import axiosAuthServices, {buildHeader} from "@/utils/axios/auth-axios";
import apiClient from "@/utils/axios/api-client";
import {ENDPOINTS} from "@/config/config";
import {
    Team,
    TeamConfiguratorProps,
    TeamSelectionResponse,
    TeamConfigRequest,
    CreateTeamRequest,
    CreateAgentRequest,
    CreateSystemInstructionRequest,
    CreateMcpUrlRequest,
    CreateBulkMcpUrlsRequest,
    DeleteBulkMcpUrlsRequest,
    Agent,
    AgentsListDetails,
    AgentDetails,
    McpUrlDetails,
    SystemInstructionDetails,
    TeamDetails, GenericResponse, UpdateTeamRequest, UpdateAgentRequest, UpdateMcpUrlRequest, UpdateSystemInstruction,
} from "@/types";

type ApiResponse<T> = {
    status: string;
    message: string | null;
    data: T;
};

const API_ENDPOINTS = ENDPOINTS.TEAM_MGR;
// ============================
// Team Configuration APIs
// ============================

export const fetchAllTeams = async (): Promise<TeamConfiguratorProps> => {
    try {
        const response = await axiosAuthServices.get<TeamSelectionResponse>(
            API_ENDPOINTS.TEAM.CONFIGURE_LOAD,
            { headers: buildHeader(false) }
        );
        return {
            selectedTeamId: response.data?.selectedTeamId ?? null,
            teams: Array.isArray(response.data?.teams) ? response.data.teams : [],
        };
    } catch (error) {
        console.error("Failed to fetch team config:", error);
        return {
            selectedTeamId: 0,
            teams: [],
        };
    }
};

export const saveSelectedTeamConfig = async (
    teamId: number
): Promise<boolean> => {
    try {
        const response = await axiosAuthServices.post<ApiResponse<null>>(
            API_ENDPOINTS.TEAM.CONFIGURE_UPDATE,
            { team_id: teamId },
            { headers: buildHeader(false) }
        );
        return response.data?.status === "Success";
    } catch (error) {
        console.error("Failed to save selected team config:", error);
        return false;
    }
};

// ============================
// Team Management APIs
// ============================

export const createTeam = (
    data: CreateTeamRequest
): Promise<GenericResponse> => {
    return apiClient.postGenericRes(API_ENDPOINTS.TEAM.CREATE, data);
};

export const getAllTeams = async (): Promise<Team[]> => {
    return await apiClient.get<Team[]>(API_ENDPOINTS.TEAM.GET_ALL);
};
export const updateTeam = (id: number, data: UpdateTeamRequest): Promise<GenericResponse> => {
    return apiClient.putApiRes(API_ENDPOINTS.TEAM.UPDATE(id), data);
};

export const deleteTeam = (id: number): Promise<GenericResponse> => {
    return apiClient.delete(API_ENDPOINTS.TEAM.DELETE(id));
};

export const getSingleTeam = async (
    teamId: number
): Promise<TeamDetails | null> => {
    return await apiClient.get<TeamDetails>(
        API_ENDPOINTS.TEAM.GET_ONE(teamId)
    );
};

// ============================
// Agent Management APIs
// ============================

export const createAgent = (
    data: CreateAgentRequest
): Promise<GenericResponse> => {
    return apiClient.postGenericRes(API_ENDPOINTS.AGENT.CREATE, data);
};

export const getAllAgents = async (): Promise<AgentsListDetails[]> => {
    return await apiClient.get<AgentsListDetails[]>(
        API_ENDPOINTS.AGENT.GET_ALL
    );
};

export const getSingleAgent = async (
    agentId: number
): Promise<AgentDetails | null> => {
    return await apiClient.get<AgentDetails>(
        API_ENDPOINTS.AGENT.GET_ONE(agentId)
    );
};

export const updateAgent = (
    agentId: number,
    data: UpdateAgentRequest
): Promise<GenericResponse> => {
    return apiClient.putApiRes(API_ENDPOINTS.AGENT.UPDATE(agentId), data);
};

export const deleteAgent = (
    agentId: number
): Promise<GenericResponse> => {
    return apiClient.delete(API_ENDPOINTS.AGENT.DELETE(agentId));
};

// ============================
// System Instruction APIs
// ============================

export const createSystemInstruction = (
    data: CreateSystemInstructionRequest
): Promise<GenericResponse> => {
    return apiClient.postGenericRes(API_ENDPOINTS.SYSTEM_INSTRUCTION.CREATE, data);
};

export const updateSystemInstruction = (
    system_instruction_id: number,
    data: UpdateSystemInstruction
): Promise<GenericResponse> => {
    return apiClient.put(API_ENDPOINTS.SYSTEM_INSTRUCTION.UPDATE(system_instruction_id), data);
};

export const deleteSystemInstruction = (
    system_instruction_id: number
): Promise<GenericResponse> => {
    return apiClient.delete(API_ENDPOINTS.SYSTEM_INSTRUCTION.DELETE(system_instruction_id));
};

// ============================
// MCP URL APIs
// ============================

export const createMcpUrl = (
    data: CreateMcpUrlRequest
): Promise<GenericResponse> => {
    return apiClient.postGenericRes(API_ENDPOINTS.MCP_URL.CREATE, data);
};

export const createBulkMcpUrls = (
    data: CreateBulkMcpUrlsRequest
): Promise<GenericResponse> => {
    return apiClient.postGenericRes(API_ENDPOINTS.MCP_URL.CREATE_BULK, data);
};

export const getAllMcpUrls = async (): Promise<McpUrlDetails[]> => {
   return await apiClient.get<McpUrlDetails[]>(
        API_ENDPOINTS.MCP_URL.GET_ALL
    );
};

export const updateMcpUrl = (
    id: number,
    data: UpdateMcpUrlRequest
): Promise<GenericResponse> => {
    return apiClient.put(API_ENDPOINTS.MCP_URL.UPDATE(id), data);
};

export const deleteMcpUrl = (
    id: number
): Promise<GenericResponse> => {
    return apiClient.delete(API_ENDPOINTS.MCP_URL.DELETE(id));
};

export const deleteBulkMcpUrls = (
    data: DeleteBulkMcpUrlsRequest
): Promise<GenericResponse> => {
    return apiClient.postGenericRes(API_ENDPOINTS.MCP_URL.DELETE_BULK, data);
};