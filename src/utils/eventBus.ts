export type ChatHistoryPayload = {
  sessionId?: string
  initialText?: string
}

type EventCallback = (payload?: ChatHistoryPayload) => void;
const listeners = new Set<EventCallback>();

export const onChatHistoryUpdate = (cb: EventCallback) => {
    listeners.add(cb);
    return () => listeners.delete(cb); // for cleanup
};

export const triggerChatHistoryUpdate = (payload?: ChatHistoryPayload) => {
    listeners.forEach(cb => cb(payload));
};