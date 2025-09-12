import axiosAuthServices, {axiosAuthUploadServices, buildFileHeader, buildHeader} from "@/utils/axios/auth-axios.ts";
import {ENDPOINTS} from "@/config/config.ts";
import {FileUploadResponse, UserProfileImageUploadResponse} from "@/types";


export async function uploadFileToServer(file: File, currentChatId: string): Promise<FileUploadResponse> {
    let sessionId = currentChatId === 'new' || !currentChatId ? '' : currentChatId;
    //console.log(`(stub) uploading file: ${file.name} (${file.size} bytes) for session ${sessionId}`);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    const response = await axiosAuthUploadServices.post(
        `${ENDPOINTS.UPLOAD_FILE}?sessionId=${encodeURIComponent(sessionId)}`,
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