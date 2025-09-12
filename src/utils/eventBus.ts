type EventCallback = () => void;
const listeners = new Set<EventCallback>();

export const onChatHistoryUpdate = (cb: EventCallback) => {
    listeners.add(cb);
    return () => listeners.delete(cb); // for cleanup
};

export const triggerChatHistoryUpdate = () => {
    listeners.forEach(cb => cb());
};