import { ENDPOINTS } from "@/config/config"
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service"
import { app_name } from "@/constants/constants"
import { ApiKey, CreateApiKeyRequest, CreatedApiKeyResponse, DeleteApiKeyRequest, DeleteApiKeyResponse } from "@/types/api-keys"

interface GetApiKeysListParams {
    retry?: boolean
    successTask: (apiKeys: ApiKey[]) => void
    failureTask: () => void
    errorTask: () => void
}

interface CreateApiKeyParams {
  data: CreateApiKeyRequest
  retry?: boolean
  successTask: (createdKey: CreatedApiKeyResponse) => void
  failureTask: () => void
  errorTask: () => void
}

interface DeleteApiKeyParams {
  data: DeleteApiKeyRequest
  retry?: boolean
  successTask: (result: DeleteApiKeyResponse) => void
  failureTask: () => void
  errorTask: () => void
}

export const getApiKeysList = async ({
    successTask,
    failureTask,
    errorTask,
    retry = false,
}: GetApiKeysListParams): Promise<void> => {
    try {
        if (retry) {
            console.log("Refreshing access token")
            await refreshAccessToken({ failureTask, errorTask })
        }

        const token = localStorage.getItem("access_token")

        const response = await fetch(ENDPOINTS.API_Keys.FETCH_API_KEYS_LIST, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "x-app-name": app_name,
            },
        })

        console.log("Response:", response)

        // Handle 401 → retry → reauth if retry fails
        if (response.status === 401) {
            if (!retry) {
                // First failure → retry with token refresh
                return await getApiKeysList({
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask,
                })
            }

            // Retry already attempted → full reauth
            reauthenticationStep(() => {
                console.log("Error encountered while fetching login URL")
            })
            return
        }

        if (response.status === 200) {
            const result = await response.json()

            if (result.errors && result.errors.length > 0) {
                throw new Error(
                    `Failed to fetch API keys due to: ${result.errors.join(", ")}`
                )
            }

            // expected: { api_keys: [...] }
            successTask(result.api_keys)
            return
        }

        console.error("Failed with status:", response.status)
        failureTask()
    } catch (err) {
        console.error("Error fetching API keys:", err)
        errorTask()
    }
}

export const createApiKey = async ({
  data,
  successTask,
  failureTask,
  errorTask,
  retry = false,
}: CreateApiKeyParams): Promise<void> => {
  try {
    if (retry) {
      console.log("Refreshing access token before creating API key")
      await refreshAccessToken({ failureTask, errorTask })
    }

    const token = localStorage.getItem("access_token")

    const response = await fetch(ENDPOINTS.API_Keys.CREATE_API_KEY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-app-name": app_name,
      },
      body: JSON.stringify(data),
    })

    console.log("Create API Key response:", response)

    // If unauthorized → retry once → then reauth
    if (response.status === 401) {
      if (!retry) {
        return await createApiKey({
          data,
          retry: true,
          successTask,
          failureTask,
          errorTask,
        })
      }

      return reauthenticationStep(() => {
        console.error("Error encountered while fetching login URL")
      })
    }

    if (response.status === 200 || response.status === 201) {
      const result = await response.json()

      if (result.errors && result.errors.length > 0) {
        throw new Error(`Failed to create API key: ${result.errors.join(", ")}`)
      }
      successTask(result)
      return
    }

    console.error("Failed to create API key, status:", response.status)
    failureTask()
  } catch (err) {
    console.error("Error creating API key:", err)
    errorTask()
  }
}

export const deleteApiKey = async ({
  data,
  successTask,
  failureTask,
  errorTask,
  retry = false,
}: DeleteApiKeyParams): Promise<void> => {
  try {
    if (retry) {
      console.log("Refreshing access token before deleting API key")
      await refreshAccessToken({ failureTask, errorTask })
    }

    const token = localStorage.getItem("access_token")

    const response = await fetch(ENDPOINTS.API_Keys.DELETE_API_KEY, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-app-name": app_name,
      },
      body: JSON.stringify(data),
    })

    console.log("Delete API Key response:", response)

    // Handle 401 → retry or reauth
    if (response.status === 401) {
      if (!retry) {
        return await deleteApiKey({
          data,
          retry: true,
          successTask,
          failureTask,
          errorTask,
        })
      }

      return reauthenticationStep(() => {
        console.error("Error encountered while fetching login URL")
      })
    }

    if (response.status === 200) {
      const result: DeleteApiKeyResponse = await response.json()

      if (result.deleted_count === 0) {
        throw new Error("No API key deleted. Check if the key exists.")
      }

      successTask(result)
      return
    }

    console.error("Failed to delete API key, status:", response.status)
    failureTask()
  } catch (err) {
    console.error("Error deleting API key:", err)
    errorTask()
  }
}
