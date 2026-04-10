"use client"

import { ENDPOINTS } from "@/config/config"
import { app_name } from "@/constants/constants"
import { reauthenticationStep, refreshAccessToken } from "../auth-service"
import { AccountsResponse } from "@/types/top-accounts"

interface AccountsApiParams {
    pageIndex: number
    pageSize: number
    address?: string
    retry?: boolean
    successTask: (data: AccountsResponse) => void
    failureTask: () => void
    errorTask: () => void
    forbiddenTask?: () => void
}

export async function getAccounts({
    pageIndex,
    pageSize,
    address,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: AccountsApiParams) {
    try {
        if (retry) {
            console.log("Refreshing access token")
            await refreshAccessToken({ failureTask, errorTask })
        }

        const token = localStorage.getItem("access_token")
        const page = pageIndex + 1 // backend is 1-based

        const params = new URLSearchParams({
            page: String(page),
            limit: String(pageSize),
        })

        if (address && address.trim().length > 0) {
            params.append("address", address.trim())
        }
        const url = `${ENDPOINTS.WEB3_MONITORING.ACCOUNTS}?${params.toString()}`

        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                "x-app-name": app_name,
            },
        })

        if (response.status === 401) {
            if (retry) {
                reauthenticationStep(errorTask)
            } else {
                await getAccounts({
                    pageIndex,
                    pageSize,
                    address,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true,
                })
            }
            return
        }

        if (response.status === 403) {
            forbiddenTask?.()
            return
        }

        if (response.status === 200) {
            const data = (await response.json()) as AccountsResponse
            console.log("Fetched accounts data:", data)
            successTask(data)
            return
        }

        console.error("Failed to fetch accounts. Status:", response.status)
        failureTask()
    } catch (error) {
        console.error("Failed to fetch accounts:", error)
        errorTask()
    }
}
