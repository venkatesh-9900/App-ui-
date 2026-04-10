"use client"

import { ENDPOINTS } from "@/config/config"
import { app_name } from "@/constants/constants"
import { reauthenticationStep, refreshAccessToken } from "../auth-service"
import { ChainListResponse } from "@/types/matadata"


interface chainListApiParams {
    retry?: boolean
    successTask: (data: ChainListResponse) => void
    failureTask: () => void
    errorTask: () => void
    forbiddenTask?: () => void
}

/**
 * Fetch the list of supported blockchain networks (chainlist)
 */


export async function getChainlist({
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
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
                    forbiddenTask,
                    retry: true,
                });
            }
            return;
        }

        if (response.status === 403) {
            forbiddenTask?.();
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