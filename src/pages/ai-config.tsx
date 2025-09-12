import {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bot, Users, Save } from "lucide-react";
import {Team} from "@/types";
import {fetchAllTeams} from "@/hooks";
import TeamConfigurator from "@/components/ai/team-configurator.tsx";

export default function AIConfigPage() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      const { selectedTeamId, teams } = await fetchAllTeams();
      setTeams(teams);
      setSelectedTeamId(selectedTeamId ?? 1);
    };
    loadTeams();
  }, []);


  const [selectedTeam, setSelectedTeam] = useState("");
  const [configuration, setConfiguration] = useState({
    maxTokens: "4096",
    temperature: "0.7",
    topP: "0.9",
    frequencyPenalty: "0.0",
    presencePenalty: "0.0",
    systemPrompt: "",
    contextWindow: "8192",
    responseFormat: "text",
    enableStreaming: true,
    enableLogging: true
  });


  const handleSaveConfiguration = () => {
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team before saving configuration.",
        variant: "destructive"
      });
      return;
    }

    // In real app, this would save to API
    toast({
      title: "Configuration Saved",
      description: `Configuration for team "${selectedTeam}" has been saved successfully.`
    });
  };

  const handleResetConfiguration = () => {
    setConfiguration({
      maxTokens: "4096",
      temperature: "0.7",
      topP: "0.9",
      frequencyPenalty: "0.0",
      presencePenalty: "0.0",
      systemPrompt: "",
      contextWindow: "8192",
      responseFormat: "text",
      enableStreaming: true,
      enableLogging: true
    });
    setSelectedTeam("");

    toast({
      title: "Configuration Reset",
      description: "All configuration settings have been reset to defaults."
    });
  };

  return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Configuration</h1>
          <p className="text-slate-600">
            Configure AI models and parameters for your agent teams
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamConfigurator selectedTeamId={selectedTeamId} teams={teams} />

          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Model Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Max Tokens</Label>
                  <Input
                      type="number"
                      value={configuration.maxTokens}
                      onChange={(e) => setConfiguration({...configuration, maxTokens: e.target.value})}
                      className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Temperature</Label>
                  <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={configuration.temperature}
                      onChange={(e) => setConfiguration({...configuration, temperature: e.target.value})}
                      className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Top P</Label>
                  <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={configuration.topP}
                      onChange={(e) => setConfiguration({...configuration, topP: e.target.value})}
                      className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Context Window</Label>
                  <Input
                      type="number"
                      value={configuration.contextWindow}
                      onChange={(e) => setConfiguration({...configuration, contextWindow: e.target.value})}
                      className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Frequency Penalty</Label>
                  <Input
                      type="number"
                      step="0.1"
                      min="-2"
                      max="2"
                      value={configuration.frequencyPenalty}
                      onChange={(e) => setConfiguration({...configuration, frequencyPenalty: e.target.value})}
                      className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Presence Penalty</Label>
                  <Input
                      type="number"
                      step="0.1"
                      min="-2"
                      max="2"
                      value={configuration.presencePenalty}
                      onChange={(e) => setConfiguration({...configuration, presencePenalty: e.target.value})}
                      className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Response Format</Label>
                <Select value={configuration.responseFormat} onValueChange={(value) => setConfiguration({...configuration, responseFormat: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt Configuration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Prompt Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">System Prompt</Label>
                <Textarea
                    value={configuration.systemPrompt}
                    onChange={(e) => setConfiguration({...configuration, systemPrompt: e.target.value})}
                    placeholder="Enter the system prompt for the selected team..."
                    className="mt-1 h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      id="enableStreaming"
                      checked={configuration.enableStreaming}
                      onChange={(e) => setConfiguration({...configuration, enableStreaming: e.target.checked})}
                      className="rounded border-slate-300"
                  />
                  <Label htmlFor="enableStreaming" className="text-sm font-medium text-slate-600">Enable Streaming</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      id="enableLogging"
                      checked={configuration.enableLogging}
                      onChange={(e) => setConfiguration({...configuration, enableLogging: e.target.checked})}
                      className="rounded border-slate-300"
                  />
                  <Label htmlFor="enableLogging" className="text-sm font-medium text-slate-600">Enable Logging</Label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                    onClick={handleSaveConfiguration}
                    disabled={!selectedTeam}
                    className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </Button>
                <Button
                    variant="outline"
                    onClick={handleResetConfiguration}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}