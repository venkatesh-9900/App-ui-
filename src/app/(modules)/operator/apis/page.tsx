"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ApisView } from "@/components/operator/apis-view"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { fetchApis, createApi, updateApi, deleteApi } from "@/hooks/operator/apis-service"
import { fetchApiServices } from "@/hooks/operator/api-services-service"
import { Api, ApiService } from "@/types/operator"
import { toast } from "sonner"
import { AccessDenied } from "@/components/access-denied"

export default function APIsPage() {
  const [apis, setApis] = useState<Api[]>([])
  const [services, setServices] = useState<ApiService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)

  const loadApis = useCallback(() => {
    setIsLoading(true)
    fetchApis({
      page,
      limit: pageSize,
      search: search || undefined,
      successTask: (data) => {
        setApis(data.data || [])
        setTotalCount(data.count || 0)
        setIsLoading(false)
      },
      failureTask: () => {
        setIsLoading(false)
        toast.error("Failed to load APIs")
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

  const loadServices = useCallback(() => {
    fetchApiServices({
      successTask: (data) => setServices(data.data || data),
      failureTask: () => console.error("Failed to load services for dropdown"),
      errorTask: () => console.error("Error loading services for dropdown")
    })
  }, [])

  useEffect(() => {
    loadApis()
  }, [loadApis])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  const handleCreate = async (data: Partial<Api>) => {
    return new Promise<void>((resolve, reject) => {
      createApi({
        request: data,
        successTask: () => {
          toast.success("API created successfully")
          loadApis()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to create API")
          reject()
        },
        errorTask: () => {
          toast.error("Error creating API")
          reject()
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          reject()
        },
      })
    })
  }

  const handleUpdate = async (id: number, data: Partial<Api>) => {
    return new Promise<void>((resolve, reject) => {
      updateApi({
        id,
        request: data,
        successTask: () => {
          toast.success("API updated successfully")
          loadApis()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to update API")
          reject()
        },
        errorTask: () => {
          toast.error("Error updating API")
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
    toast.info("Deleting API...")
    deleteApi({
      id,
      successTask: () => {
        toast.success("API deleted successfully")
        loadApis()
      },
      failureTask: () => toast.error("Failed to delete API"),
      errorTask: () => toast.error("Error deleting API"),
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
      <ApisView 
        apis={apis}
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
    </ProtectedRoute>
  )
}
