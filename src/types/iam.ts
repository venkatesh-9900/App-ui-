export interface Group {
  id: number
  name: string
  created_by_user_id: number
  organization_id: number
  admin_user_id: number
  admin_email: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  created_by_user_id: number
  organization_id: number
  created_at: string
  updated_at: string
}

export interface UserRole {
  user_id: number
  role_id: number
  created_by_user_id: number
  created_at: string
  updated_at: string
}

export interface UserGroup {
  user_id: number
  group_id: number
  created_by_user_id: number
  created_at: string
  updated_at: string
}

export interface GroupRole {
  group_id: number
  role_id: number
  created_by_user_id: number
  created_at: string
  updated_at: string
}

export interface RolePermission {
  role_id: number
  permission_id: number
  created_by_user_id: number
  created_at: string
  updated_at: string
}
