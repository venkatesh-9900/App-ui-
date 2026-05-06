"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IamPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/iam/groups")
  }, [router])
  return null
}
