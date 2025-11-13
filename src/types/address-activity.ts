export interface CreateAddressActivityRequest {
    addresses: string[];
    topics: string[];
    subscriber_ids: string[];
    channel_ids: string[];
}

export interface AddressActivity {
    id: number;
    type: string;
    payload: any;
    trigger_id: string;
    novu_workflow_id: string;
    user_id: string;
    organization_id: string;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
}

export interface AddressActivityResponse {
    message?: string;
    data?: AddressActivity;
    status?: string;
}

export interface ListAddressActivitiesResponse {
    status: string;
    data: AddressActivity[];
}

export interface UpdateAddressActivityRequest {
    addresses?: string[];
    topics?: string[];
    subscriber_ids?: string[];
    channel_ids?: string[];
    is_active?: boolean;
}

export interface DeleteAddressActivityResponse {
    message: string;
}

