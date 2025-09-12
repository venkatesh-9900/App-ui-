"use client";

import {TeamConfiguratorProps} from "@/types/teams.ts";
import {useEffect, useState} from 'react';
import {Users} from 'lucide-react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "../ui/skeleton";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {saveSelectedTeamConfig} from "@/hooks";
import {useToast} from "@/hooks/use-toast";

export default function TeamConfigurator({ teams, selectedTeamId: initialSelectedTeamId }: TeamConfiguratorProps) {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (teams.length > 0 && initialSelectedTeamId !== null) {
            setSelectedTeamId(String(initialSelectedTeamId));
        }
        setIsMounted(true);
    }, [teams, initialSelectedTeamId]);


    const selectedTeam = teams.find(
        (team) => team.team_id === Number(selectedTeamId)
    );


    const handleTeamSelect = async (value: string) => {
        setSelectedTeamId(value);
        try {
            await saveSelectedTeamConfig(parseInt(value));
            toast({
                title: "Success",
                description: `Team "${teams.find(t => t.team_id === parseInt(value))?.team_name}" has been saved successfully.`,
            });
            setLastSaved(new Date()); // optionally track last saved time
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save team configuration. Please try again.",
                variant: "destructive",
            });
            console.error("Save failed:", error);
        }
    };

    if (!isMounted) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 rounded-md" />
                    <Skeleton className="mt-2 h-4 w-1/2 rounded-md" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-6 w-1/3 rounded-md" />
                </CardFooter>
            </Card>
        );
    }

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Selection
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-sm font-medium text-slate-600">Select Team</Label>
                    <Select value={selectedTeamId ?? ''} onValueChange={handleTeamSelect}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose a team to configure" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map((team) => (
                                <SelectItem key={team.team_id} value={team.team_id.toString()}>
                                    {team.team_name.charAt(0).toUpperCase() + team.team_name.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedTeam && (
                    <div className="pt-4 animate-in fade-in-50 duration-500">
                        <Separator />
                        <div className="mt-6 space-y-1.5">
                            <h3 className="text-lg font-semibold font-headline text-primary">
                                {selectedTeam.team_name.charAt(0).toUpperCase() + selectedTeam.team_name.slice(1)}
                            </h3>
                            <p className="text-sm text-muted-foreground">{selectedTeam.team_description}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        </>
    );
}