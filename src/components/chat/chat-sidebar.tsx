// src/components/ChatSidebar.tsx

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ChevronRight, Plus} from "lucide-react";
import ChatMenuButton from "@/components/chat/tools/chat-menu-button.tsx";
import {Chat} from "@/types";

interface ChatSidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    conversations: Chat[];
    currentConversationId?: string;
    onToggleCollapsed: () => void;
    onNewConversation: () => void;
    onLoadCurrentConversation: (id: string) => void;
    onArchiveConversation?: (e: React.MouseEvent, id: string) => void;
    onRenameConversation?: (e: React.MouseEvent, id: string, newTitle: string) => void;
    onDeleteConversation: (e: React.MouseEvent, id: string) => void;
}

export function ChatSidebar({
                                isOpen,
                                isCollapsed,
                                conversations,
                                currentConversationId,
                                onToggleCollapsed,
                                onNewConversation,
                                onLoadCurrentConversation,
                                onArchiveConversation,
                                onRenameConversation,
                                onDeleteConversation,
                            }: ChatSidebarProps) {
    if (!isOpen) {
        return null; // Or a zero-width div if you prefer for transition purposes
    }

    return (
        <div
            className={cn(
                "flex flex-col h-full border-r border-slate-200 bg-slate-50 transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Top bar with New Chat and Collapse Button */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <Button onClick={onNewConversation} className="flex-1 gap-2">
                            <Plus className="w-4 h-4" />
                            New Chat
                        </Button>
                    )}
                    {isCollapsed && (
                        <Button onClick={onNewConversation} size="icon" className="w-8 h-8">
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapsed}
                        className="ml-2 h-8 w-8"
                    >
                        <ChevronRight
                            className={cn("w-4 h-4 transition-transform", !isCollapsed && "rotate-180")}
                        />
                    </Button>
                </div>
            </div>

            {/* Scrollable conversation list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                <div className="space-y-1">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-100 group",
                                conv.id === currentConversationId && "bg-slate-200"
                            )}
                            onClick={() => onLoadCurrentConversation(conv.id)}
                            title={isCollapsed ? conv.title : undefined}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{conv.title}</p>
                            </div>
                            <ChatMenuButton
                                chatId={conv.id}
                                onRemove={onDeleteConversation}
                                onArchive={onArchiveConversation}
                                onRename={onRenameConversation}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}