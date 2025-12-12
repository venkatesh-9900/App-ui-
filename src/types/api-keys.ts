export interface ApiKey {
    id: number
    name: string
    key: string
    permissions: string[]
    expiry: string
    user_id: string
    organization_id: string
    created_at: string
    updated_at: string
}

export interface CreateApiKeyRequest {
  name: string
  expiry?: string | null
}

export interface CreatedApiKeyResponse {
  id: number
  name: string
  key: string
  secret: string
  permissions: string[]
  expiry: string | null
  created_at: string
}

export interface DeleteApiKeyRequest {
  key: string
}

export interface DeleteApiKeyResponse {
  message: string
  deleted_count: number
}

