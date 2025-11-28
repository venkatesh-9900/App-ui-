"use client"

import { ENDPOINTS } from "@/config/config"
import { app_name } from "@/constants/constants"
import { reauthenticationStep, refreshAccessToken } from "../auth-service"
import { NeighbourData } from "@/types/blockchain"

interface SearchTxnParams {
  chainId: number
  module?: string
  action?: string
  txhash?: string
  address?: string
  page?: number
  offset?: number
  sort?: "asc" | "desc"
}

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
}

interface TransactionData {
  hash: string
  from: string
  to: string
  value: string
  status: string
  blockNumber: string
  timestamp: string
  gasUsed: string
  gasPrice: string
  [key: string]: unknown
}

interface SearchTxnResponse {
  data: TransactionData[]
  total: number
  page: number
  offset: number
}

interface SearchTxnResponse {
  data: TransactionData[]
  total: number
  page: number
  offset: number
}

interface SearchTxnApiParams extends SearchTxnParams {
  retry?: boolean
  successTask: (response: SearchTxnResponse) => void
  failureTask: () => void
  errorTask: () => void
}

/**
 * Search for blockchain transactions or address data
 */
export async function searchBlockchainTransaction({
  chainId,
  module,
  action,
  txhash,
  address,
  page,
  offset,
  sort,
  successTask,
  failureTask,
  errorTask,
  retry = false,
}: SearchTxnApiParams) {
  try {

    if (retry) {
        console.log("Refreshing access token");
        await refreshAccessToken({failureTask, errorTask});
    }
    
    const token = localStorage.getItem("access_token")

    const payload = {
      chainId,
      module: module || "account",
      action: action || "txlist",
      ...(txhash && { txhash }),
      ...(address && { address }),
      page: page || 1,
      offset: offset || 10,
      sort: sort || "asc",
    }
    console.log(ENDPOINTS.WEB3_MONITORING.SEARCH_TXN, "ENDPOINTS.WEB3_MONITORING.SEARCH_TXN")
    const response = await fetch(ENDPOINTS.WEB3_MONITORING.SEARCH_TXN, {
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
        await searchBlockchainTransaction({
          chainId,
          module,
          action,
          txhash,
          address,
          page,
          offset,
          sort,
          successTask,
          failureTask,
          errorTask,
          retry: true,
        })
      }
    } else if (response.status === 200) {
      const responseData = await response.json()
      
      // Pass the full response including errors to successTask
      // Let the component decide how to handle errors
      successTask(responseData)
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

export async function blockchainAddressLookup({
  chainId,
  address,
  startTime,
  endTime,
  direction,
  successTask,
  failureTask,
  errorTask,
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
          retry: true
        })
      }
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
