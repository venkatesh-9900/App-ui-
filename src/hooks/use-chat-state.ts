/**
 * @file useChatState.ts
 * @description Custom hook for managing chat state and related operations including messages, input, and UI state.
 */

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {Message} from "@/types";

/**
 * Custom hook for managing chat state
 *
 * @param {string} [chatId] - Optional ID of the chat to load
 * @returns {Object} Chat state and state management functions
 *
 * @example
 * ```tsx
 * const { messages, input, setInput } = useChatState("123");
 * ```
 */
export const useChatState = (chatId?: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [title, setTitle] = useState("Chat with AI");
    const [currentChatId, setCurrentChatId] = useState(chatId || uuidv4());
    const [isThinking, setIsThinking] = useState(false);
    const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setTitle("");
            setCurrentChatId(uuidv4());
            return;
        }

        if (chatId === 'new') {
            setMessages([]);
            setTitle("New Chat");
            setCurrentChatId(uuidv4());
            return;
        }
    }, [chatId]);

    return {
        messages,
        setMessages,
        input,
        setInput,
        title,
        setTitle,
        currentChatId,
        setCurrentChatId,
        isThinking,
        setIsThinking,
        currentTypingIndex,
        setCurrentTypingIndex,
        displayedText,
        setDisplayedText,
    };
};