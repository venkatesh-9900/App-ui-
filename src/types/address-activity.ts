export interface CreateAddressActivityRequest {
    name: string;
    action: string;
    address_group_ids: number[];
    notification_group_ids: number[];
    notification_subscriber_ids: number[];
    channel_ids: string[];
}

export interface AddressActivity {
    id: number;
    name: string;
    type: string;
    payload: any;
    trigger_id: string;
    web3_address_group_ids: number[];
    notification_group_ids: number[];
    notification_subscriber_ids: number[];
    channel_ids: string[]
    notification_workflow_id: string;
    user_id: string;
    organization_id: string;
    active?: boolean;
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
    address_group_ids: number[];
    notification_group_ids: number[];
    notification_subscriber_ids: number[];
    channel_ids: string[];
    name: string,
    active?: boolean;
}

export interface DeleteAddressActivityResponse {
    message: string;
}

