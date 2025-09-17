import apiClient from "@/utils/axios/api-client";
import {ENDPOINTS} from "@/config/config.ts";
import {AppUserProfile, ProfileResponse, UpdateProfileRequest, UsernameCheckResponse, UserSession} from "@/types";
import axiosAuthServices, {axiosKratos, buildHeader, buildHeaderJSON} from "@/utils/axios/auth-axios.ts";
import {iam_login_url} from "@/constants/iam-uri.tsx";
import { refreshAccessToken } from "@/hooks/auth-service";
const API_ENDPOINTS = ENDPOINTS.USERS;

interface getUserProfileParams {
    retry?: boolean;
    successTask: (userProfile: AppUserProfile) => void;
    failureTask: () => void;
    errorTask: () => void;
}
/**
 * Fetch the current user's profile.
 */
// export const getUserProfile = async (): Promise<AppUserProfile> => {
//     return await apiClient.get<AppUserProfile>(API_ENDPOINTS.GET);
// };
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

export const getUserProfile = async ({successTask, failureTask, errorTask, retry = false}: getUserProfileParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        // const response = await axiosAuthServices.get(API_ENDPOINTS.GET, {
        //     headers: buildHeader(false),
        // });
        const response = await fetch(API_ENDPOINTS.GET, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                console.log("Redirecting to login page");
                window.location.replace(iam_login_url);
            } else {
                await getUserProfile({
                    retry: true, 
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status == 200) {
            const userProfile = await response.json();
            successTask({
                displayName: userProfile.email.split('@')[0],
                email: userProfile.email,
                organization: userProfile.organization,
            });
        } else {
            console.error("Failed to fetch user profile with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        errorTask();
    }
}