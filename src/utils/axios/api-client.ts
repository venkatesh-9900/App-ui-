import axiosAuthServices, { buildHeader } from "@/utils/axios/auth-axios";
import {AxiosResponse} from "axios";
import {GenericResponse} from "@/types";

type ApiResponse<T> = {
    status: GenericResponse["status"];
    message: string | null;
    data: T;
};

/**
 * A call using the axios client that automatically extracts the
 * 'data' property from the API's standard response structure.
 */
const apiClient = {
    /**
     * Performs a GET request.
     * @returns The 'data' property from the API response.
     */
    get: async <T>(url: string): Promise<T> => {
        const response = await axiosAuthServices.get<ApiResponse<T>>(url, {
            headers: buildHeader(false),
        });
        return response.data.data;
    },
    postApiRes: async <T>(url: string, data: any, isStream = false): Promise<T> => {
        const response = await performPostRequest<T>(url, data, isStream);
        return response.data.data;
    },

    postGenericRes: async (url: string, data: any, isStream = false): Promise<GenericResponse> => {
        const response = await performPostRequest<null>(url, data, isStream);
        return response.data;
    },
    /**
     * Performs a PUT request.
     * @returns The 'data' property from the API response.
     */
    putApiRes: async <T>(url: string, data: any): Promise<T> => {
        const response = await axiosAuthServices.put<ApiResponse<T>>(url, data, {
            headers: buildHeader(false),
        });
        return response.data.data;
    },
    /**
     * Performs a PUT request.
     * @returns The 'data' property from the API response.
     */
    put: async <T>(url: string, data: any): Promise<T> => {
        const response = await axiosAuthServices.put<T>(url, data, {
            headers: buildHeader(false),
        });
        return response.data;
    },

    /**
     * Performs a DELETE request.
     * For delete, we might not always have a 'data' wrapper, so we return the whole response data.
     */
    delete: async <T>(url: string, data?: any): Promise<T> => {
        const config = {
            headers: buildHeader(false),
            data: data ?? undefined,
        };
        const response = await axiosAuthServices.delete<T>(url, config);
        return response.data;
    },
};
const performPostRequest = async <T>(
    url: string,
    data: any,
    isStream: boolean
): Promise<AxiosResponse<ApiResponse<T>>> => {
    return axiosAuthServices.post<ApiResponse<T>>(url, data, {
        headers: buildHeader(isStream),
    });
};

export default apiClient;