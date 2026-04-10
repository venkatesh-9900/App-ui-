import { ENDPOINTS } from "@/config/config";
import { app_name } from "@/constants/constants";
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { BaseServiceParams } from "@/hooks/operator/operator-service-types";
import {
    Group, SubGroup, Role,
    UserGroup, GroupRole, UserSubGroup, SubGroupRole, UserRole, RolePermission
} from "@/types/iam";

// ---------------------------------------------------------------------------
// Param interfaces
// ---------------------------------------------------------------------------

export interface FetchGroupsParams extends BaseServiceParams {}
export interface CreateGroupParams extends BaseServiceParams {
    request: Partial<Group>;
}
export interface UpdateGroupParams extends BaseServiceParams {
    id: number;
    request: Partial<Group>;
}
export interface DeleteGroupParams extends BaseServiceParams {
    id: number;
}

export interface FetchSubGroupsParams extends BaseServiceParams {
    groupId?: number;
}
export interface CreateSubGroupParams extends BaseServiceParams {
    request: Partial<SubGroup>;
}
export interface UpdateSubGroupParams extends BaseServiceParams {
    id: number;
    request: Partial<SubGroup>;
}
export interface DeleteSubGroupParams extends BaseServiceParams {
    id: number;
}

export interface FetchRolesParams extends BaseServiceParams {}
export interface CreateRoleParams extends BaseServiceParams {
    request: Partial<Role>;
}
export interface UpdateRoleParams extends BaseServiceParams {
    id: number;
    request: Partial<Role>;
}
export interface DeleteRoleParams extends BaseServiceParams {
    id: number;
}

export interface FetchUserGroupMappingsParams extends BaseServiceParams {
    userId?: number;
    groupId?: number;
}
export interface AddUserGroupMappingParams extends BaseServiceParams {
    request: Partial<UserGroup>;
}
export interface RemoveUserGroupMappingParams extends BaseServiceParams {
    userId: number;
    groupId: number;
}

export interface FetchGroupRoleMappingsParams extends BaseServiceParams {
    groupId?: number;
    roleId?: number;
}
export interface AddGroupRoleMappingParams extends BaseServiceParams {
    request: Partial<GroupRole>;
}
export interface RemoveGroupRoleMappingParams extends BaseServiceParams {
    groupId: number;
    roleId: number;
}

export interface FetchUserSubGroupMappingsParams extends BaseServiceParams {
    userId?: number;
    subGroupId?: number;
}
export interface AddUserSubGroupMappingParams extends BaseServiceParams {
    request: Partial<UserSubGroup>;
}
export interface RemoveUserSubGroupMappingParams extends BaseServiceParams {
    userId: number;
    subGroupId: number;
}

export interface FetchSubGroupRoleMappingsParams extends BaseServiceParams {
    subGroupId?: number;
    roleId?: number;
}
export interface AddSubGroupRoleMappingParams extends BaseServiceParams {
    request: Partial<SubGroupRole>;
}
export interface RemoveSubGroupRoleMappingParams extends BaseServiceParams {
    subGroupId: number;
    roleId: number;
}

export interface FetchUserRoleMappingsParams extends BaseServiceParams {
    userId?: number;
    roleId?: number;
}
export interface AddUserRoleMappingParams extends BaseServiceParams {
    request: Partial<UserRole>;
}
export interface RemoveUserRoleMappingParams extends BaseServiceParams {
    userId: number;
    roleId: number;
}

export interface FetchRolePermissionMappingsParams extends BaseServiceParams {
    roleId?: number;
    permissionId?: number;
}

export interface FetchIamUsersParams extends BaseServiceParams {
    search?: string;
}
export interface AddRolePermissionMappingParams extends BaseServiceParams {
    request: Partial<RolePermission>;
}
export interface BulkAddRolePermissionMappingParams extends BaseServiceParams {
    request: { role_id: number; permission_ids: number[] };
}
export interface RemoveRolePermissionMappingParams extends BaseServiceParams {
    roleId: number;
    permissionId: number;
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export const fetchGroups = async ({ page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchGroupsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.GROUPS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.GROUPS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchGroups({ retry: true, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const createGroup = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateGroupParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.GROUPS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createGroup({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const updateGroup = async ({ id, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateGroupParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.GROUPS}?id=${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updateGroup({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const deleteGroup = async ({ id, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteGroupParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.GROUPS}?id=${id}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deleteGroup({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// SubGroups
// ---------------------------------------------------------------------------

export const fetchSubGroups = async ({ groupId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchSubGroupsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (groupId !== undefined) queryParams.append("group_id", groupId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.SUBGROUPS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.SUBGROUPS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchSubGroups({ retry: true, groupId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const createSubGroup = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateSubGroupParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.SUBGROUPS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createSubGroup({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const updateSubGroup = async ({ id, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateSubGroupParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.SUBGROUPS}?id=${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updateSubGroup({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const deleteSubGroup = async ({ id, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteSubGroupParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.SUBGROUPS}?id=${id}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deleteSubGroup({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const fetchRoles = async ({ page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchRolesParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.ROLES}?${queryParams.toString()}`
            : ENDPOINTS.IAM.ROLES;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchRoles({ retry: true, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const createRole = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateRoleParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.ROLES, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createRole({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const updateRole = async ({ id, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateRoleParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.ROLES}?id=${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updateRole({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const deleteRole = async ({ id, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteRoleParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.ROLES}?id=${id}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deleteRole({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// User ↔ Group mappings
// ---------------------------------------------------------------------------

export const fetchUserGroupMappings = async ({ userId, groupId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchUserGroupMappingsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (userId !== undefined) queryParams.append("user_id", userId.toString());
        if (groupId !== undefined) queryParams.append("group_id", groupId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.USER_GROUP_MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.USER_GROUP_MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchUserGroupMappings({ retry: true, userId, groupId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const addUserGroupMapping = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: AddUserGroupMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.USER_GROUP_MAPPINGS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await addUserGroupMapping({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const removeUserGroupMapping = async ({ userId, groupId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: RemoveUserGroupMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.USER_GROUP_MAPPINGS}?user_id=${userId}&group_id=${groupId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await removeUserGroupMapping({ retry: true, userId, groupId, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// Group ↔ Role mappings
// ---------------------------------------------------------------------------

export const fetchGroupRoleMappings = async ({ groupId, roleId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchGroupRoleMappingsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (groupId !== undefined) queryParams.append("group_id", groupId.toString());
        if (roleId !== undefined) queryParams.append("role_id", roleId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.GROUP_ROLE_MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.GROUP_ROLE_MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchGroupRoleMappings({ retry: true, groupId, roleId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const addGroupRoleMapping = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: AddGroupRoleMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.GROUP_ROLE_MAPPINGS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await addGroupRoleMapping({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const removeGroupRoleMapping = async ({ groupId, roleId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: RemoveGroupRoleMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.GROUP_ROLE_MAPPINGS}?group_id=${groupId}&role_id=${roleId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await removeGroupRoleMapping({ retry: true, groupId, roleId, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// User ↔ SubGroup mappings
// ---------------------------------------------------------------------------

export const fetchUserSubGroupMappings = async ({ userId, subGroupId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchUserSubGroupMappingsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (userId !== undefined) queryParams.append("user_id", userId.toString());
        if (subGroupId !== undefined) queryParams.append("sub_group_id", subGroupId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.USER_SUBGROUP_MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.USER_SUBGROUP_MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchUserSubGroupMappings({ retry: true, userId, subGroupId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const addUserSubGroupMapping = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: AddUserSubGroupMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.USER_SUBGROUP_MAPPINGS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await addUserSubGroupMapping({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const removeUserSubGroupMapping = async ({ userId, subGroupId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: RemoveUserSubGroupMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.USER_SUBGROUP_MAPPINGS}?user_id=${userId}&sub_group_id=${subGroupId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await removeUserSubGroupMapping({ retry: true, userId, subGroupId, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// SubGroup ↔ Role mappings
// ---------------------------------------------------------------------------

export const fetchSubGroupRoleMappings = async ({ subGroupId, roleId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchSubGroupRoleMappingsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (subGroupId !== undefined) queryParams.append("sub_group_id", subGroupId.toString());
        if (roleId !== undefined) queryParams.append("role_id", roleId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.SUBGROUP_ROLE_MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.SUBGROUP_ROLE_MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchSubGroupRoleMappings({ retry: true, subGroupId, roleId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const addSubGroupRoleMapping = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: AddSubGroupRoleMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.SUBGROUP_ROLE_MAPPINGS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await addSubGroupRoleMapping({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const removeSubGroupRoleMapping = async ({ subGroupId, roleId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: RemoveSubGroupRoleMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.SUBGROUP_ROLE_MAPPINGS}?sub_group_id=${subGroupId}&role_id=${roleId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await removeSubGroupRoleMapping({ retry: true, subGroupId, roleId, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// User ↔ Role mappings
// ---------------------------------------------------------------------------

export const fetchUserRoleMappings = async ({ userId, roleId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchUserRoleMappingsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (userId !== undefined) queryParams.append("user_id", userId.toString());
        if (roleId !== undefined) queryParams.append("role_id", roleId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.USER_ROLE_MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.USER_ROLE_MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchUserRoleMappings({ retry: true, userId, roleId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const addUserRoleMapping = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: AddUserRoleMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.USER_ROLE_MAPPINGS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await addUserRoleMapping({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const removeUserRoleMapping = async ({ userId, roleId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: RemoveUserRoleMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.USER_ROLE_MAPPINGS}?user_id=${userId}&role_id=${roleId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await removeUserRoleMapping({ retry: true, userId, roleId, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// Role ↔ Permission mappings
// ---------------------------------------------------------------------------

export const fetchRolePermissionMappings = async ({ roleId, permissionId, page, limit, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchRolePermissionMappingsParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (roleId !== undefined) queryParams.append("role_id", roleId.toString());
        if (permissionId !== undefined) queryParams.append("permission_id", permissionId.toString());
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.ROLE_PERMISSION_MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.ROLE_PERMISSION_MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchRolePermissionMappings({ retry: true, roleId, permissionId, page, limit, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const addRolePermissionMapping = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: AddRolePermissionMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.ROLE_PERMISSION_MAPPINGS, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await addRolePermissionMapping({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const bulkAddRolePermissionMappings = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: BulkAddRolePermissionMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.ROLE_PERMISSION_MAPPINGS_BULK, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await bulkAddRolePermissionMappings({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const removeRolePermissionMapping = async ({ roleId, permissionId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: RemoveRolePermissionMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.ROLE_PERMISSION_MAPPINGS}?role_id=${roleId}&permission_id=${permissionId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await removeRolePermissionMapping({ retry: true, roleId, permissionId, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

// ---------------------------------------------------------------------------
// IAM Users
// ---------------------------------------------------------------------------

export const fetchIamUsers = async ({ search, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchIamUsersParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);

        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.USERS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.USERS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchIamUsers({ retry: true, search, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};
