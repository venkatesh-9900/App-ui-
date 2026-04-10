import {ENDPOINTS} from "@/config/config"
import {reauthenticationStep, refreshAccessToken} from "@/hooks/auth-service"
import { app_name } from "@/constants/constants"

interface getAgentsListParams {
    retry?: boolean
    successTask: (agentDetails: string[]) => void
    failureTask: () => void
    errorTask: () => void
    forbiddenTask?: () => void
}

export const getAgentsList = async ({successTask, failureTask, errorTask, forbiddenTask, retry = false}: getAgentsListParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token")
            await refreshAccessToken({failureTask, errorTask})
        }
        const token = localStorage.getItem('access_token')
        const response = await fetch(ENDPOINTS.FETCH_AGENTS_LIST, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
        })
        console.log(response)
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(() => {
                    console.log("Error encountered while fetching login URL")
                })
            } else {
                await getAgentsList({
                    retry: true, 
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                })
            }
        } else if (response.status === 403) {
            forbiddenTask?.()
        } else if (response.status == 200) {
            const agentsList = await response.json()
            if (agentsList.errors && agentsList.errors.length > 0) {
                throw new Error(`Failed to fetch agents list due to these error(s): ${agentsList.errors.join(', ')}`)
            } else {
                successTask(agentsList.data.agents)
            }
        } else {
            console.error("Failed to fetch agents list with status code:", response.status)
            failureTask()
        }
    } catch (error) {
        console.error("Failed to fetch agents list:", error)
        errorTask()
    }
}
