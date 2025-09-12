import { Button } from "@/components/ui/button";
import { MessageSquare, MoreHorizontal, Square } from "lucide-react";

interface ChatMessageTitleProps {
    conversationName: string;
    isThinking: boolean;
    onToggleSidebar: () => void;
    onStopLoading: () => void;
}

export function ChatMessageTitle({
                                     conversationName,
                                     isThinking,
                                     onToggleSidebar,
                                     onStopLoading,
                                 }: ChatMessageTitleProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSidebar}
                >
                    <MessageSquare className="w-4 h-4" />
                </Button>
                <h1 className="text-lg font-semibold">
                    {conversationName}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                {isThinking && (
                    <Button variant="ghost" size="sm" onClick={onStopLoading}>
                        <Square className="w-4 h-4" />
                        Stop
                    </Button>
                )}
                <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}