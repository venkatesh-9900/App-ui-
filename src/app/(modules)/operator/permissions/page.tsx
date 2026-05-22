"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PermissionsView } from "@/components/operator/permissions-view"
import { AccessDenied } from "@/components/access-denied"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { fetchPermissions, createPermission, updatePermission, deletePermission } from "@/hooks/operator/permissions-service"
import { Permission } from "@/types/operator"
import { toast } from "sonner"

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [accessDenied, setAccessDenied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadPermissions = useCallback(() => {
    setIsLoading(true)
    fetchPermissions({
      search: search || undefined,
      successTask: (data) => {
        setPermissions(data.data || [])
        setIsLoading(false)
      },
      failureTask: () => {
        setIsLoading(false)
        toast.error("Failed to load permissions")
      },
      errorTask: () => {
        setIsLoading(false)
        toast.error("Error connecting to server")
      },
      forbiddenTask: () => {
        setAccessDenied(true)
        setIsLoading(false)
      },
    })
  }, [search])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  const handleCreate = async (data: { name: string; description: string }) => {
    return new Promise<void>((resolve, reject) => {
      createPermission({
        request: data,
        successTask: () => {
          toast.success("Permission created successfully")
          loadPermissions()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to create permission")
          reject()
        },
        errorTask: () => {
          toast.error("Error creating permission")
          reject()
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          reject()
        },
      })
    })
  }

  const handleUpdate = async (id: number, data: { name: string; description: string }) => {
    return new Promise<void>((resolve, reject) => {
      updatePermission({
        id,
        request: data,
        successTask: () => {
          toast.success("Permission updated successfully")
          loadPermissions()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to update permission")
          reject()
        },
        errorTask: () => {
          toast.error("Error updating permission")
          reject()
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          reject()
        },
      })
    })
  }

  const handleDelete = (id: number) => {
    toast.info("Deleting permission...")
    deletePermission({
      id,
      successTask: () => {
        toast.success("Permission deleted successfully")
        loadPermissions()
      },
      failureTask: () => toast.error("Failed to delete permission"),
      errorTask: () => toast.error("Error deleting permission"),
      forbiddenTask: () => {
        toast.error("Access denied")
      },
    })
  }

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <DashboardNavbar />
        <AccessDenied />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PermissionsView
            permissions={permissions}
            isLoading={isLoading}
            search={search}
            onSearchChange={setSearch}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
