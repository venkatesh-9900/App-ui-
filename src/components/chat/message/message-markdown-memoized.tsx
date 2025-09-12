import {memo} from "react";
import type {PluggableList} from "unified";
import type {Components} from "react-markdown";
import ReactMarkdown from "react-markdown";

// Extend props to include remarkPlugins and components
interface MarkdownProps {
    children: string;
    className?: string;
    remarkPlugins?: PluggableList;
    components?: Components;
}
export const MessageMarkdownMemoized = memo(
    ReactMarkdown as (props: MarkdownProps) => JSX.Element,
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children &&
        prevProps.className === nextProps.className
);