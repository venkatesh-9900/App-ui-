"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TransactionDetails } from '@/types/aaw-details';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';

// Define the grouping type options (export this if not done elsewhere)
type GroupingType = 'asset' | 'category';

const GROUPING_OPTIONS: { label: string; value: GroupingType }[] = [
    { label: 'Asset', value: 'asset' },
    { label: 'Category', value: 'category' },
];


interface TxnFilterBarProps {
    groupingType: GroupingType;
    setGroupingType: (type: GroupingType) => void;
    onAskAI: () => void;
    selectedTxns: Map<string, TransactionDetails>
}

export default function TxnFilterBar({ groupingType, setGroupingType, onAskAI, selectedTxns }: TxnFilterBarProps) {
    return (

        <Card className="w-80 shadow-lg p-4 flex flex-col h-full bg-card text-card-foreground">
            <CardHeader className="p-0 mb-0 gap-0 border-border">
                <CardTitle className="text-lg font-semibold">Clusters</CardTitle>
                <Separator className="mt-4" />
            </CardHeader>
            <CardContent className='p-0 pt-0 flex flex-col justify-between flex-grow'>
                {/* --- Top Section: Grouping Type Selection --- */}
                <div>
                    <div className="flex flex-col gap-2">
                        {GROUPING_OPTIONS.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => setGroupingType(option.value)}
                                className={`
                                    px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
                                    ${groupingType === option.value
                                        ? 'bg-primary text-primary-foreground shadow-md' // Active state uses primary theme color
                                        : 'text-muted-foreground hover:bg-muted' // Inactive state uses muted colors
                                    }
                                `}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-border mt-auto">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {/* Wrapper is key */}
                                <div
                                    className={cn(
                                        "w-full",
                                        selectedTxns.size === 0
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer"
                                    )}
                                >
                                    <Button
                                        className="w-full flex justify-start items-center gap-2"
                                        onClick={onAskAI}
                                        disabled={selectedTxns.size === 0}
                                    >
                                        <span className="text-lg">🔍</span>
                                        <span>Analyze transaction with AI</span>
                                    </Button>
                                </div>
                            </TooltipTrigger>

                            {/* Tooltip only when disabled */}
                            {selectedTxns.size === 0 && (
                                <TooltipContent side="top" align="center">
                                    Select one or more transactions to enable AI analysis
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    <p className="text-xs text-muted-foreground mt-2">
                        Use AI to analyze patterns and relationships across selected transaction clusters.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}