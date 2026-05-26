"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Link2, Unlink, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { FormLabel } from "@/components/ui/form-label"
import { fetchOrgIdpMappings, linkIdpToOrg, unlinkIdpFromOrg, fetchIdentityProviders, fetchOrganization } from "@/hooks/iam/oauth-service"
import { OidcIdentityProvider, OAuthOrganization, OrgDomainInfo } from "@/types/oauth"

interface LinkedIdp {
  alias: string;
  [key: string]: unknown;
}

const NONE_DOMAIN = "__none__"
const ANY_DOMAIN = "ANY"

export function OrgIdpLinkTab() {
  const [loading, setLoading] = useState(true)
  const [linkedIdps, setLinkedIdps] = useState<LinkedIdp[]>([])
  const [availableIdps, setAvailableIdps] = useState<OidcIdentityProvider[]>([])
  const [domains, setDomains] = useState<OrgDomainInfo[]>([])
  const [orgConfigured, setOrgConfigured] = useState(false)
  const [linking, setLinking] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAlias, setSelectedAlias] = useState("")
  const [selectedDomain, setSelectedDomain] = useState(NONE_DOMAIN)
  const [hideOnLoginPage, setHideOnLoginPage] = useState(true)
  const [redirectOnDomain, setRedirectOnDomain] = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    let loadedMappings = false
    let loadedIdps = false
    let loadedOrg = false

    const checkDone = () => {
      if (loadedMappings && loadedIdps && loadedOrg) setLoading(false)
    }

    fetchOrgIdpMappings({
      successTask: (data: { data: LinkedIdp[] }) => {
        setLinkedIdps(Array.isArray(data.data) ? data.data : [])
        loadedMappings = true
        checkDone()
      },
      failureTask: () => { toast.error("Failed to load linked identity providers"); loadedMappings = true; checkDone() },
      errorTask: () => { toast.error("Error loading linked identity providers"); loadedMappings = true; checkDone() },
    })

    fetchIdentityProviders({
      successTask: (data: { data: OidcIdentityProvider[] }) => {
        setAvailableIdps(data.data || [])
        loadedIdps = true
        checkDone()
      },
      failureTask: () => { toast.error("Failed to load identity providers"); loadedIdps = true; checkDone() },
      errorTask: () => { toast.error("Error loading identity providers"); loadedIdps = true; checkDone() },
    })

    fetchOrganization({
      successTask: (data: OAuthOrganization) => {
        setOrgConfigured(data.configured)
        setDomains(data.domains || [])
        loadedOrg = true
        checkDone()
      },
      failureTask: () => { toast.error("Failed to load organization"); loadedOrg = true; checkDone() },
      errorTask: () => { toast.error("Error loading organization"); loadedOrg = true; checkDone() },
    })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const linkedAliases = new Set(linkedIdps.map(l => l.alias))
  const unlinkableIdps = availableIdps.filter(idp => !linkedAliases.has(idp.alias))

  const openLinkDialog = () => {
    setSelectedAlias("")
    setSelectedDomain(NONE_DOMAIN)
    setHideOnLoginPage(true)
    setRedirectOnDomain(true)
    setDialogOpen(true)
  }

  const handleLink = () => {
    if (!selectedAlias) return
    setLinking(true)
    linkIdpToOrg({
      alias: selectedAlias,
      domain: selectedDomain !== NONE_DOMAIN ? selectedDomain : undefined,
      hideOnLoginPage,
      redirectWhenEmailDomainMatches: redirectOnDomain,
      successTask: () => {
        toast.success("Identity provider linked")
        setLinking(false)
        setDialogOpen(false)
        loadData()
      },
      failureTask: () => { toast.error("Failed to link identity provider"); setLinking(false) },
      errorTask: () => { toast.error("Error linking identity provider"); setLinking(false) },
    })
  }

  const handleUnlink = (alias: string) => {
    if (!confirm(`Unlink identity provider "${alias}" from this organization?`)) return
    unlinkIdpFromOrg({
      alias,
      successTask: () => { toast.success("Identity provider unlinked"); loadData() },
      failureTask: () => toast.error("Failed to unlink identity provider"),
      errorTask: () => toast.error("Error unlinking identity provider"),
    })
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link Identity Providers to Organization
          </CardTitle>
          <CardDescription>
            Manage which identity providers are linked to your Keycloak organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!orgConfigured ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 shrink-0" />
              Configure organization first before linking identity providers.
            </div>
          ) : (
            <>
              {unlinkableIdps.length > 0 && (
                <Button onClick={openLinkDialog}>
                  <Link2 className="h-4 w-4 mr-1" /> Link Identity Provider
                </Button>
              )}
              {linkedIdps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No identity providers linked to this organization yet.
                </p>
              ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkedIdps.map(idp => (
                  <TableRow key={idp.alias}>
                    <TableCell className="font-medium">{idp.alias}</TableCell>
                    <TableCell>
                      <Badge variant="default">Linked</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleUnlink(idp.alias)}>
                        <Unlink className="h-4 w-4 mr-1" /> Unlink
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link identity provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Identity provider <span className="text-destructive">*</span></Label>
              <Select value={selectedAlias} onValueChange={setSelectedAlias}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an IDP to link..." />
                </SelectTrigger>
                <SelectContent>
                  {unlinkableIdps.map(idp => (
                    <SelectItem key={idp.alias} value={idp.alias}>
                      {idp.display_name || idp.alias}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_DOMAIN}>None</SelectItem>
                  <SelectItem value={ANY_DOMAIN}>Any</SelectItem>
                  {domains.map(d => (
                    <SelectItem key={d.id} value={d.domain}>
                      {d.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <FormLabel htmlFor="hide-on-login" tooltip="If hidden, login with this provider is possible only if requested explicitly, for example using the 'kc_idp_hint' parameter. If hidden, login with this provider is possible only if requested explicitly, for example using the 'kc_idp_hint' parameter." className="flex items-center gap-1.5">
                Hide on login page
              </FormLabel>
              <Switch
                id="hide-on-login"
                checked={hideOnLoginPage}
                onCheckedChange={setHideOnLoginPage}
              />
            </div>

            <div className="flex items-center justify-between">
              <FormLabel htmlFor="redirect-domain" tooltip="Automatically redirect the user to this identity provider when the email domain matches the domain" className="flex items-center gap-1.5">
                Redirect when email domain matches
              </FormLabel>
              <Switch
                id="redirect-domain"
                checked={redirectOnDomain}
                onCheckedChange={setRedirectOnDomain}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLink} disabled={linking || !selectedAlias}>
              {linking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
