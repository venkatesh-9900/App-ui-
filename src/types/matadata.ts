export interface Chain {
    id: number,
    chain_id: string,
    name: string,
    alechemy_network_id: string,
    block_explorer_url?: string,
    rpc_url?: string,
    currency?: string,
    created_at?: string,
    updated_at?: string,
}

export interface ChainListResponse {
    data?: { chains: Array<Chain> },
    errors?: string[]
}