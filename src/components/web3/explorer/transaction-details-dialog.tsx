"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";

interface TransactionDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: Record<string, any>;
}

export function TransactionDetailsDialog({ open, setOpen, data }: TransactionDetailsDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="max-h-[450px] overflow-y-auto mt-4 space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-[150px_1fr] gap-4 items-center border-b pb-3"
            >
              {/* LABEL */}
              <span className="text-sm font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
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
                  title={String(value)}
                  className="text-sm font-mono truncate w-full"
                >
                  {String(value)}
                </span>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
