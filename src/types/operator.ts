export interface Api {
  id: number
  name: string
  description: string
  path: string
  method: string
  api_service_id: number
  status: string
  created_at: string
}

export interface ApiService {
  id: number
  name: string
  description: string
  base_url: string
  status: string
  created_at: string
}

export interface Permission {
  id: number
  name: string
  description: string
  only_for_super_admin: boolean
  status: string
  created_at: string
}

export interface ApiMapping {
  id: number
  api_id: number
  permission_id: number
  api_name: string
  permission_name: string
  created_at: string
}
