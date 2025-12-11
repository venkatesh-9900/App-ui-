"use client"

import { ENDPOINTS } from "@/config/config"
import { app_name } from "@/constants/constants"
import { reauthenticationStep, refreshAccessToken } from "../auth-service"


interface Chain {
    id: number,
    chain_id: string,
    name: string,
    alechemy_network_id: string,
    block_explorer_url?: string,
    rpc_url?: string,
    currency?: string,
    created_at?: string,
    updated_at?: string,
}
interface ChainListResponse {
    data?: { chains: Array<Chain> },
    errors?: string[]
}


interface chainListApiParams {
    retry?: boolean
    successTask: (data: ChainListResponse) => void
    failureTask: () => void
    errorTask: () => void
}

/**
 * Fetch the list of supported blockchain networks (chainlist)
 */


export async function getChainlist({
    successTask,
    failureTask,
    errorTask,
    retry = false,
}: chainListApiParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const token = localStorage.getItem("access_token");

        const url = ENDPOINTS.WEB3_MONITORING.CHAINLIST;

        console.log("GET CHAINLIST URL:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                "x-app-name": app_name,
            },
        });

        console.log("Web3 Monitoring Chainlist Response:", response);

        if (response.status === 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await getChainlist({
                    successTask,
                    failureTask,
                    errorTask,
                    retry: true,
                });
            }
            return;
        }

        if (response.status === 200) {
            const data = await response.json();
            console.log("Fetched chainlist data:", data);
            successTask(data);
            return;
        }

        console.error("Failed to fetch chainlist. Status:", response.status);
        failureTask();
    } catch (error) {
        console.error("Failed to fetch chainlist:", error);
        errorTask();
    }
}