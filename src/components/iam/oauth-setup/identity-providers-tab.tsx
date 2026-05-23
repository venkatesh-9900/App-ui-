"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, KeyRound, Copy, Check, RefreshCw } from "lucide-react"
import { FormLabel } from "@/components/ui/form-label"
import { fetchIdentityProviders, createIdentityProvider, updateIdentityProvider, deleteIdentityProvider, fetchOrganization } from "@/hooks/iam/oauth-service"
import { OidcIdentityProvider, OidcIdpConfig, OAuthOrganization } from "@/types/oauth"
import { useAuth } from "@/contexts/auth-context"

const emptyConfig: OidcIdpConfig = {
  useDiscoveryEndpoint: "false",
  discoveryEndpoint: "",
  authorizationUrl: "",
  tokenUrl: "",
  logoutUrl: "",
  userInfoUrl: "",
  issuer: "",
  validateSignature: "false",
  useJwksUrl: "false",
  jwksUrl: "",
  pkceEnabled: "false",
  clientAuthMethod: "client_secret_post",
  syncMode: "LEGACY",
  clientId: "",
  clientSecret: "",
  defaultScope: "openid email",
  backchannelSupported: "true",
}

export function IdentityProvidersTab() {
  const { userInfo } = useAuth()
  const orgId = userInfo?.organization_id || ""
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [idps, setIdps] = useState<OidcIdentityProvider[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAlias, setEditAlias] = useState<string | null>(null)
  const [redirectUriBase, setRedirectUriBase] = useState("")
  const [copied, setCopied] = useState(false)
  const [redirectUriDialogOpen, setRedirectUriDialogOpen] = useState(false)
  const [createdRedirectUri, setCreatedRedirectUri] = useState("")
  const [redirectCopied, setRedirectCopied] = useState(false)

  const [alias, setAlias] = useState("")
  const [aliasError, setAliasError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [config, setConfig] = useState<OidcIdpConfig>({ ...emptyConfig })
  const [discoveryLoading, setDiscoveryLoading] = useState(false)
  const [discoveryError, setDiscoveryError] = useState<string | null>(null)

  const loadIdps = useCallback(() => {
    setLoading(true)
    fetchIdentityProviders({
      successTask: (data: { data: OidcIdentityProvider[] }) => {
        setIdps(data.data || [])
        setLoading(false)
      },
      failureTask: () => setLoading(false),
      errorTask: () => setLoading(false),
    })
  }, [])

  useEffect(() => { loadIdps() }, [loadIdps])

  useEffect(() => {
    fetchOrganization({
      successTask: (data: OAuthOrganization) => {
        setRedirectUriBase(data.redirect_uri_base || "")
      },
      failureTask: () => {},
      errorTask: () => {},
    })
  }, [])

  const computeRedirectUri = () => {
    if (!redirectUriBase) return ""
    const effectiveAlias = editAlias ? alias : (orgId && alias ? `${orgId}-${alias}` : alias)
    if (!effectiveAlias) return ""
    return `${redirectUriBase}/${effectiveAlias}/endpoint`
  }

  const redirectUri = computeRedirectUri()

  const handleCopy = () => {
    if (!redirectUri) return
    navigator.clipboard.writeText(redirectUri)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetForm = () => {
    setAlias("")
    setAliasError(null)
    setDisplayName("")
    setEnabled(true)
    setConfig({ ...emptyConfig })
    setEditAlias(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (idp: OidcIdentityProvider) => {
    setEditAlias(idp.alias)
    setAlias(idp.alias)
    setDisplayName(idp.display_name || "")
    setEnabled(idp.enabled)
    const kc = (idp.keycloak_config || {}) as Record<string, unknown>
    const kcConfig = (kc.config || {}) as Record<string, string>
    setConfig({
      useDiscoveryEndpoint: kcConfig.useDiscoveryEndpoint || "false",
      discoveryEndpoint: kcConfig.discoveryEndpoint || "",
      authorizationUrl: kcConfig.authorizationUrl || "",
      tokenUrl: kcConfig.tokenUrl || "",
      logoutUrl: kcConfig.logoutUrl || "",
      userInfoUrl: kcConfig.userInfoUrl || "",
      issuer: kcConfig.issuer || "",
      validateSignature: kcConfig.validateSignature || "false",
      useJwksUrl: kcConfig.useJwksUrl || "false",
      jwksUrl: kcConfig.jwksUrl || "",
      pkceEnabled: kcConfig.pkceEnabled || "false",
      clientAuthMethod: kcConfig.clientAuthMethod || "client_secret_post",
      syncMode: kcConfig.syncMode || "LEGACY",
      clientId: kcConfig.clientId || "",
      clientSecret: kcConfig.clientSecret || "",
      defaultScope: kcConfig.defaultScope || "openid email",
      backchannelSupported: kcConfig.backchannelSupported || "true",
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!alias.trim() || aliasError) return
    setSaving(true)
    const request = {
      alias,
      display_name: displayName || undefined,
      enabled,
      config,
      ...(!editAlias && {
        default_mappers: [{
          name: "username_to_tenant_username",
          identityProviderMapper: "oidc-username-idp-mapper",
          config: { syncMode: "FORCE", template: "${ALIAS}.${CLAIM.email}", target: "LOCAL" },
        }],
      }),
    }

    if (editAlias) {
      updateIdentityProvider({
        alias: editAlias,
        request,
        successTask: () => { setSaving(false); setDialogOpen(false); loadIdps() },
        failureTask: () => setSaving(false),
        errorTask: () => setSaving(false),
      })
    } else {
      createIdentityProvider({
        request,
        successTask: (data: any) => {
          setSaving(false)
          setDialogOpen(false)
          loadIdps()
          const finalAlias = data?.data?.alias || data?.alias || ""
          if (finalAlias && redirectUriBase) {
            setCreatedRedirectUri(`${redirectUriBase}/${finalAlias}/endpoint`)
            setRedirectUriDialogOpen(true)
          }
        },
        failureTask: () => setSaving(false),
        errorTask: () => setSaving(false),
      })
    }
  }

  const handleDelete = (idpAlias: string) => {
    if (!confirm(`Delete identity provider "${idpAlias}"?`)) return
    deleteIdentityProvider({
      alias: idpAlias,
      successTask: () => loadIdps(),
      failureTask: () => {},
      errorTask: () => {},
    })
  }

  const updateConfig = (key: keyof OidcIdpConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const fetchDiscovery = async () => {
    const url = (config.discoveryEndpoint || "").trim()
    if (!url) return
    setDiscoveryLoading(true)
    setDiscoveryError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setConfig(prev => ({
        ...prev,
        authorizationUrl: json.authorization_endpoint || prev.authorizationUrl,
        tokenUrl: json.token_endpoint || prev.tokenUrl,
        logoutUrl: json.end_session_endpoint || prev.logoutUrl,
        userInfoUrl: json.userinfo_endpoint || prev.userInfoUrl,
        issuer: json.issuer || prev.issuer,
        jwksUrl: json.jwks_uri || prev.jwksUrl,
      }))
    } catch (err) {
      setDiscoveryError(err instanceof Error ? err.message : "Failed to fetch discovery endpoint")
    } finally {
      setDiscoveryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Identity Providers
            </CardTitle>
            <CardDescription>OIDC identity providers for your organization</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); setCopied(false); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> Add IDP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editAlias ? "Edit Identity Provider" : "Create Identity Provider"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel tooltip="The alias uniquely identifies an identity provider and it is also used to build the redirect URI.">Alias *</FormLabel>
                    <Input
                      value={alias}
                      onChange={e => {
                        const val = e.target.value
                        setAlias(val)
                        setCopied(false)
                        setAliasError(val && /\s/.test(val) ? "Alias must not contain spaces" : null)
                      }}
                      readOnly={!!editAlias}
                      tabIndex={editAlias ? -1 : undefined}
                      className={editAlias ? "bg-muted" : aliasError ? "border-destructive" : undefined}
                      placeholder="my-oidc-idp"
                      title={editAlias ? "Alias cannot be changed after creation" : undefined}
                    />
                    {aliasError && <p className="text-xs text-destructive">{aliasError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="My OIDC Provider" />
                  </div>
                </div>

                {editAlias && alias.trim() && (
                  <div className="space-y-2">
                    <FormLabel tooltip="The redirect uri to use when configuring the identity provider.">Redirect URI</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        value={redirectUri || "Loading..."}
                        readOnly
                        tabIndex={-1}
                        className="bg-muted font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={handleCopy}
                        disabled={!redirectUri}
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure this URL as the redirect/callback URI in your external identity provider.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                  <Label>Enabled</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.useDiscoveryEndpoint === "true"}
                    onCheckedChange={v => updateConfig("useDiscoveryEndpoint", v ? "true" : "false")}
                  />
                  <Label>Use Discovery Endpoint</Label>
                </div>

                {config.useDiscoveryEndpoint === "true" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Discovery Endpoint URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={config.discoveryEndpoint}
                          onChange={e => updateConfig("discoveryEndpoint", e.target.value)}
                          placeholder="https://.../.well-known/openid-configuration"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          disabled={!config.discoveryEndpoint?.trim() || discoveryLoading}
                          onClick={fetchDiscovery}
                        >
                          {discoveryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          <span className="ml-1">Fetch</span>
                        </Button>
                      </div>
                      {discoveryError && (
                        <p className="text-xs text-destructive">{discoveryError}</p>
                      )}
                    </div>
                    {(config.authorizationUrl || config.tokenUrl || config.issuer) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-md border p-3 bg-muted/40">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Authorization URL</Label>
                          <Input value={config.authorizationUrl} readOnly tabIndex={-1} className="bg-muted text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Token URL</Label>
                          <Input value={config.tokenUrl} readOnly tabIndex={-1} className="bg-muted text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Logout URL</Label>
                          <Input value={config.logoutUrl} onChange={e => updateConfig("logoutUrl", e.target.value)} className="text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">User Info URL</Label>
                          <Input value={config.userInfoUrl} readOnly tabIndex={-1} className="bg-muted text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Issuer</Label>
                          <Input value={config.issuer} readOnly tabIndex={-1} className="bg-muted text-xs h-8" />
                        </div>
                        {config.jwksUrl && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">JWKS URL</Label>
                            <Input value={config.jwksUrl} readOnly tabIndex={-1} className="bg-muted text-xs h-8" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {config.useDiscoveryEndpoint !== "true" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Authorization URL</Label>
                      <Input value={config.authorizationUrl} onChange={e => updateConfig("authorizationUrl", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Token URL</Label>
                      <Input value={config.tokenUrl} onChange={e => updateConfig("tokenUrl", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Logout URL</Label>
                      <Input value={config.logoutUrl} onChange={e => updateConfig("logoutUrl", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>User Info URL</Label>
                      <Input value={config.userInfoUrl} onChange={e => updateConfig("userInfoUrl", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input value={config.issuer} onChange={e => updateConfig("issuer", e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.validateSignature === "true"}
                      onCheckedChange={v => updateConfig("validateSignature", v ? "true" : "false")}
                    />
                    <FormLabel tooltip="Enable/disable signature validation of external OIDC provider signatures.">Validate Signatures</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.pkceEnabled === "true"}
                      onCheckedChange={v => updateConfig("pkceEnabled", v ? "true" : "false")}
                    />
                    <Label>Use PKCE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.backchannelSupported !== "false"}
                      onCheckedChange={v => updateConfig("backchannelSupported", v ? "true" : "false")}
                    />
                    <FormLabel tooltip="Does the external IDP support backchannel logout?">Backchannel Logout</FormLabel>
                  </div>
                </div>

                {config.validateSignature === "true" && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.useJwksUrl === "true"}
                        onCheckedChange={v => updateConfig("useJwksUrl", v ? "true" : "false")}
                      />
                      <Label>Use JWKS URL</Label>
                    </div>
                    {config.useJwksUrl === "true" && (
                      <div className="space-y-2">
                        <Label>JWKS URL</Label>
                        <Input
                          value={config.jwksUrl}
                          onChange={e => updateConfig("jwksUrl", e.target.value)}
                          placeholder="https://.../.well-known/jwks.json"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <FormLabel tooltip="The client authentication method (cfr. https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication). In case of JWT signed with private key, the realm private key is used.">Client Authentication Method</FormLabel>
                  <Select value={config.clientAuthMethod} onValueChange={v => updateConfig("clientAuthMethod", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_secret_post">Client Secret Post</SelectItem>
                      <SelectItem value="client_secret_basic">Client Secret Basic</SelectItem>
                      <SelectItem value="client_secret_jwt">Client Secret JWT</SelectItem>
                      <SelectItem value="private_key_jwt">Private Key JWT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel tooltip="Default sync mode for all mappers. The sync mode determines when user data is synced using the mappers. Three possible values exist: 'legacy' to keep the behavior before this option was introduced, 'import' to import the user only once, specifically during the first login of the user with this identity provider, and force' to always update the user at every login with this identity provider.">Sync Mode</FormLabel>
                  <Select value={config.syncMode} onValueChange={v => updateConfig("syncMode", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMPORT">Import</SelectItem>
                      <SelectItem value="LEGACY">Legacy</SelectItem>
                      <SelectItem value="FORCE">Force</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel tooltip="The client identifier registered with the identity provider.">Client ID *</FormLabel>
                    <Input value={config.clientId} onChange={e => updateConfig("clientId", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <FormLabel tooltip="The client secret registered with the identity provider.">Client Secret *</FormLabel>
                    <Input type="password" value={config.clientSecret} onChange={e => updateConfig("clientSecret", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel tooltip="The scopes to be sent when asking for authorization. It can be a space-separated list of scopes. Defaults to 'openid'.">Default Scopes</FormLabel>
                  <Input
                    value={config.defaultScope}
                    onChange={e => updateConfig("defaultScope", e.target.value)}
                    placeholder="openid email"
                  />
                  <p className="text-xs text-muted-foreground">Space-separated list of scopes requested by default.</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={saving || !alias.trim() || !!aliasError}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editAlias ? "Save" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Post-creation redirect URI dialog */}
        <Dialog open={redirectUriDialogOpen} onOpenChange={(open) => { setRedirectUriDialogOpen(open); if (!open) setRedirectCopied(false) }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Identity Provider Created
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Your identity provider has been created. Copy the redirect URI below and configure it as the callback URL in your external identity provider dashboard.
              </p>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Redirect URI</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={createdRedirectUri}
                    readOnly
                    tabIndex={-1}
                    className="bg-muted font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(createdRedirectUri)
                      setRedirectCopied(true)
                      setTimeout(() => setRedirectCopied(false), 2000)
                    }}
                    title="Copy to clipboard"
                  >
                    {redirectCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setRedirectUriDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CardContent>
          {idps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No identity providers configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alias</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {idps.map(idp => (
                  <TableRow key={idp.alias}>
                    <TableCell className="font-medium">{idp.alias}</TableCell>
                    <TableCell>{idp.display_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={idp.enabled ? "default" : "secondary"}>
                        {idp.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(idp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(idp.alias)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
