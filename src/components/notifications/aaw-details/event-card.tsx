// src/components/EventCard.tsx
import { EventDetails } from '@/types/aaw-details';
import { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
    groupingKey: string;
    groupingType: 'Asset' | 'Category';
    events: EventDetails[];
    onCardClick: (key: string) => void;
    isActive: boolean;
}


// Helper component to display and truncate addresses
const TruncatedAddress = ({ address }: { address: string }) => {
    const truncated = address.length > 20
        ? `${address.substring(0, 8)}...${address.substring(address.length - 4)}`
        : address;

    return (
        <p title={address} className="truncate text-xs font-mono text-muted-foreground">
            {truncated}
        </p>
    );
};

export default function EventCard({ groupingKey, groupingType, events, onCardClick, isActive }: EventCardProps) {
    const totalEvents = events.length;

    const uniqueAddresses = useMemo(() => {
        const addresses = new Set<string>();
        events.forEach(e => {
            addresses.add(e.fromAddress);
            addresses.add(e.toAddress);
        });
        return Array.from(addresses)
    }, [events]);

    // Addresses to display (limit 2)
    const addressesToDisplay = useMemo(() => {
        return uniqueAddresses.slice(0, 2);
    }, [uniqueAddresses]);

    // Calculate the number of addresses hidden
    const hiddenAddressCount = uniqueAddresses.length - addressesToDisplay.length;

    return (
        <Card
            className={`
                cursor-pointer gap-0 py-0 transition-colors border-2 h-52 flex flex-col
                ${isActive
                    ? 'border-primary shadow-lg bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50'
                }
            `}
            onClick={() => onCardClick(groupingKey)}
        >
            {/* 1. Header Section with Title and Badge */}
            <CardHeader className="px-4 py-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold leading-snug truncate max-w-[70%]">
                        {/* Ensure the title itself can't push the card out */}
                        {groupingKey}
                    </CardTitle>
                    <Badge variant="secondary" className="h-5 text-xs flex-shrink-0">
                        {groupingType}
                    </Badge>
                </div>
            </CardHeader>

            {/* 2. Content Section with Event Count and Addresses */}
            <CardContent className="px-4 py-3 pt-0 flex flex-col justify-start flex-grow">
                <div className='mb-1'>
                    <p className="text-3xl font-bold text-foreground mb-1 overflow-hidden whitespace-nowrap">
                        {totalEvents} events
                    </p>
                </div>

                {/* Unique Addresses Section */}
                <div className="space-y-1 pt-3 border-t border-border/70 mt-auto">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Involved Addresses:</p>

                    {/* Map only the limited set of addresses */}
                    {addressesToDisplay.map((addr) => (
                        <TruncatedAddress key={addr} address={addr} />
                    ))}

                    {/* 🎯 NEW LOGIC: Show "+N more" or a stabilization spacer */}
                    {hiddenAddressCount > 0 ? (
                        // If more than 2, show the count of hidden addresses
                        <p className="text-xs font-medium text-primary/80 mt-1 cursor-help hover:underline">
                            +{hiddenAddressCount} more
                        </p>
                    ) : (
                        // If only one address was displayed, add the spacer for height stability
                        addressesToDisplay.length === 1 && <div className="h-[14px]"></div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}