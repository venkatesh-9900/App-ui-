"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { toast } from "sonner"
import { X } from 'lucide-react';
import { formatPrettyDate, truncateText } from "@/utils/formatting"
import { CreatedApiKeyResponse } from "@/types/api-keys"

type Props = {
    createdKey?: CreatedApiKeyResponse | null
    onDismiss?: () => void
}

export default function SecretBanner({ createdKey, onDismiss }: Props) {
    const [copiedKey, setCopiedKey] = useState(false)
    const [copiedSecret, setCopiedSecret] = useState(false)

    if (!createdKey) return null

    const { name, expiry, key, secret } = createdKey

    const stop = (e?: React.MouseEvent) => e?.stopPropagation()

    const handleCopy = async (
        value: string | undefined,
        type: "key" | "secret"
    ) => {
        if (!value) return
        try {
            await navigator.clipboard.writeText(value)
            type === "secret" ? setCopiedSecret(true) : setCopiedKey(true)
            toast.success(`${type === "secret" ? "Secret" : "Key"} copied`)
            setTimeout(() => {
                type === "secret" ? setCopiedSecret(false) : setCopiedKey(false)
            }, 2000)
        } catch {
            toast.error("Failed to copy")
        }
    }

    return (
        <div className="rounded-md border p-4 mb-4 bg-emarald-100">
            <div className="flex items-start justify-between pb-2 border-b ">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold tracking-tight">
                        New API Key
                    </h2>

                    <p className="text-sm font-medium text-emerald-700 mt-1 max-w-[70%]">
                        Make sure to copy your secret token now — you will not be able to see this again.
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDismiss}
                    className="h-8 w-8 cursor-pointer"
                    aria-label="Dismiss"
                >
                    <X />
                </Button>
            </div>

            {/* ---------------- INFO ROW (Name / Expires / Key) ---------------- */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* NAME */}
                <div>
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div className="text-sm font-medium truncate">{name}</div>
                </div>

                {/* EXPIRES */}
                <div>
                    <div className="text-xs text-muted-foreground">Expires</div>
                    <div className="text-sm">{expiry ? formatPrettyDate(expiry) : '-'}</div>
                </div>

                {/* KEY + SMALL COPY BUTTON */}
                <div>
                    <div className="text-xs text-muted-foreground">Key</div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                            {truncateText(key)}
                        </span>

                        <button
                            onClick={(e) => {
                                stop(e)
                                handleCopy(key, "key")
                            }}
                            className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/50 cursor-pointer"
                            aria-label="Copy key"
                        >
                            {copiedKey ? (
                                <IconCheck className="h-3 w-3" />
                            ) : (
                                <IconCopy className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------------- SECRET BLOCK ---------------- */}
            {secret && (
                <div className="mt-4 max-w-[500px]">
                    <div className="text-xs text-muted-foreground">Secret</div>

                    <div className="mt-2 flex items-stretch overflow-hidden rounded-md border">
                        <pre
                            className="flex-1 font-mono text-sm px-3 py-2 break-all overflow-hidden"
                            style={{ maxHeight: "6rem" }}
                        >
                            {secret}
                        </pre>

                        <div className="border-l">
                            <Button
                                variant="ghost"
                                className="h-9 w-9 p-0 cursor-pointer"
                                onClick={(e) => {
                                    stop(e)
                                    handleCopy(secret, "secret")
                                }}
                            >
                                {copiedSecret ? (
                                    <IconCheck className="h-4 w-4" />
                                ) : (
                                    <IconCopy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        This secret will only be shown once. Save it in a secure place.
                    </p>
                </div>
            )}
        </div>
    )
}