"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { AAWDetails, EventDetails } from '@/types/aaw-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'; // Use Separator for horizontal lines
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { listAAWDetails } from '@/hooks/aaw-details-service'
import { ProtectedRoute } from "@/components/protected-route"
import EventCard from '@/components/notifications/aaw-details/event-card';
import EventsTable from '@/components/notifications/aaw-details/event-table';
import EventDetailsPanel from '@/components/notifications/aaw-details/event-details-panel';
import EventSideBar from '@/components/notifications/aaw-details/event-side-bar'; // NEW IMPORT
import { Button } from '@/components/ui/button';

// Define the grouping type options
type GroupingType = 'Asset' | 'Category';

// Helper function to dynamically group the events (kept outside the component)
const groupEvents = (events: EventDetails[], type: GroupingType) => {
    // Define a map from GroupingType to the property key on EventDetails
    const propertyMap: Record<GroupingType, keyof EventDetails> = {
        'Asset': 'asset',
        'Category': 'category',
    };

    const groupingProperty = propertyMap[type];

    return events.reduce((acc, event) => {
        // Use the dynamic property key
        const key = event[groupingProperty] as string;

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(event);
        return acc;
    }, {} as Record<string, EventDetails[]>);
};

export default function AAWDetailsPage() {
    const searchParams = useSearchParams();

    const watcher_id = searchParams.get('watcher_id');
    const start_cursor = searchParams.get('start_cursor');
    const end_cursor = searchParams.get('end_cursor');

    const [details, setDetails] = useState<AAWDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupingType, setGroupingType] = useState<GroupingType>('Asset');
    const [selectedKey, setSelectedKey] = useState<string | null>('ETH');
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
    const CARDS_PER_PAGE = 3;
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        fetchAAWDetails();
    }, []);

    const fetchAAWDetails = async () => {
        setIsLoading(true)
        await listAAWDetails({
            watcher_id: watcher_id ? parseInt(watcher_id) : 0,
            start_cursor: start_cursor ? parseInt(start_cursor) : 0,
            end_cursor: end_cursor ? parseInt(end_cursor) : 10,
            successTask: (response) => {
                if (response.data) {
                    setDetails(response)
                    // Ensure a key is selected after data loads
                    if (response.data.length > 0) {
                        const initialGroup = groupEvents(response.data, 'Asset');
                        setSelectedKey(Object.keys(initialGroup)[0] || null);
                    }
                }
                setIsLoading(false)
            },
            failureTask: () => {
                toast.error('Failed to load groups', {
                    description: 'Could not fetch aaw details. Please try again.',
                })
                setIsLoading(false)
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
                setIsLoading(false)
            },
        })
    }

    // Dynamic grouping based on groupingType state
    const groupedEvents = useMemo(() => {
        if (!details) return {};

        const groups = groupEvents(details.data, groupingType);

        // Reset or set the selected key when grouping type changes
        if (Object.keys(groups).length > 0) {
            // If the current selected key is not in the new groups, select the first one
            if (!groups[selectedKey as string]) {
                setSelectedKey(Object.keys(groups)[0]);
            }
        }

        return groups;
    }, [details, groupingType, selectedKey]);

    // Get the events for the currently selected asset to display in the table
    const currentEvents = useMemo(() => {
        return groupedEvents[selectedKey as string] || [];
    }, [selectedKey, groupedEvents]);

    const handleCardClick = useCallback((key: string) => {
        setSelectedKey(key);
    }, []);


    // Get the keys for iteration
    const groupKeys = useMemo(() => Object.keys(groupedEvents), [groupedEvents]);
    const totalGroups = groupKeys.length;

    // Determine the subset of keys to display
    const visibleGroupKeys = useMemo(() => {
        return groupKeys.slice(startIndex, startIndex + CARDS_PER_PAGE);
    }, [groupKeys, startIndex]);

    // Determine if navigation buttons should be active
    const showPrev = startIndex > 0;
    const showNext = startIndex + CARDS_PER_PAGE < totalGroups;

    // Navigation Handlers
    const handlePrev = useCallback(() => {
        setStartIndex(prev => Math.max(0, prev - CARDS_PER_PAGE));
    }, []);

    const handleNext = useCallback(() => {
        setStartIndex(prev => Math.min(totalGroups - CARDS_PER_PAGE, prev + CARDS_PER_PAGE));
    }, [totalGroups]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!details) {
        return (
            <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">No details available.</p>
            </div>
        )
    }

    // Format Header Time
    const startTime = new Date(details.start_time).toLocaleString("en-US", {
        hour12: true,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
    const endTime = new Date(details.end_time).toLocaleString("en-US", {
        hour12: true,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
    const timeRange = `${startTime} - ${endTime}`;


    return (
        <ProtectedRoute>
            <div className="p-4 flex-1">
                <Card className="shadow-lg h-full flex flex-col">
                    <CardHeader className="pb-0">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <CardTitle className="text-xl font-bold">
                                <span className="text-foreground">{details.watcher_name}</span>
                            </CardTitle>
                            <p className="text-sm">
                                {timeRange} | <span className="font-semibold text-foreground">{details.totalEvent}</span> Events
                            </p>
                        </div>
                        <Separator className="mt-4" />
                    </CardHeader>

                    <CardContent className="px-4 flex flex-1">
                        <div className="flex flex-1 space-x-6">

                            {/* Main Content Area (Cards and Table) */}
                            <div className="flex-1 space-y-6">
                                <div className="relative group/cardNav">

                                    {/* Card Grid Container - Renders only visible cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {visibleGroupKeys.map((key) => (
                                            <EventCard
                                                key={key}
                                                groupingKey={key}
                                                groupingType={groupingType}
                                                events={groupedEvents[key] || []}
                                                onCardClick={handleCardClick}
                                                isActive={key === selectedKey}
                                            />
                                        ))}
                                    </div>

                                    {/* Prev Button: Positioned absolutely on the left side of the container */}
                                    <Button
                                        onClick={handlePrev}
                                        disabled={!showPrev}
                                        variant="outline"
                                        size="icon"
                                        className={`
            h-8 w-8 absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 
            bg-background rounded-full shadow-lg z-10 border border-border cursor-pointer
            transition-all duration-200
            ${showPrev
                                                ? 'opacity-0 invisible group-hover/cardNav:opacity-100 group-hover/cardNav:visible'
                                                : 'opacity-0 invisible' // Always invisible if disabled
                                            }
        `}
                                        aria-label="Previous cards"
                                    >
                                        {'<'}
                                    </Button>

                                    {/* Next Button: Positioned absolutely on the right side of the container */}
                                    <Button
                                        onClick={handleNext}
                                        disabled={!showNext}
                                        variant="outline"
                                        size="icon"
                                        className={`
            h-8 w-8 absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 
            bg-background rounded-full shadow-lg z-10 border border-border cursor-pointer
            transition-all duration-200
            ${showNext
                                                ? 'opacity-0 invisible group-hover/cardNav:opacity-100 group-hover/cardNav:visible'
                                                : 'opacity-0 invisible' // Always invisible if disabled
                                            }
        `}
                                        aria-label="Next cards"
                                    >
                                        {'>'}
                                    </Button>
                                </div>

                                {/* Events Table (Below the selected card) */}
                                <div className="mt-8">
                                    <EventsTable
                                        events={currentEvents}
                                        onRowClick={setSelectedEvent}
                                    />
                                </div>
                            </div>

                            {/* Right Sidebar (Extracted Component) */}
                            <EventSideBar
                                groupingType={groupingType}
                                setGroupingType={setGroupingType}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Event Details Side Panel */}
                {selectedEvent && (
                    <EventDetailsPanel
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}
            </div>
        </ProtectedRoute>
    )
}