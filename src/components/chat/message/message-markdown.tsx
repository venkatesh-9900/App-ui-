import React, { FC } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import '@/styles/components/chat-message/index.css';
import Box from "@mui/material/Box"

interface MessageMarkdownProps {
  content: string
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
    return (
        <Box component={"div"} className="markdown-container" sx={{wordBreak: 'break-word', maxWidth: '100%'}}>
            <MessageMarkdownMemoized
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                    p({ children }) {
                        return (
                            <p className="m-0 leading-relaxed text-[14px] text-slate-800">
                                {children}
                            </p>
                        )
                    },
                    ul({ children }) {
                        return <ul className="list-disc pl-6 mt-[1px]">{children}</ul>;
                    },
                    li({ children }) {
                        return (
                            <li className="leading-normal text-[14px] text-slate-800">
                                {children}
                            </li>
                        );
                    },
                    h1({ children }) {
                        return <h1 className="text-xl font-bold">{children}</h1>;
                    },
                    h2({ children }) {
                        return <h2 className="text-lg font-semibold">{children}</h2>;
                    },
                    h3({ children }) {
                        return (
                            <h3 className="mb-[1px] mt-50 text-base font-semibold text-slate-900">
                                {children}
                            </h3>
                        );
                    },
                    img({ node, ...props }) {
                        return <img className="max-w-[67%]" alt="" {...props} />;
                    },
                    code({ node, className, children, ...props }) {
                        const childArray = React.Children.toArray(children);
                        let firstChildAsString: string | undefined;
                        const firstChild = childArray[0];

                        if (React.isValidElement(firstChild)) {
                            const props = firstChild.props as { children?: string };
                            if (typeof props.children === "string") {
                                firstChildAsString = props.children;
                            }
                        } else if (typeof firstChild === "string") {
                            firstChildAsString = firstChild;
                        }

                        if (firstChildAsString === "▍") {
                            return (
                                <span className="mt-1 animate-pulse cursor-default">▍</span>
                            );
                        }

                        if (typeof firstChildAsString === "string") {
                            childArray[0] = firstChildAsString.replace("`▍`", "▍");
                        }

                        const match = /language-(\w+)/.exec(className || "");

                        if (
                            typeof firstChildAsString === "string" &&
                            !firstChildAsString.includes("\n")
                        ) {
                            return (
                                <code className={className} {...props}>
                                    {childArray}
                                </code>
                            );
                        }
                        return (
                            <MessageCodeBlock
                                key={Math.random()}
                                language={(match && match[1]) || ""}
                                value={String(childArray).replace(/\n$/, "")}
                                {...props}
                            />
                        );
                    }
                }}
            >
                {content}
            </MessageMarkdownMemoized>
        </Box>
    );
};