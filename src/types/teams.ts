export type Team = {
    team_id: number;
    team_name: string;
    team_description: string;
    coordinator?: string;
    created_at?: string;
    updated_at?: string;
};

export interface TeamConfiguratorProps {
    selectedTeamId: number | null;
    teams: Team[];
}

export interface TeamConfigRequest {
    team_id: number;
}
export interface UpdateTeamRequest {
    team_name: string;
    team_description: string;
    coordinator: number;
    updated_team_agents: number[];
}
/**
 * Represents the request to create a new MCP URL.
 * Corresponds to: CreateMcpUrlRequest.java
 */
export interface CreateMcpUrlRequest {
    url_link: string;
    mcp_url_description: string;
    mcp_protocol: 'sse' | 'streamable-http';
}
export interface UpdateMcpUrlRequest {
    url_link: string;
    mcp_url_description: string;
    mcp_protocol:  string | null;
}
/**
 * Represents the request to create a new agent.
 * Corresponds to: CreateAgentRequest.java
 */
export interface CreateAgentRequest {
    agent_name: string;
    llm_model: string;
    agent_description: string;
    system_instruction: SystemInstructionRequest;
    mcp_urls_list: number[];
}

/**
 * Represents the request to create a new team.
 * Corresponds to: CreateTeamRequest.java
 */
export interface CreateTeamRequest {
    team_name: string;
    team_description: string;
    coordinator: number;
    team_agents: number[];
}

/**
 * Represents the request to create system instructions for an agent.
 * Corresponds to: CreateSystemInstructionRequest.java
 */
export interface CreateSystemInstructionRequest {
    agent_id: number;
    system_instruction: SystemInstructionRequest;
    make_default: boolean;
}
/**
 * Represents the structure for a system instruction.
 * Corresponds to: SystemInstructionRequest.java
 */
export interface SystemInstructionRequest {
    version: string;
    instruction: string;
}
/**
 * Represents the request for creating multiple MCP URLs in bulk.
 * Corresponds to: CreateBulkMcpUrlsRequest.java
 */
export interface CreateBulkMcpUrlsRequest {
    mcp_url_details: CreateMcpUrlRequest[];
}

/**
 * Represents the request to delete multiple MCP URLs in bulk.
 * Corresponds to: DeleteBulkMcpUrlsRequest.java
 */
export interface DeleteBulkMcpUrlsRequest {
    mcp_url_ids: number[];
}

/**
 * Represents the request for a team's configuration.
 * Corresponds to: TeamConfigRequest.java
 */
export interface TeamConfigRequest {
    team_id: number;
}

export interface GenericResponse {
    status: 'Success' | 'Error' | 'Not found';
    message?: string | null;
}
export interface McpUrlDetails {
    mcp_url_id: number;
    url_link: string;
    mcp_url_description: string;
    mcp_protocol: string;
}
export interface TeamListDetails {
    team_id: number;
    team_name: string;
    team_description: string;
}
export interface TeamDetails {
    team_id: number;
    team_name: string;
    team_description: string;
    coordinator: number;
    agents_list: AgentDetails[];
}
export interface AgentDetails {
    agent_id: number;
    agent_name: string;
    llm_model: string;
    agent_description: string;
    system_instruction: number;
    system_instructions_list: SystemInstructionDetails[];
    mcp_urls_list: McpUrlDetails[];
}
export interface SystemInstructionDetails {
    system_instruction_id: number;
    version: string;
    instruction: string;
}
export interface UpdateSystemInstruction {
    agent_id: number;
    version: string;
    instruction: string;

}

export interface AgentsListDetails {
    agent_id: number;
    agent_name: string;
    llm_model: string;
    agent_description: string;
}

/**
 * Represents the response for team selection.
 * Corresponds to: TeamSelectionResponse.java
 */
export interface TeamSelectionResponse {
    selectedTeamId: number;
    teams: Team[];
}

export interface Agent {
    agent_id: number;
    agent_name: string;
    llm_model: string;
    agent_description: string;
}
export interface UpdateAgentRequest {
    agent_name: string;
    llm_model: string;
    agent_description: string;
    system_instruction: number;
    mcp_urls_list: number[];
}

export interface McpUrl {
    mcp_url_id: number;
    url_link: string;
    mcp_url_description: string;
    mcp_protocol: string;
}
export interface GetAllAgentsResponse extends GenericResponse {
    data: AgentsListDetails[];
}

export interface GetAgentDetailResponse extends GenericResponse {
    data: AgentDetails | null;
}

export interface ReadMcpUrlsResponse extends GenericResponse {
    data: McpUrlDetails[];
}

export interface ReadAllTeamsResponse extends GenericResponse {
    data: TeamListDetails[];
}

export interface ReadTeamDetailsResponse extends GenericResponse {
    data: TeamDetails | null;
}
