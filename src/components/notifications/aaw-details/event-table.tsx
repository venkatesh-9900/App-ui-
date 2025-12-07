// src/components/EventsTable.tsx
import { EventDetails } from '@/types/aaw-details';
import { useState, useMemo, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface EventsTableProps {
    events: EventDetails[];
    onRowClick: (event: EventDetails) => void;
}

// Define the number of rows to show per page
const ROWS_PER_PAGE = 5;

export default function EventsTable({ events, onRowClick }: EventsTableProps) {
    const [currentPage, setCurrentPage] = useState(0);

     useEffect(() => {
        setCurrentPage(0);
    }, [events]);

    // Calculate total number of pages
    const pageCount = useMemo(() => {
        return Math.ceil(events.length / ROWS_PER_PAGE);
    }, [events.length]);

    // Determine the events to display on the current page
    const currentEvents = useMemo(() => {
        const startIndex = currentPage * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return events.slice(startIndex, endIndex);
    }, [events, currentPage]);

    // Handlers for pagination controls
    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, pageCount - 1));
    };

    const goToPrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };

    if (events.length === 0) {
        return <div className="text-center py-8 text-gray-400">No events found for this selection.</div>;
    }

    return (

        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border relative flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <Table className="w-full border-collapse">
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="px-4 py-2 text-left w-1/4 min-w-max">
                                    <div className="flex items-center gap-1">
                                        {/* <T className="w-4 h-4" /> */}
                                        <span>Timestamp</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                                    <div className="flex items-center gap-1">
                                        {/* <Key className="w-4 h-4" /> */}
                                        <span>From</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        {/* <Calendar className="w-4 h-4" /> */}
                                        <span>To</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        {/* <Clock className="w-4 h-4" /> */}
                                        <span>Category</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-right w-20 min-w-max">
                                    Block
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {currentEvents.map((event, index) => (
                                <TableRow key={event.hash + index} className="hover:bg-muted/50" onClick={() => onRowClick(event)}>
                                    <TableCell className="px-4 py-3 w-1/4 min-w-max">
                                        <div className="font-medium truncate">{new Date(parseInt(event.blockTimestamp.slice(2), 16) * 1000).toLocaleTimeString()}</div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-2/5 min-w-max">
                                        <div className="flex items-center gap-2">
                                            {event.fromAddress}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm">
                                        {event.toAddress}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm text-muted-foreground">
                                        {event.category}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 w-20 min-w-max text-right">
                                        {event.blockNum}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center text-sm px-2 text-muted-foreground">
                <span className="text-sm text-muted-foreground">
                    Showing {currentPage * ROWS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ROWS_PER_PAGE, events.length)} of {events.length} results
                </span>
                <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </Button>

                    {/* Page Info */}
                    <span className="text-sm font-medium">
                        Page {currentPage + 1} of {pageCount}
                    </span>

                    {/* Next Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= pageCount - 1}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>

    );
}