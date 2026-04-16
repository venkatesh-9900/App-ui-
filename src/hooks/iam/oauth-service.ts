import { ENDPOINTS } from "@/config/config";
import { app_name } from "@/constants/constants";
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { BaseServiceParams } from "@/hooks/operator/operator-service-types";
import { CreateOrgRequest, UpdateOrgRequest, CreateIdpRequest } from "@/types/oauth";

// ---------------------------------------------------------------------------
// Param interfaces
// ---------------------------------------------------------------------------

export interface FetchOrganizationParams extends BaseServiceParams {}
export interface CreateOrganizationParams extends BaseServiceParams {
    request?: CreateOrgRequest;
}
export interface UpdateOrganizationParams extends BaseServiceParams {
    request: UpdateOrgRequest;
}
export interface DeleteOrganizationParams extends BaseServiceParams {}

export interface FetchIdentityProvidersParams extends BaseServiceParams {
    alias?: string;
}
export interface CreateIdentityProviderParams extends BaseServiceParams {
    request: CreateIdpRequest;
}
export interface UpdateIdentityProviderParams extends BaseServiceParams {
    alias: string;
    request: CreateIdpRequest;
}
export interface DeleteIdentityProviderParams extends BaseServiceParams {
    alias: string;
}

export interface FetchOrgIdpMappingsParams extends BaseServiceParams {}
export interface LinkIdpToOrgParams extends BaseServiceParams {
    alias: string;
    domain?: string;
    hideOnLoginPage?: boolean;
    redirectWhenEmailDomainMatches?: boolean;
}
export interface UnlinkIdpFromOrgParams extends BaseServiceParams {
    alias: string;
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export const fetchOrganization = async ({ successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchOrganizationParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.OAUTH_ORGANIZATIONS, { method: 'GET', headers });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await fetchOrganization({ retry: true, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const createOrganization = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateOrganizationParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.OAUTH_ORGANIZATIONS, {
            method: 'POST', headers, body: JSON.stringify(request || {})
        });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await createOrganization({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const updateOrganization = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateOrganizationParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.OAUTH_ORGANIZATIONS, {
            method: 'PUT', headers, body: JSON.stringify(request)
        });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await updateOrganization({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const deleteOrganization = async ({ successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteOrganizationParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.OAUTH_ORGANIZATIONS, { method: 'DELETE', headers });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await deleteOrganization({ retry: true, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(null); }
        else { failureTask(); }
    } catch { errorTask(); }
};

// ---------------------------------------------------------------------------
// Identity Providers
// ---------------------------------------------------------------------------

export const fetchIdentityProviders = async ({ alias, successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchIdentityProvidersParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const queryParams = new URLSearchParams();
        if (alias) queryParams.append("alias", alias);
        const url = queryParams.toString()
            ? `${ENDPOINTS.IAM.OAUTH_IDENTITY_PROVIDERS}?${queryParams.toString()}`
            : ENDPOINTS.IAM.OAUTH_IDENTITY_PROVIDERS;
        const response = await fetch(url, { method: 'GET', headers });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await fetchIdentityProviders({ retry: true, alias, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const createIdentityProvider = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateIdentityProviderParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.OAUTH_IDENTITY_PROVIDERS, {
            method: 'POST', headers, body: JSON.stringify(request)
        });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await createIdentityProvider({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const updateIdentityProvider = async ({ alias, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateIdentityProviderParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.OAUTH_IDENTITY_PROVIDERS}?alias=${alias}`, {
            method: 'PUT', headers, body: JSON.stringify(request)
        });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await updateIdentityProvider({ retry: true, alias, request, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const deleteIdentityProvider = async ({ alias, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteIdentityProviderParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.OAUTH_IDENTITY_PROVIDERS}?alias=${alias}`, { method: 'DELETE', headers });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await deleteIdentityProvider({ retry: true, alias, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(null); }
        else { failureTask(); }
    } catch { errorTask(); }
};

// ---------------------------------------------------------------------------
// Org ↔ IDP Mappings
// ---------------------------------------------------------------------------

export const fetchOrgIdpMappings = async ({ successTask, failureTask, errorTask, forbiddenTask, retry = false }: FetchOrgIdpMappingsParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.IAM.OAUTH_ORG_IDP_MAPPINGS, { method: 'GET', headers });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await fetchOrgIdpMappings({ retry: true, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const linkIdpToOrg = async ({ alias, domain, hideOnLoginPage, redirectWhenEmailDomainMatches, successTask, failureTask, errorTask, forbiddenTask, retry = false }: LinkIdpToOrgParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const body: Record<string, unknown> = { alias };
        if (domain) body.domain = domain;
        if (hideOnLoginPage !== undefined) body.hideOnLoginPage = hideOnLoginPage;
        if (redirectWhenEmailDomainMatches !== undefined) body.redirectWhenEmailDomainMatches = redirectWhenEmailDomainMatches;
        const response = await fetch(ENDPOINTS.IAM.OAUTH_ORG_IDP_MAPPINGS, {
            method: 'POST', headers, body: JSON.stringify(body)
        });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await linkIdpToOrg({ retry: true, alias, domain, hideOnLoginPage, redirectWhenEmailDomainMatches, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(await response.json()); }
        else { failureTask(); }
    } catch { errorTask(); }
};

export const unlinkIdpFromOrg = async ({ alias, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UnlinkIdpFromOrgParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask });
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.IAM.OAUTH_ORG_IDP_MAPPINGS}?alias=${alias}`, { method: 'DELETE', headers });
        if (response.status === 401) {
            if (retry) await reauthenticationStep(errorTask);
            else await unlinkIdpFromOrg({ retry: true, alias, successTask, failureTask, errorTask, forbiddenTask });
        } else if (response.status === 403) { forbiddenTask?.(); }
        else if (response.ok) { successTask(null); }
        else { failureTask(); }
    } catch { errorTask(); }
};
