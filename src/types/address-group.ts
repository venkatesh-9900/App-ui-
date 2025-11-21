export interface CreateAddressGroupRequest {
    name: string;
    description?: string;
    addresses: string[];
}

export interface AddressGroup {
    id: number;
    name: string;
    description?: string;
    addresses: string[];
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
    topics?: string[];
    subscriber_ids?: string[];
    channel_ids?: string[];
    is_active?: boolean;
}

export interface DeleteAddressGroupResponse {
    message: string;
}

