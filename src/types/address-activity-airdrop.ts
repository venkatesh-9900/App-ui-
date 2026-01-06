export interface CreateAddressActivityAirdropRequest {
    name: string;
    action: string;
    address_group_ids: number[];
    notification_group_ids: number[];
    notification_subscriber_ids: number[];
    channel_ids: string[];
}

export interface AddressActivityAirdrop {
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

export interface AddressActivityAirdropResponse {
    message?: string;
    data?: AddressActivityAirdrop;
    status?: string;
}

export interface ListAddressAirdropActivitiesResponse {
    status: string;
    data: AddressActivityAirdrop[];
}

export interface UpdateAddressActivityAirdropRequest {
    address_group_ids: number[];
    notification_group_ids: number[];
    notification_subscriber_ids: number[];
    channel_ids: string[];
    name: string,
    active?: boolean;
}

export interface DeleteAddressActivityAirdropResponse {
    message: string;
}

