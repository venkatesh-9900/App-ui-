import {ENDPOINTS} from "@/config/config.ts";
import { refreshAccessToken } from "@/hooks/auth-service";
import {iam_login_url} from "@/constants/iam-uri.tsx";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
const API_ENDPOINT = ENDPOINTS.FETCH_AGENTS_LIST;



interface getAgentsListParams {
    retry?: boolean;
    successTask: (agentDetails: any) => void;
    failureTask: () => void;
    errorTask: () => void;
}
export const getAgentsList = async ({successTask, failureTask, errorTask, retry = false}: getAgentsListParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        // const response = await axiosAuthServices.get(API_ENDPOINTS.GET, {
        //     headers: buildHeader(false),
        // });
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                console.log("Redirecting to login page");
                window.location.replace(iam_login_url);
            } else {
                await getAgentsList({
                    retry: true, 
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status == 200) {
            const agentsList = await response.json();
            successTask(agentsList);
        } else {
            console.error("Failed to fetch agents list with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch agents list:", error);
        errorTask();
    }
}