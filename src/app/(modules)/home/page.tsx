"use client";

import { ProtectedRoute } from '@/components/protected-route';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

const prompts = [
    {
        title: "Find out latest news and information about '0xde.....8as' account address.",
    },
    {
        title: 'Is this address "0xjr....w90" suspicious for making payments?',
    },
    {
        title:
            'Find me everything about this transaction "0xbtg.....aj5" as I want to understand the risks associated with parties and activities involved.',
    },
    {
        title:
            'Add "0xpr5.....yw1" into monitoring watchlist and flag any activity involved with any sanctioned wallets.',
    },
    {
        title: "What are recent activities from all the accounts and address I am monitoring?",
    },
    {
        title:
            "Create a detailed investigative report on USDC stablecoin and who are holding majority of its reserve?",
    },
    {
        title:
            'Notify me over email if any activity happens on "0x45d....yt3" in ethereum main net.',
    },
];

export default function HomePage() {
    return (
        <ProtectedRoute>
            <div className="flex items-center gap-2 md:hidden">
                <SidebarTrigger/>
            </div>
            <div className="flex flex-col items-center justify-start py-16 px-6">
                {/* Heading */}
                <h1 className="text-3xl font-semibold mb-12">
                    Analyze transactions, addresses, and more.
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl auto-rows-fr">
                    {prompts.map((prompt, index) => (
                        <Link 
                            key={index} 
                            href={`/chat?prompt=${encodeURIComponent(prompt.title)}`}
                            className="group h-full"
                        >
                            <Card className="h-full flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                <CardContent className="p-6 flex items-center justify-center h-full">
                                    <p className="text-sm text-muted-foreground text-center leading-relaxed group-hover:text-blue-400 transition-colors">
                                        {prompt.title}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </ProtectedRoute>
    );
}
