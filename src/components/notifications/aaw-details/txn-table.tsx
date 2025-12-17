"use client"
import { TransactionDetails } from '@/types/aaw-details';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { truncateText, formatDate } from '@/utils/formatting';
import { CopyButton } from '@/components/ui/copy-button';
import { Activity, Calendar } from 'lucide-react';
import { IconBlocks, IconCategory } from '@tabler/icons-react';

interface TxnTableProps {
    events?: TransactionDetails[] | null;
    page: number;
    limit: number;
    totalCount: number;
    onNext: () => void;
    onPrev: () => void;
    onRowClick: (event: TransactionDetails) => void;
}

export default function TxnTable({
    events,
    page,
    limit,
    totalCount,
    onNext,
    onPrev,
    onRowClick,
}: TxnTableProps) {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalCount);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Timestamp</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-4 h-4" />
                                        <span>From</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-4 h-4" />
                                        <span>To</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <IconCategory className="w-4 h-4" />
                                        <span>Category</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <IconBlocks className="w-4 h-4" />
                                        <span>Block Num</span>
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {events?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            )}

                            {events?.map((event) => (
                                <TableRow
                                    key={event.hash}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => onRowClick(event)}
                                >
                                    <TableCell className="px-4 py-2 w-1/6 min-w-max">
                                        <div className="flex items-center gap-2">
                                            {formatDate(event.blockTimestamp)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 w-1/6 min-w-max">
                                        <div className="flex items-center gap-2">
                                            <span className='relative group'>{truncateText(event.fromAddress)}
                                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1
                                                                hidden group-hover:block whitespace-nowrap
                                                                rounded bg-popover text-popover-foreground
                                                                px-2 py-1 text-xs shadow-md z-50">
                                                    {event.fromAddress}
                                                </span>
                                            </span>
                                            <CopyButton content={event.fromAddress} variant="ghost" size="sm" delay={2000} onClick={e => e.stopPropagation()} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 w-1/6 min-w-max">
                                        <div className="flex items-center gap-2">
                                            <span className='relative group'>{truncateText(event.toAddress)}
                                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1
                                                                hidden group-hover:block whitespace-nowrap
                                                                rounded bg-popover text-popover-foreground
                                                                px-2 py-1 text-xs shadow-md z-50">
                                                    {event.toAddress}
                                                </span>
                                            </span>
                                            <CopyButton content={event.toAddress} variant="ghost" size="sm" delay={2000} onClick={e => e.stopPropagation()} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 w-1/6 min-w-max">
                                        <div className="flex items-center gap-2">
                                            {event.category}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 w-1/6 min-w-max">
                                        <div className="flex items-center gap-2">
                                            {event.blockNum}
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                    Showing {start}–{end} of {totalCount}
                </span>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrev}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>

                    <span className="font-medium">
                        Page {page} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
