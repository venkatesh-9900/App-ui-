import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Components } from 'react-markdown';
import Box from '@mui/material/Box';

interface MarkdownWrapperProps {
    content: string;
    components?: Components;
}

const MarkdownWrapper: React.FC<MarkdownWrapperProps> = ({ content, components }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Post-render fix for lingering **bold** text
    useEffect(() => {
        if (containerRef.current) {
            const el = containerRef.current;

            // Select any text nodes containing **...**
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node: Text | null;

            while ((node = walker.nextNode() as Text | null)) {
                const match = node.nodeValue?.match(/\*\*(.+?)\*\*/);
                if (match) {
                    const strong = document.createElement('strong');
                    strong.textContent = match[1];

                    const parts = node.nodeValue!.split(match[0]);
                    const after = node.splitText(parts[0].length);
                    node.nodeValue = parts[0];

                    after.nodeValue = after.nodeValue?.substring(match[0].length) || '';
                    node.parentNode?.insertBefore(strong, after);
                }
            }
        }
    }, [content]);

    return (
        <Box component={"div"} ref={containerRef}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={components}
            >
                {content.replace(/\\n/g, '\n')}
            </ReactMarkdown>
        </Box>
    );
};

export default MarkdownWrapper;
