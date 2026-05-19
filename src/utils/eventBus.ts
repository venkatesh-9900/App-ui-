export type ChatHistoryPayload = {
  sessionId?: string
  initialText?: string
  groupId?: string
}

export type ChatMovedToGroupPayload = {
  sessionId: string
  sessionText: string
  groupId: string
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

type MoveEventCallback = (payload: ChatMovedToGroupPayload) => void;
const moveListeners = new Set<MoveEventCallback>();

export const onChatMovedToGroup = (cb: MoveEventCallback) => {
  moveListeners.add(cb);
  return () => moveListeners.delete(cb);
};

export const triggerChatMovedToGroup = (payload: ChatMovedToGroupPayload) => {
  moveListeners.forEach(cb => cb(payload));
};