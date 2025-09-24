import React from 'react';
import {extractRenderVizUrls} from "@/utils/utils.ts";
import {MessageSingleMarkdownLayout} from "@/components/chat/message/layout/message-single-markdown-layout.tsx";
import {MessageContentProps} from "@/types";
import {MessageSplitMarkdownLayout} from "@/components/chat/message/layout/message-split-markdown-layout.tsx";
import MessageUserPlainText from "@/components/chat/message/layout/message-user-text.tsx";
import { hasAnyVisualizationInText } from '@/hooks/chat-service';

export const RenderMessageContent: React.FC<MessageContentProps> = (props) => {
    const {
        input,
        setInput,
        readonly,
        currentChatId,
        handleSendMessage,
        handleEditClick,
        handleUpdate,
        handleCancel,
        message,
        isTyping,
        isEditing,
        updatedText,
        editableRef,
        showContent,
        showAdditionalContent,
        onVizSelect,
        onCloseSplitView,
        selectedAgent
    } = props;

    if (message.content === "") return null;
    const displayText = message.content
        // typeof message.text === "string"
        //     ? message.text
        //     : message.text?.summary ?? "";

    if (message.author === 'user') {
        return (
            <MessageUserPlainText
                input={input}
                setInput={setInput}
                readonly={readonly}
                currentChatId={currentChatId}
                handleSendMessage={handleSendMessage}
                handleEditClick={handleEditClick}
                handleUpdate={handleUpdate}
                handleCancel={handleCancel}
                displayText={displayText}
                isEditing={isEditing}
                selectedAgent={selectedAgent}
            />
        );
    }
    if (hasAnyVisualizationInText(message)) {
        const renderVizUrls = extractRenderVizUrls(message.content);
        // const renderVizUrls = 
        //     typeof message.text === 'object' && message.text.visualizationUrls?.length
        //         ? message.text.visualizationUrls
        //         : extractRenderVizUrls(summary || '');

        if (renderVizUrls.length > 0) {
            return (
                <MessageSplitMarkdownLayout
                    {...props}
                    displayText={displayText}
                    summary={displayText}
                    renderVizUrls={renderVizUrls}
                    // {...message.text}
                    onVizSelect={props.onVizSelect}
                    onCloseSplitView={props.onCloseSplitView}
                />
            );
        } else {
            return <MessageSingleMarkdownLayout
                displayText={displayText}
                isTyping={isTyping}
            />;
        }
    }
    return <MessageSingleMarkdownLayout
        displayText={displayText}
        isTyping={isTyping}
    />;
};
