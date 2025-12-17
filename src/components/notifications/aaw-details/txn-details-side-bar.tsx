"use client"
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TransactionDetails } from '@/types/aaw-details';
import { formatDate, truncateText } from '@/utils/formatting';
import { CopyButton } from '@/components/ui/copy-button';

// 1. Utility component for address handling (Truncation and Copy)
const AddressDetailRow = ({
    label,
    address,
}: {
    label: string;
    address: string;
}) => {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
            <Label className="text-sm text-muted-foreground">{label}:</Label>
            <div className="flex items-center gap-2">
                <span className="text-sm text-foreground" title={address}>{truncateText(address)}</span>
                <CopyButton content={address} variant="ghost" size="sm" />
            </div>
        </div>
    );
};


// 2. Utility component for general details
const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
    console.log('Rendering DetailRow:', label, value),
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
        <Label className="text-sm text-muted-foreground">{label}:</Label>
        <span className="text-sm text-foreground text-right break-all ">{value}</span>
    </div>
);


// 3. Main Panel Component
interface TxnDetailsSideBarProps {
    event: TransactionDetails;
    onClose: () => void;
}

export default function TxnDetailsSideBar({ event, onClose }: TxnDetailsSideBarProps) {
    const formattedTimestamp = useMemo(() => {
        try {
            const timestampInSeconds = parseInt(event.blockTimestamp.slice(2), 16);
            return new Date(timestampInSeconds * 1000).toLocaleString();
        } catch {
            return 'Invalid Timestamp';
        }
    }, [event.blockTimestamp]);
    console.log('Rendering EventDetailsPanel for event:', event);


    return (
        // Mimicking a shadcn Sheet component with fixed positioning
        <div className="fixed top-0 right-0 h-full w-[360px] bg-card text-card-foreground shadow-2xl z-50">
            {/* The entire panel content needs to be scrollable if it exceeds screen height */}
            <ScrollArea className="h-full">

                {/* --- Main Card Container for the entire panel --- */}
                <Card className="shadow-none border-none h-full rounded-none py-0 gap-2">

                    {/* 1. Header: Event Details Title, Badge, and Close Button */}
                    <CardHeader className="flex flex-row items-start justify-between px-6 py-4 pb-0 border-border sticky top-0 bg-card z-10">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-2xl font-bold">
                                Event Details
                            </CardTitle>
                        </div>

                        {/* Close Button */}
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer ml-4"
                            aria-label="Close details"
                        >
                            <span className="text-2xl">&times;</span>
                        </Button>
                    </CardHeader>
                    <Separator className="mt-1" />
                    {/* 2. Content Area for Details Cards */}
                    <CardContent className='p-6 pt-4'>
                        <DetailRow label="Asset Type" value={event.asset} />
                        <DetailRow label="Value" value={event.value} />
                        <AddressDetailRow label="From Address" address={event.fromAddress} />
                        <AddressDetailRow label="To Address" address={event.toAddress} />
                        <AddressDetailRow label="Event Hash" address={event.hash} />
                        <DetailRow label="Block Number" value={event.blockNum} />
                        <DetailRow label="Timestamp" value={formatDate(event.blockTimestamp)} />

                    </CardContent>
                </Card>
            </ScrollArea>
        </div>
    );
}