"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconCircleCheckFilled, IconCopy, IconLoader } from "@tabler/icons-react";
import { toast } from "sonner";

interface TransactionDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: Record<string, any>;
}

const enableCopyAddress = ["txn_hash", "block_hash", "from_address", "to_address"];

// human readable timestamp formatter
function formatTimestamp(value: any) {
  if (!value) return "-"; // null / empty → show "-"

  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value); // if not a valid date

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text ?? "");
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy"
      title="Copy"
      className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted/50 cursor-pointer"
    >
      {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
    </button>
  );
}

export function TransactionDetailsDialog({ open, setOpen, data }: TransactionDetailsDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {Object.entries(data).map(([key, value]) => {
            const formattedKey = key.replace(/_/g, " ");
            const isCopyEnabled = enableCopyAddress.includes(key);

            // If key is timestamp
            const isTimestamp = key.toLowerCase().includes("timestamp");

            const displayValue = isTimestamp
              ? formatTimestamp(value)
              : String(value);

            return (
              <div
                key={key}
                className="grid grid-cols-[150px_1fr_auto] gap-4 items-center border-b pb-3"
              >
                {/* LABEL */}
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {formattedKey}
                </span>

                {/* VALUE */}
                {key.toLowerCase() === "status" ? (
                  <Badge variant="outline" className="text-muted-foreground px-1.5 flex items-center">
                    {value == 1 ? (
                      <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1" />
                    ) : (
                      <IconLoader className="animate-spin mr-1" />
                    )}
                    {value == 1 ? "Success" : "Failed"}
                  </Badge>
                ) : (
                  <span
                    title={displayValue}
                    className="text-sm font-mono truncate w-full"
                  >
                    {displayValue}
                  </span>
                )}

                {/* COPY BUTTON */}
                {isCopyEnabled && key.toLowerCase() !== "status" ? (
                  <CopyButton text={String(value)} />
                ) : (
                  <span /> // keeps grid aligned
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
