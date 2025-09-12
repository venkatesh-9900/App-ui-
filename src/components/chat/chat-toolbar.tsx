import {Button} from "@/components/ui/button";
import {Box} from "@mui/material";
import {Mic, Paperclip, Plus, Search, Send, Video} from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';
import { MdAttachFile } from 'react-icons/md';

interface ChatToolbarProps {
    isEmpty: boolean;
    handleSubmit: () => void;
    handleFileAttachment: () => void;

}

export function ChatToolbar({ isEmpty, handleSubmit, handleFileAttachment }: ChatToolbarProps) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            {/* Left Button Group */}
            <Box display="flex" alignItems="center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-slate-700 h-8 w-8"
                    title="Add attachment"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </Box>

            {/* Right Button Group */}
            <Box display="flex" alignItems="center" gap={0.5}>
                <Tooltip.Root delayDuration={200}>
                    <Tooltip.Trigger asChild>
                        <button className="icon-btn" title="Attached files" onClick={handleFileAttachment}>
                            <MdAttachFile size={18} />
                        </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1 shadow z-50">
                        Upload file
                        {/*Attached files. <strong>10</strong> left today*/}
                        <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                </Tooltip.Root>
                {isEmpty ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-slate-700 h-8 w-8"
                        title="Voice input"
                    >
                        <Mic className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 w-8"
                        title="Send"
                        onClick={handleSubmit}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                )}
            </Box>
        </Box>
    );
}