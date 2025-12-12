export interface CreateAddressGroupRequest {
    name: string;
    description?: string;
    web3_network_id: number;
    addresses: string[];
}
 
export interface AddressGroup {
    id: number;
    name: string;
    description?: string;
    addresses: string[];
    web3_network_id: number;
    user_id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface AddressGroupResponse {
    message?: string;
    data?: AddressGroup;
    status?: string;
}

export interface ListAddressGroupsResponse {
    status: string;
    data: AddressGroup[];
}

export interface UpdateAddressGroupRequest {
    addresses?: string[];
    name?: string;
    description?: string;
}

export interface DeleteAddressGroupResponse {
    message: string;
}

