"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ApiServicesView } from "@/components/operator/api-services-view"
import { AccessDenied } from "@/components/access-denied"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { fetchApiServices, createApiService, updateApiService, deleteApiService } from "@/hooks/operator/api-services-service"
import { ApiService } from "@/types/operator"
import { toast } from "sonner"

export default function ServicesPage() {
  const [services, setServices] = useState<ApiService[]>([])
  const [accessDenied, setAccessDenied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const loadServices = useCallback(() => {
    setIsLoading(true)
    fetchApiServices({
      page,
      limit: pageSize,
      successTask: (data) => {
        setServices(data.data || [])
        setTotalCount(data.count || 0)
        setIsLoading(false)
      },
      failureTask: () => {
        setIsLoading(false)
        toast.error("Failed to load API services")
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
  }, [page, pageSize])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  const handleCreate = async (data: Partial<ApiService>) => {
    return new Promise<void>((resolve, reject) => {
      createApiService({
        request: data,
        successTask: () => {
          toast.success("Service created successfully")
          loadServices()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to create service")
          reject()
        },
        errorTask: () => {
          toast.error("Error creating service")
          reject()
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          reject()
        },
      })
    })
  }

  const handleUpdate = async (id: number, data: Partial<ApiService>) => {
    return new Promise<void>((resolve, reject) => {
      updateApiService({
        id,
        request: data,
        successTask: () => {
          toast.success("Service updated successfully")
          loadServices()
          resolve()
        },
        failureTask: () => {
          toast.error("Failed to update service")
          reject()
        },
        errorTask: () => {
          toast.error("Error updating service")
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
    toast.info("Deleting service...")
    deleteApiService({
      id,
      successTask: () => {
        toast.success("Service deleted successfully")
        loadServices()
      },
      failureTask: () => toast.error("Failed to delete service"),
      errorTask: () => toast.error("Error deleting service"),
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
      <ApiServicesView 
        services={services}
        isLoading={isLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </ProtectedRoute>
  )
}
