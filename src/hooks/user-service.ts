import apiClient from "@/utils/axios/api-client";
import {ENDPOINTS} from "@/config/config.ts";
import {AppUserProfile, ProfileResponse, UpdateProfileRequest, UsernameCheckResponse, UserSession} from "@/types";
import axiosAuthServices, {axiosKratos, buildHeader} from "@/utils/axios/auth-axios.ts";
const API_ENDPOINTS = ENDPOINTS.USERS;
/**
 * Fetch the current user's profile.
 */
export const getUserProfile = async (): Promise<AppUserProfile> => {
    return await apiClient.get<AppUserProfile>(API_ENDPOINTS.GET);
};
/**
 * Update the current user's profile.
 * @param profile Updated profile data
 */
export const updateUserProfile = (profile: UpdateProfileRequest): Promise<ProfileResponse> => {
    return apiClient.putApiRes(API_ENDPOINTS.UPDATE, profile);
};


export async function checkUserSession(): Promise<UserSession> {
    try {
        const response = await axiosKratos.post(
            ENDPOINTS.AUTH.SESSION,
            {},
            { headers: buildHeader(false) }
        )
        return response.data // Parsed JSON user session
    } catch (error: any) {
        console.error("Session check failed", error)
        throw new Error("Session invalid or expired")
    }
}