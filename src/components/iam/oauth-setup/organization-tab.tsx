"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, X, Building2 } from "lucide-react"
import { toast } from "sonner"
import { fetchOrganization, createOrganization, updateOrganization, deleteOrganization } from "@/hooks/iam/oauth-service"
import { OAuthOrganization, OrgDomainInfo } from "@/types/oauth"

export function OrganizationTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orgData, setOrgData] = useState<OAuthOrganization | null>(null)

  const [name, setName] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [description, setDescription] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const [newDomainName, setNewDomainName] = useState("")
  const [newDomainValue, setNewDomainValue] = useState("")
  const [pendingNewDomains, setPendingNewDomains] = useState<{ name: string; domain: string }[]>([])
  const [removeDomainIds, setRemoveDomainIds] = useState<number[]>([])

  const [orgId, setOrgId] = useState("")
  const labelInputRef = useRef<HTMLInputElement>(null)
  const domainInputRef = useRef<HTMLInputElement>(null)

  const loadOrg = useCallback(() => {
    setLoading(true)
    fetchOrganization({
      successTask: (data: { configured: boolean } & OAuthOrganization) => {
        setOrgData(data)
        if (data.organization_id) setOrgId(data.organization_id)
        if (data.configured) {
          setName(data.name || "")
          setEnabled(data.enabled ?? true)
          setDescription(data.description || "")
          setRedirectUrl(data.redirect_url || "")
        }
        setLoading(false)
      },
      failureTask: () => { toast.error("Failed to load organization"); setLoading(false) },
      errorTask: () => { toast.error("Error loading organization"); setLoading(false) },
    })
  }, [])

  useEffect(() => { loadOrg() }, [loadOrg])

  const handleAddDomain = () => {
    if (!newDomainValue.trim()) return
    setPendingNewDomains(prev => [...prev, { name: newDomainName || newDomainValue, domain: newDomainValue }])
    setNewDomainName("")
    setNewDomainValue("")
    setTimeout(() => labelInputRef.current?.focus(), 0)
  }

  const handleRemovePendingDomain = (idx: number) => {
    setPendingNewDomains(prev => prev.filter((_, i) => i !== idx))
  }

  const handleRemoveExistingDomain = (id: number) => {
    setRemoveDomainIds(prev => [...prev, id])
  }

  const handleCreate = () => {
    setSaving(true)
    createOrganization({
      request: {
        name: name || orgId,
        alias: orgId,
        new_domains: pendingNewDomains.length > 0 ? pendingNewDomains : undefined,
      },
      successTask: () => {
        toast.success("Organization created")
        setSaving(false)
        setPendingNewDomains([])
        loadOrg()
      },
      failureTask: () => { toast.error("Failed to create organization"); setSaving(false) },
      errorTask: () => { toast.error("Error creating organization"); setSaving(false) },
    })
  }

  const handleUpdate = () => {
    setSaving(true)
    updateOrganization({
      request: {
        name,
        alias: orgData?.alias || orgId,
        enabled,
        description,
        redirect_url: redirectUrl,
        new_domains: pendingNewDomains.length > 0 ? pendingNewDomains : undefined,
        remove_domain_ids: removeDomainIds.length > 0 ? removeDomainIds : undefined,
      },
      successTask: () => {
        toast.success("Organization updated")
        setSaving(false)
        setPendingNewDomains([])
        setRemoveDomainIds([])
        loadOrg()
      },
      failureTask: () => { toast.error("Failed to update organization"); setSaving(false) },
      errorTask: () => { toast.error("Error updating organization"); setSaving(false) },
    })
  }

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete the Keycloak organization? This cannot be undone.")) return
    setSaving(true)
    deleteOrganization({
      successTask: () => {
        toast.success("Organization deleted")
        setSaving(false)
        setOrgData(null)
        setName("")
        loadOrg()
      },
      failureTask: () => { toast.error("Failed to delete organization"); setSaving(false) },
      errorTask: () => { toast.error("Error deleting organization"); setSaving(false) },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const existingDomains = (orgData?.domains || []).filter(d => !removeDomainIds.includes(d.id))
  const organizationAlias = orgData?.configured ? (orgData.alias || orgId) : orgId

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {orgData?.configured ? "Organization Configuration" : "Setup Organization"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Organization ID</Label>
            <Input value={orgId} disabled className="bg-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder={orgId} />
            </div>
            <div className="space-y-2">
              <Label>Alias</Label>
              <Input value={organizationAlias} readOnly tabIndex={-1} className="bg-muted" />
            </div>
          </div>

          {orgData?.configured && (
            <>
              <div className="flex items-center space-x-2">
                <Switch checked={enabled} onCheckedChange={setEnabled} />
                <Label>Enabled</Label>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Organization description" />
              </div>

              <div className="space-y-2">
                <Label>Redirect URL</Label>
                <Input value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="https://..." />
              </div>
            </>
          )}

          <div className="space-y-3">
            <Label>Domains</Label>
            <div className="flex flex-wrap gap-2">
              {existingDomains.map((d: OrgDomainInfo) => (
                <Badge key={d.id} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                  {d.domain}
                  {orgData?.configured && (
                    <span role="button" tabIndex={0} className="cursor-pointer hover:text-destructive" onClick={() => handleRemoveExistingDomain(d.id)} onKeyDown={e => e.key === "Enter" && handleRemoveExistingDomain(d.id)}>
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </Badge>
              ))}
              {pendingNewDomains.map((d, i) => (
                <Badge key={`new-${i}`} variant="default" className="flex items-center gap-1 py-1 px-3">
                  {d.domain}
                  <span role="button" tabIndex={0} className="cursor-pointer" onClick={() => handleRemovePendingDomain(i)} onKeyDown={e => e.key === "Enter" && handleRemovePendingDomain(i)}>
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                ref={labelInputRef}
                value={newDomainName}
                onChange={e => setNewDomainName(e.target.value)}
                placeholder="Label (e.g. Primary)"
                className="max-w-[200px]"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault()
                    domainInputRef.current?.focus()
                  }
                }}
              />
              <Input
                ref={domainInputRef}
                value={newDomainValue}
                onChange={e => setNewDomainValue(e.target.value)}
                placeholder="Domain (e.g. example.com)"
                onKeyDown={e => e.key === "Enter" && handleAddDomain()}
                onBlur={() => { if (newDomainValue.trim()) handleAddDomain(); }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onMouseDown={e => e.preventDefault()}
                onClick={handleAddDomain}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!orgData?.configured ? (
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Organization
              </Button>
            ) : (
              <>
                <Button onClick={handleUpdate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
