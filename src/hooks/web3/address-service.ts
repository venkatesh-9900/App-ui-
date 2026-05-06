"use client"

import { ENDPOINTS } from "@/config/config"
import { app_name } from "@/constants/constants"
import { reauthenticationStep, refreshAccessToken } from "../auth-service"
import { NeighbourData } from "@/types/blockchain"

interface SearchAddressParams {
  chainId: number
  address: string
  startTime: number
  endTime: number
  direction: number
  retry?: boolean
  excludeAddress?: string | null
  successTask: (response: NeighbourData) => void
  failureTask: () => void
  errorTask: () => void
  forbiddenTask?: () => void
}

/**
 * Look for blockchain address neighbours
 */
export async function blockchainAddressLookup({
  chainId,
  address,
  startTime,
  endTime,
  direction,
  successTask,
  failureTask,
  errorTask,
  forbiddenTask,
  retry = false,
  excludeAddress = null
}: SearchAddressParams) {
  try {
    if (retry) {
        console.log("Refreshing access token");
        await refreshAccessToken({failureTask, errorTask});
    }
    const token = localStorage.getItem("access_token")
    const payload = {
      chain_id: chainId,
      address: address,
      start_timestamp: startTime,
      end_timestamp: endTime,
      direction: direction,
      ...(excludeAddress && { exclude_address: excludeAddress })
    }
    const response = await fetch(ENDPOINTS.WEB3_MONITORING.GET_NEIGHBOURS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        "x-app-name": app_name,
      },
      body: JSON.stringify(payload),
    })

    console.log("Web3 Monitoring Search Response:", response)

    if (response.status === 401) {
      if (retry) {
        reauthenticationStep(errorTask);
      } else {
        await blockchainAddressLookup({
          chainId,
          address,
          startTime,
          endTime,
          direction,
          excludeAddress,
          successTask,
          failureTask,
          errorTask,
          forbiddenTask,
          retry: true
        })
      }
    } else if (response.status === 403) {
      forbiddenTask?.();
    } else if (response.status === 200) {
      const responseData = await response.json()
      if (responseData.errors && responseData.errors.length > 0) {
        throw new Error(`Failed to fetch neighbours due to these error(s): ${responseData.errors.join(', ')}`)
      }
      successTask(responseData.data)
    } else {
      console.error(
        "Failed to search blockchain data with status code:",
        response.status
      )
      failureTask()
    }
  } catch (error) {
    console.error(`Failed to search blockchain transaction:`, error)
    errorTask()
  }
}
