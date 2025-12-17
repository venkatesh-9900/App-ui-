"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getAawGroupedTransactionInfo, TransactionDetails } from '@/types/aaw-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'; // Use Separator for horizontal lines
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { listAAWDetails, listTransactionDetailsAAW } from '@/hooks/aaw-details-service'
import { ProtectedRoute } from "@/components/protected-route"
import TxnSummaryCard from '@/components/notifications/aaw-details/txn-summary-card';
import TxnTable from '@/components/notifications/aaw-details/txn-table';
import TxnDetailsSideBar from '@/components/notifications/aaw-details/txn-details-side-bar';
import TxnFilterBar from '@/components/notifications/aaw-details/txn-filter-bar'; // NEW IMPORT
import { Button } from '@/components/ui/button';

// Define the grouping type options
type GroupingType = 'asset' | 'category';

export default function AAWDetailsPage() {
    const searchParams = useSearchParams();
    const LIMIT = 10;
    const CARD_LIMIT = 3;
    const watcher_id = searchParams.get('watcher_id');
    const start_cursor = searchParams.get('start_cursor');
    const end_cursor = searchParams.get('end_cursor');
    const [groupInfo, setGroupInfo] = useState<getAawGroupedTransactionInfo | null>(null);
    const [transactions, setTransactions] = useState<TransactionDetails[] | null>([]);
    const [selectedKey, setSelectedKey] = useState<string>("ETH");
    const [page, setPage] = useState(1);
    const [isLocading, setIsLoading] = useState(true);
    const [isGroupLoading, setIsGroupLoading] = useState(false);
    const [isTransactionLoading, setIsTransactionLoading] = useState(false);
    const [groupingType, setGroupingType] = useState<GroupingType>('asset');
    const [selectedEvent, setSelectedEvent] = useState<TransactionDetails | null>(null);
    const [startIndex, setStartIndex] = useState(0);

    const fetchGroupInfo = useCallback(() => {
        if (!watcher_id) return;
        setIsGroupLoading(true);
        listAAWDetails({
            watcher_id: Number(watcher_id),
            start_cursor: Number(start_cursor ?? 0),
            end_cursor: Number(end_cursor ?? 10),
            filter_by: groupingType.toLowerCase(), // asset | category
            successTask: (res) => {
                setGroupInfo(res);

                const keys = Object.keys(res.data || {});
                if (keys.length > 0) {
                    setSelectedKey(keys[0]); // default selection
                    setPage(1);
                }
                setIsGroupLoading(false);
                setIsLoading(false);
            },
            failureTask: () => {
                toast.error("Failed to load group info")
                setIsGroupLoading(false);
                setIsLoading(false);
            },
            errorTask: () => {
                toast.error("Error loading group info")
                setIsGroupLoading(false);
                setIsLoading(false);
            },
        });
    }, [watcher_id, start_cursor, end_cursor, groupingType]);

    const fetchTransactionDetails = useCallback(() => {
        if (!selectedKey || !watcher_id) return;
        setIsTransactionLoading(true);
        listTransactionDetailsAAW({
            watcher_id: Number(watcher_id),
            start_cursor: Number(start_cursor ?? 0),
            end_cursor: Number(end_cursor ?? 10),
            filter_by: groupingType.toLowerCase(),
            filter_value: selectedKey,
            page,
            limit: LIMIT,
            successTask: (res) => {
                setTransactions(res.data);
                setIsTransactionLoading(false);
            },
            failureTask: () => {
                toast.error("Failed to load transactions")
                setIsTransactionLoading(false);
            },
            errorTask: () => {
                toast.error("Error loading transactions")
                setIsTransactionLoading(false);
            },
        });
    }, [selectedKey, page, groupingType]);

    // On page load & grouping change
    useEffect(() => {
        fetchGroupInfo();
    }, [fetchGroupInfo]);

    // On selected group or page change
    useEffect(() => {
        fetchTransactionDetails();
    }, [fetchTransactionDetails]);

    const handleCardClick = (key: string) => {
        setSelectedKey(key);
        setPage(1); // reset pagination
    };

    const groupKeys = useMemo(
        () => (groupInfo ? Object.keys(groupInfo.data) : []),
        [groupInfo]
    );

    const totalCards = groupKeys.length;
    const hasOverflow = totalCards > CARD_LIMIT;

    const showPrev = startIndex >= 0;
    const showNext = startIndex + CARD_LIMIT < totalCards;
    const visibleKeys = useMemo(
        () => groupKeys.slice(startIndex, startIndex + CARD_LIMIT),
        [groupKeys, startIndex]
    );
    const handlePrev = () => {
        setStartIndex((prev) => Math.max(0, prev - CARD_LIMIT));
    };

    const handleNext = () => {
        setStartIndex((prev) =>
            Math.min(totalCards - CARD_LIMIT, prev + CARD_LIMIT)
        );
    };

    const setSelectedEvents = (event: TransactionDetails) => {
        setSelectedEvent(event);
    }

    if (isLocading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!groupInfo) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-lg font-medium text-muted-foreground">
                        No details available
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                        There is no data to display for this watcher Id {watcher_id}.
                    </p>
                </div>
            </div>
        )
    }


    // Format Header Time
    const startTime = new Date(groupInfo?.start_time).toLocaleString("en-US", {
        hour12: true,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
    const endTime = new Date(groupInfo.end_time).toLocaleString("en-US", {
        hour12: true,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
    const timeRange = `${startTime} - ${endTime}`;


    return (
        <ProtectedRoute>
            <div className="px-4 py-2 flex-1">
                <Card className="shadow-lg h-full flex flex-col gap-2 py-2">
                    <CardHeader className="pb-0">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <CardTitle className="text-xl font-bold">
                                <span className="text-foreground">{groupInfo?.watcher_name}</span>
                            </CardTitle>
                            <p className="text-sm">
                                {timeRange} | <span className="font-semibold text-foreground">{groupInfo?.count}</span> Events
                            </p>
                        </div>
                        <Separator />
                    </CardHeader>

                    <CardContent className="px-4 flex flex-1">
                        <div className="flex flex-1 item-start space-x-6">

                            {/* Main Content Area (Cards and Table) */}
                            <div className="flex-1 space-y-6">
                                <div className="relative group/cardNav mb-2">
                                    {/* Cards */}
                                    <div className='min-h-42'>
                                        {isGroupLoading ? (
                                            <div className="flex justify-center items-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-1">
                                                {groupInfo &&
                                                    visibleKeys.map((key) => {
                                                        const value = groupInfo.data[key]; // ✅ properly typed

                                                        if (!value) return null;

                                                        return (
                                                            <TxnSummaryCard
                                                                key={key}
                                                                groupingKey={key}
                                                                groupingType={groupingType}
                                                                count={value.count}
                                                                addresses={value.addresses}
                                                                isActive={key === selectedKey}
                                                                onCardClick={handleCardClick}
                                                            />
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>


                                    {/* Prev */}
                                    {hasOverflow && (
                                        <Button
                                            onClick={handlePrev}
                                            disabled={!showPrev}
                                            variant="outline"
                                            size="icon"
                                            className={`
                                            absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2
                                            h-8 w-8 rounded-full bg-background shadow-lg border border-border z-10
                                            transition-opacity duration-200 cursor-pointer
                                            ${showPrev ? 'opacity-0 group-hover/cardNav:opacity-100' : 'opacity-0 pointer-events-none'}
                                        `}
                                            aria-label="Previous cards"
                                        >
                                            ‹
                                        </Button>
                                    )}

                                    {/* Next */}
                                    {hasOverflow && (
                                        <Button
                                            onClick={handleNext}
                                            disabled={!showNext}
                                            variant="outline"
                                            size="icon"
                                            className={`
                                                    absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2
                                                    h-8 w-8 rounded-full bg-background shadow-lg border border-border z-10
                                                    transition-opacity duration-200 cursor-pointer
                                                    ${showNext ? 'opacity-0 group-hover/cardNav:opacity-100' : 'opacity-0 pointer-events-none'}
                                                `}
                                            aria-label="Next cards"
                                        >
                                            ›
                                        </Button>
                                    )}
                                </div>


                                {/* Events Table (Below the selected card) */}
                                <div className='min-h-124'>
                                    {isTransactionLoading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                        </div>
                                    ) : (
                                        <div>
                                            <TxnTable
                                                events={transactions}
                                                page={page}
                                                limit={LIMIT}
                                                totalCount={groupInfo.data[selectedKey]?.count ?? 0}
                                                onNext={() => setPage((p) => p + 1)}
                                                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                                                onRowClick={setSelectedEvents}
                                            />
                                        </div>
                                    )}
                                </div>


                            </div>

                            {/* Right Sidebar (Extracted Component) */}
                            <div className="shrink-0 h-full self-stretch">
                                <TxnFilterBar
                                    groupingType={groupingType}
                                    setGroupingType={setGroupingType}
                                />
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* Event Details Side Panel */}
                {selectedEvent && (
                    <TxnDetailsSideBar
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}
            </div>
        </ProtectedRoute>
    )
}