import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {Trash2, MoreVertical, Share2, Archive, Pencil} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ChatMenuButtonProps {
    chatId: string;
    onRemove: (e: React.MouseEvent, id: string) => void;
    onArchive?: (e: React.MouseEvent, id: string) => void;
    onRename?: (e: React.MouseEvent, id: string, newTitle: string) => void;
}

const ChatMenuButton: React.FC<ChatMenuButtonProps> = ({ chatId, onRemove, onArchive, onRename}) => {
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content
                    className="z-50 min-w-[160px] rounded-md bg-white dark:bg-gray-800 p-1 shadow-md border border-gray-200 dark:border-gray-700"
                    side="right"
                    align="start"
                >
                    {/*<DropdownMenu.Item*/}
                    {/*    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"*/}
                    {/*    onSelect={() => console.log(`Share chat ${chatId}`)}*/}
                    {/*>*/}
                    {/*    <Share2 className="inline-block w-4 h-4 mr-2" />*/}
                    {/*    Share*/}
                    {/*</DropdownMenu.Item>*/}


                    {/* <DropdownMenu.Item
                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                        onSelect={(e) => onArchive?.(e as any, chatId)}
                    >
                        <Archive className="inline-block w-4 h-4 mr-2" />
                        Archive
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                        onSelect={(e) => {
                            const newTitle = prompt("Enter new title");
                            if (newTitle && newTitle.trim()) {
                                onRename?.(e as any, chatId, newTitle.trim());
                            }
                        }}
                    >
                        <Pencil className="inline-block w-4 h-4 mr-2" />
                        Rename
                    </DropdownMenu.Item> */}

                    {/* <DropdownMenu.Separator className="h-px my-1 bg-gray-200 dark:bg-gray-700" /> */}
                    <DropdownMenu.Item
                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpen(true);
                        }}
                    >
                        <Trash2 className="inline-block w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

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

export default ChatMenuButton;