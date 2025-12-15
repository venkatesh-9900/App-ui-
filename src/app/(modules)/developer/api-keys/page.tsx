"use client";

import ApiKeysTable from "@/components/developer/api-keys/api-keys-table";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Plus } from "lucide-react";
import Link from "next/link"

export default function ApiKeysPage() {
    return (
        <ProtectedRoute>
            <div className="w-full space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            API Keys
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Use these API keys to securely access and interact with our APIs.
                        </p>
                    </div>

                    <Link href="api-keys/new">
                        <Button className="self-start md:self-auto cursor-pointer flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Generate New API Key
                        </Button>
                    </Link>
                </div>
                <Separator className="my-4 bg-muted-foreground/40 h-px" />
                {/* Table */}
                <ApiKeysTable />
            </div>
        </ProtectedRoute>
    );
}