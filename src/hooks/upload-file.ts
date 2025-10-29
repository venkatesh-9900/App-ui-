import axiosAuthServices, {axiosAuthUploadServices, buildFileHeader, buildHeader} from "@/utils/axios/auth-axios";
import {ENDPOINTS} from "@/config/config";
import {FileDetails, FileUploadResponse, UserProfileImageUploadResponse} from "@/types";
import {fetchLoginURL, reauthenticationStep, refreshAccessToken} from "@/hooks/auth-service";
import { app_name } from "@/constants/constants";

interface UploadFilesApiParams {
    retry?: boolean;
    files: File[];
    currentChatId: string;
    fileFailureTask: (error: string) => void;
    failureTask: () => void;
    errorTask: () => void;
}

interface RemoveAttachedFileApiParams {
    retry?: boolean;
    fileId: string;
    currentChatId: string;
    successTask: () => void;
    failureTask: () => void;
    errorTask: () => void;
}

export const uploadFilesToServer = async ({files, currentChatId, fileFailureTask, failureTask, errorTask, retry = false}: UploadFilesApiParams) : Promise<FileDetails[]> => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        let sessionId = currentChatId === 'new' || !currentChatId ? '' : currentChatId;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]); // 'files' is the field name your backend expects
        }
        const token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.UPLOAD_FILE, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-app-name': app_name,
                ...(sessionId != "" ? { 'x-session-id': sessionId } : {})
            }
        });
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
                return [];
            } else {
                return await uploadFilesToServer({
                    retry: true, 
                    files,
                    currentChatId,
                    fileFailureTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status == 200) {
            const response_data = await response.json();
            if (response_data.other_errors && response_data.other_errors.length > 0) {
                throw new Error(`Failed to upload files due to these error(s): ${response_data.other_errors.join(', ')}`); 
            }
            if (response_data.upload_errors && response_data.upload_errors.length > 0) {
                console.log(`One or more file(s) failed to upload due to these issues: ${response_data.upload_errors.join(', ')}`);
                fileFailureTask("One or more file(s) failed to upload");
            }
            if (response_data.uploaded_file_details && response_data.uploaded_file_details.length > 0) {
                const uploaded_file_data : FileDetails[] = response_data.uploaded_file_details;
                return uploaded_file_data;
            }
            return [];
        } else {
            console.error("Failed to upload files with status code:", response.status);
            failureTask();
            return [];
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
        return [];
    }
}

export async function uploadFileToServer(file: File, currentChatId: string, ): Promise<FileUploadResponse> {
    let sessionId = currentChatId === 'new' || !currentChatId ? '' : currentChatId;
    //console.log(`(stub) uploading file: ${file.name} (${file.size} bytes) for session ${sessionId}`);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    const response = await axiosAuthUploadServices.post(
        `${ENDPOINTS.UPLOAD_FILE}`,
        formData,
        { headers: buildFileHeader() }
    );
    const data = response.data as FileUploadResponse;
    if (!data.uploadId) {
        throw new Error("No uploadId returned from server");
    }
    return data;
}

/**
 * Deletes a previously‐uploaded file by its uploadId.
 */
export async function deleteFileFromServer(messageId: number): Promise<void> {
    try {
        const url = ENDPOINTS.REMOVE_FILE.replace(
            "{messageId}",
            messageId.toString()
        );
        await axiosAuthServices.delete(url,
            { headers: buildHeader(false) });
        //console.log(`Deleted file messageId=${messageId} on server.`);
    } catch (err) {
        console.error(`Error deleting messageId=${messageId}:`, err);
        throw err;
    }
}

export const removeAttachedFile = async ({fileId, currentChatId, successTask, failureTask, errorTask, retry = false}: RemoveAttachedFileApiParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        let sessionId = currentChatId === 'new' || !currentChatId ? '' : currentChatId;
        const token = localStorage.getItem('access_token');
        const payload = { file_id: fileId };
        const response = await fetch(ENDPOINTS.REMOVE_FILE, {
            method: 'DELETE',
            body: JSON.stringify(payload),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `application/json`,
                'x-app-name': app_name,
                ...(sessionId != "" ? { 'x-session-id': sessionId } : {})
            }
        });
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await removeAttachedFile({
                    retry: true, 
                    fileId,
                    currentChatId,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status == 200) {
            const response_data = await response.json();
            if (response_data.errors && response_data.errors.length > 0) {
                throw new Error(`Failed to remove file attachment due to these error(s): ${response_data.other_errors.join(', ')}`); 
            }
            if (response_data.status == "success") {
                successTask();
            } else {
                failureTask();
            }
        } else {
            console.error("Failed to upload files with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
    }
}

export const getPresignedURLForFileRead = async (fileId: string, sessionId: string, retry: boolean = false): Promise<{presigned_url: string | null, error: string | null}> => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask: () => {
                console.log("Failed to refresh token")
            }, 
            errorTask: () => {
                console.log("Error encountered while refreshing token")
            }});
        }
        const token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.GET_PRESIGNED_URL + `?file_id=${fileId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `application/json`,
                'x-app-name': app_name,
                'x-session-id': sessionId
            }
        })
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(() => {
                    console.log("Error encountered while fetching login URL");
                });
                return {presigned_url: null, error: "Error in authentication"};
            } else {
                return await getPresignedURLForFileRead(fileId, sessionId, true);
            }
        } else if (response.status == 200) {
            const response_data = await response.json();
            return response_data
        } else {
            console.log("Failed to fetch presigned URL for the given file id with status code:", response.status);
        }
    } catch (error) {
        console.error("Failed to fetch presigned URL for the given file id:", error);
    }
    return {presigned_url: null, error: "Failed to fetch presigned URL"}
}

export async function uploadProfileImageToServer(file: File): Promise<UserProfileImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    console.log("---update load file: uploadProfileImageToServer--")
    const response = await axiosAuthUploadServices.post(
        `${ENDPOINTS.USERS.UPLOAD_FILE}`,
        formData,
        { headers: buildFileHeader() }
    );
    const data = response.data as UserProfileImageUploadResponse;
    if (!data.imageUrl) {
        throw new Error("No image URL returned from server");
    }
    return data;
}