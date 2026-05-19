"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "./auth-context"
import { fetchMySpaces } from "@/hooks/iam/iam-service"
import { Group } from "@/types/iam"

export interface Space {
    id: number
    name: string
}

interface SpaceContextValue {
    selectedSpace: Space | null
    setSelectedSpace: (space: Space | null) => void
    userGroups: Group[]
    isLoadingGroups: boolean
    selectedGroupId: number | undefined
    refreshGroups: () => void
}

const SpaceContext = createContext<SpaceContextValue | undefined>(undefined)

export function SpaceProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
    const [userGroups, setUserGroups] = useState<Group[]>([])
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)

    const loadGroups = useCallback(() => {
        setIsLoadingGroups(true)
        fetchMySpaces({
            successTask: (data) => {
                const groups: Group[] = data.data ?? data ?? []
                setUserGroups(groups)
                setIsLoadingGroups(false)
            },
            failureTask: () => setIsLoadingGroups(false),
            errorTask: () => setIsLoadingGroups(false),
            forbiddenTask: () => setIsLoadingGroups(false),
        })
    }, [])

    useEffect(() => {
        if (!isAuthenticated) return
        loadGroups()
    }, [isAuthenticated, loadGroups])

    const selectedGroupId = useMemo(
        () => selectedSpace?.id ?? undefined,
        [selectedSpace]
    )

    const handleSetSelectedSpace = useCallback((space: Space | null) => {
        setSelectedSpace(space)
    }, [])

    const value = useMemo<SpaceContextValue>(
        () => ({
            selectedSpace,
            setSelectedSpace: handleSetSelectedSpace,
            userGroups,
            isLoadingGroups,
            selectedGroupId,
            refreshGroups: loadGroups,
        }),
        [selectedSpace, handleSetSelectedSpace, userGroups, isLoadingGroups, selectedGroupId, loadGroups]
    )

    return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>
}

export function useSpace() {
    const ctx = useContext(SpaceContext)
    if (!ctx) {
        throw new Error("useSpace must be used within a SpaceProvider")
    }
    return ctx
}
