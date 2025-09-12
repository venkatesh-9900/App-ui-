import MarkdownWrapper from "@/components/chat/message/format/markdown-wrapper.tsx";
import Box from "@mui/material/Box";

export const MessageSingleMarkdownLayout = ({
                                              displayText,
                                              isTyping,
                                          }: {
    displayText: string;
    isTyping: boolean;
}) => (
    <Box component={"div"} className="prose dark:prose-invert max-w-none mb-1 min-h-[2rem] chat-msg">
        <MarkdownWrapper
            content={isTyping ? displayText : displayText}
            components={{
                p: (props) => <p className="mb-2 leading-relaxed" {...props} />,
                li: (props) => <li className="ml-4 list-disc" {...props} />,
            }}
        />
    </Box>
);
