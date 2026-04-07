"use client"

import { TransactionDetails } from "@/types/aaw-details"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { truncateText, formatDate } from "@/utils/formatting"
import { CopyButton } from "@/components/ui/copy-button"
import { Activity, Calendar } from "lucide-react"
import { IconBlocks } from "@tabler/icons-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

interface TxnTableProps {
  txn?: TransactionDetails[] | null
  onRowClick: (txn: TransactionDetails) => void
  selectedTxnIds: Set<string>
  onToggleTxn: (txn: TransactionDetails) => void
  isLoading?: boolean
}

export default function TxnTable({
  txn,
  onRowClick,
  selectedTxnIds,
  onToggleTxn,
  isLoading,
}: TxnTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="px-4 py-2 w-12" />
              <TableHead className="px-4 py-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Timestamp
                </div>
              </TableHead>
              <TableHead className="px-4 py-2">
                <Activity className="w-4 h-4 inline mr-1" />
                From
              </TableHead>
              <TableHead className="px-4 py-2">
                <Activity className="w-4 h-4 inline mr-1" />
                To
              </TableHead>
              <TableHead className="px-4 py-2">
                <IconBlocks className="w-4 h-4 inline mr-1" />
                Block Num
              </TableHead>
            </TableRow>
          </TableHeader>

           <TableBody>
             {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <TableRow key={i}>
                   <TableCell className="px-4 py-2"><Skeleton className="h-4 w-4" /></TableCell>
                   <TableCell className="px-4 py-2"><Skeleton className="h-4 w-32" /></TableCell>
                   <TableCell className="px-4 py-2"><Skeleton className="h-4 w-40" /></TableCell>
                   <TableCell className="px-4 py-2"><Skeleton className="h-4 w-40" /></TableCell>
                   <TableCell className="px-4 py-2"><Skeleton className="h-4 w-20" /></TableCell>
                 </TableRow>
               ))
             ) : txn?.length === 0 ? (
               <TableRow>
                 <TableCell
                   colSpan={5}
                   className="text-center py-6 text-muted-foreground"
                 >
                   No transactions found
                 </TableCell>
               </TableRow>
             ) : (
               txn?.map((t) => (
                 <TableRow
                   key={t.hash}
                   className="cursor-pointer hover:bg-muted/50"
                   onClick={() => onRowClick(t)}
                 >
                   <TableCell
                     className="px-4 py-2"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Checkbox
                       checked={selectedTxnIds.has(t.hash)}
                       onCheckedChange={() => onToggleTxn(t)}
                       onClick={(e) => e.stopPropagation()}
                       className="cursor-pointer"
                     />
                   </TableCell>
 
                   <TableCell className="px-4 py-2">
                     {formatDate(t.blockTimestamp)}
                   </TableCell>
 
                   <TableCell className="px-4 py-2">
                     <div className="flex items-center gap-2">
                       <span>{truncateText(t.fromAddress)}</span>
                       <CopyButton
                         content={t.fromAddress}
                         variant="ghost"
                         size="sm"
                         onClick={(e) => e.stopPropagation()}
                       />
                     </div>
                   </TableCell>
 
                   <TableCell className="px-4 py-2">
                     <div className="flex items-center gap-2">
                       <span>{truncateText(t.toAddress)}</span>
                       <CopyButton
                         content={t.toAddress}
                         variant="ghost"
                         size="sm"
                         onClick={(e) => e.stopPropagation()}
                       />
                     </div>
                   </TableCell>
 
                   <TableCell className="px-4 py-2">
                     {t.blockNum}
                   </TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
        </Table>
      </div>
    </div>
  )
}
