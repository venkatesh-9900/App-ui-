"use client"

import { ShieldX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <ShieldX className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don&apos;t have permission to access this resource. Contact your administrator to request access.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-6">
          <p className="text-xs text-muted-foreground">Error 403 &mdash; Forbidden</p>
        </CardContent>
      </Card>
    </div>
  )
}
