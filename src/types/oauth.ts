export interface OAuthOrganization {
    configured: boolean;
    organization_id?: string;
    keycloak_organization_id?: string;
    name?: string;
    alias?: string;
    enabled?: boolean;
    description?: string;
    redirect_url?: string;
    redirect_uri_base?: string;
    domains: OrgDomainInfo[];
}

export interface OrgDomainInfo {
    id: number;
    name: string;
    domain: string;
    readonly: boolean;
}

export interface OidcIdentityProvider {
    id: number;
    alias: string;
    display_name?: string;
    enabled: boolean;
    keycloak_config?: Record<string, unknown>;
}

export interface OidcIdpConfig {
    useDiscoveryEndpoint?: string;
    discoveryEndpoint?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    logoutUrl?: string;
    userInfoUrl?: string;
    issuer?: string;
    validateSignature?: string;
    useJwksUrl?: string;
    jwksUrl?: string;
    pkceEnabled?: string;
    clientAuthMethod?: string;
    clientId?: string;
    clientSecret?: string;
    syncMode?: string;
}

export interface DefaultMapperRequest {
    name: string;
    identityProviderMapper: string;
    config: Record<string, string>;
}

export interface CreateIdpRequest {
    alias: string;
    display_name?: string;
    enabled?: boolean;
    config: OidcIdpConfig;
    default_mappers?: DefaultMapperRequest[];
}

export interface CreateOrgRequest {
    name?: string;
    alias?: string;
    new_domains?: { name: string; domain: string }[];
}

export interface UpdateOrgRequest {
    name?: string;
    alias?: string;
    enabled?: boolean;
    description?: string;
    redirect_url?: string;
    new_domains?: { name: string; domain: string }[];
    remove_domain_ids?: number[];
}
