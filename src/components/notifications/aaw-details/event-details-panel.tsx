"use client"
import React, { useCallback, useMemo } from 'react';
import { EventDetails } from '@/types/aaw-details';
import { Button } from '@/components/ui/button'; // Assuming you have this
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have this for content scrolling
import { Badge } from '@/components/ui/badge'; // Assuming you have this
import { Label } from '@/components/ui/label'; // Assuming you have this
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// 1. Utility component for address handling (Truncation and Copy)
const AddressDetailRow = ({ label, address }: { label: string, address: string }) => {

    const truncatedAddress = useMemo(() => {
        if (!address || address.length <= 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }, [address]);

    return (
        <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
            <Label className="text-sm text-muted-foreground">{label}:</Label>
            <div className="flex items-center space-x-2">
                <span
                    className="text-sm text-primary font-mono cursor-help hover:text-indigo-400 transition-colors"
                    title={address}
                >
                    {truncatedAddress}
                </span>
            </div>
        </div>
    );
};

// 2. Utility component for general details
const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
        <Label className="text-sm text-muted-foreground">{label}:</Label>
        <span className="text-sm text-foreground text-right">{value}</span>
    </div>
);


// 3. Main Panel Component
interface EventDetailsPanelProps {
    event: EventDetails;
    onClose: () => void;
}

export default function EventDetailsPanel({ event, onClose }: EventDetailsPanelProps) {
    const formattedTimestamp = useMemo(() => {
        try {
            const timestampInSeconds = parseInt(event.blockTimestamp.slice(2), 16);
            return new Date(timestampInSeconds * 1000).toLocaleString();
        } catch {
            return 'Invalid Timestamp';
        }
    }, [event.blockTimestamp]);


    return (
        // Mimicking a shadcn Sheet component with fixed positioning
        <div className="fixed top-0 right-0 h-full w-90 bg-card text-card-foreground shadow-2xl z-50">
            {/* The entire panel content needs to be scrollable if it exceeds screen height */}
            <ScrollArea className="h-full">

                {/* --- Main Card Container for the entire panel --- */}
                <Card className="shadow-none border-none h-full rounded-none py-0 gap-2">

                    {/* 1. Header: Event Details Title, Badge, and Close Button */}
                    <CardHeader className="flex flex-row items-start justify-between p-6 pb-0 border-border sticky top-0 bg-card z-10">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-2xl font-bold">
                                Event Details
                            </CardTitle>
                            <Badge variant="outline" className="w-fit">{event.category.toUpperCase()}</Badge>
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
                        <DetailRow label="Event Hash" value={event.hash} />
                        <DetailRow label="Block Number" value={event.blockNum} />
                        <DetailRow label="Timestamp" value={formattedTimestamp} />

                    </CardContent>
                </Card>
            </ScrollArea>
        </div>
    );
}