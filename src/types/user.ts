import {GenericResponse} from "@/types/teams.ts";

export interface AppUserProfile {
    displayName?: string;
    email?: string;
    organization?: string;
}

export interface ProfileResponse {
    status: 'Success' | 'Error' | 'Not found';
    message: string | null;
    data: AppUserProfile;
}

export interface UpdateProfileRequest {
    displayName: string;
    bio: string;
}

export interface UsernameCheckResponse extends GenericResponse {
    data: {
        available: boolean;
    };
}

export type UserSession = {
    identity: Identity
    [key: string]: any
}
export type Identity = {
    id: string
    traits: {
        email: string
        [key: string]: any
    }
    [key: string]: any
}
