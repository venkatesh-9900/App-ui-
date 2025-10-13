import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {Trash2, MoreVertical, Share2, Archive, Pencil} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ChatDeleteButtonProps {
    chatId: string;
    onRemove: (e: React.MouseEvent, id: string) => void;
}

const ChatDeleteButton: React.FC<ChatDeleteButtonProps> = ({ chatId, onRemove }) => {
    const [open, setOpen] = useState(false);
    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-md shadow-xl w-full max-w-sm space-y-4">
                    <AlertDialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                        Confirm Deletion
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-sm text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete this chat?
                    </AlertDialog.Description>
                    <div className="flex justify-end gap-2 pt-2">
                        <AlertDialog.Cancel asChild>
                            <Button variant="outline">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <Button
                                variant="destructive"
                                onClick={(e) => {
                                    setOpen(false);
                                    onRemove(e, chatId)
                                }}
                            >
                                Delete
                            </Button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
};

export default ChatDeleteButton;