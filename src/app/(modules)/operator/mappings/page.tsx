"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ApiMappingsView } from "@/components/operator/api-mappings-view"
import { AccessDenied } from "@/components/access-denied"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { fetchMappings, createMapping, deleteMapping, updateMapping } from "@/hooks/operator/mappings-service"
import { fetchApis } from "@/hooks/operator/apis-service"
import { fetchPermissions } from "@/hooks/operator/permissions-service"
import { fetchApiServices } from "@/hooks/operator/api-services-service"
import { ApiMapping, Api, Permission, ApiService } from "@/types/operator"
import { toast } from "sonner"

export default function MappingsPage() {
  const [mappings, setMappings] = useState<ApiMapping[]>([])
  const [apis, setApis] = useState<Api[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [services, setServices] = useState<ApiService[]>([])
  const [accessDenied, setAccessDenied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState("")

  const loadMappings = useCallback(() => {
    setIsLoading(true)
    fetchMappings({
      page,
      limit: pageSize,
      search: search || undefined,
      successTask: (data) => {
        setMappings(data.data || [])
        setTotalCount(data.count || 0)
        setIsLoading(false)
      },
      failureTask: () => {
        setIsLoading(false)
        toast.error("Failed to load mappings")
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
  }, [page, pageSize, search])

  const loadDependencies = useCallback(() => {
    // Unpaginated fetches for dropdowns and display resolution
    fetchApis({
      limit: 1000, // Fetch all for dropdowns
      successTask: (data) => setApis(data.data || data),
      failureTask: () => console.error("Failed to load apis for dropdown"),
      errorTask: () => console.error("Error loading apis for dropdown")
    })

    fetchPermissions({
      limit: 1000, // Fetch all for dropdowns
      successTask: (data) => setPermissions(data.data || data),
      failureTask: () => console.error("Failed to load permissions for dropdown"),
      errorTask: () => console.error("Error loading permissions for dropdown")
    })
    
    fetchApiServices({
      limit: 1000, // Fetch all for display resolution
      successTask: (data) => setServices(data.data || data),
      failureTask: () => console.error("Failed to load services for display"),
      errorTask: () => console.error("Error loading services for display")
    })
  }, [])

  useEffect(() => {
    loadMappings()
  }, [loadMappings])

  useEffect(() => {
    loadDependencies()
  }, [loadDependencies])

  const handleCreate = async (data: { api_id: number; permission_id: number }) => {
    return new Promise<void>((resolve, reject) => {
      createMapping({
        request: data,
        successTask: () => {
          toast.success("Mapping created successfully")
          loadMappings()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to create mapping")
          reject()
        },
        errorTask: () => {
          toast.error("Error creating mapping")
          reject()
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          reject()
        },
      })
    })
  }

  const handleUpdate = async (id: number, data: { api_id: number; permission_id: number }) => {
    return new Promise<void>((resolve, reject) => {
      updateMapping({
        id,
        request: data,
        successTask: () => {
          toast.success("Mapping updated successfully")
          loadMappings()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to update mapping")
          reject()
        },
        errorTask: () => {
          toast.error("Error updating mapping")
          reject()
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          reject()
        },
      })
    })
  }

  const handleDelete = (apiId: number, permissionId: number) => {
    toast.info("Unbinding permission...")
    deleteMapping({
      apiId,
      permissionId,
      successTask: () => {
        toast.success("Mapping deleted successfully")
        loadMappings()
      },
      failureTask: () => toast.error("Failed to delete mapping"),
      errorTask: () => toast.error("Error deleting mapping"),
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
          <ApiMappingsView 
            mappings={mappings}
            apis={apis}
            permissions={permissions}
            services={services}
            isLoading={isLoading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            search={search}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSearchChange={(val) => { setSearch(val); setPage(1) }}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
