/**
 * @file ChatTypes.ts
 * @description Type definitions for chat-related components and functionality.
 */

import {FileDetails, FileUploadResponse} from "@/types/files";

/**
 * Type for complex message content like code or charts
 */
export interface MessageContent {
  /** Optional plain text message */
  summary?: string;
  type?: 'text' | 'code' | 'table' | 'chart' | 'image' | 'download' | 'visualization' | 'command' | 'canvas' | 'html';
  /** Optional HTML content (e.g. iframe src) */
  html?: string;

  /** Optional code content */
  code?: string;
  language?: string;

  /** Optional chart or table */
  chartData?: Array<{ name: string; value: number; average?: number }>;
  chartType?: 'bar' | 'line' | 'pie';

  tableData?: any[];
  columns?: Array<{ key: string; label: string }>;

  /** Optional file/image/visualization */
  image?: string;
  fileType?: string;
  fileExtension?: string;
  showDownload?: boolean;
  visualizationUrls?: string[];

  /** Optional command suggestions */
  commands?: Array<{ command: string; label: string }>;
  isCommandSuggestion?: boolean;
}
/**
 * Represents a single message in the chat
 */
export interface Message {
  id: string;
  /** The message content - either plain text or complex content */
  text: string | MessageContent;
  /** Whether the message was sent by the user */
  isUser: boolean;
  /** Optional image URL if message contains an image */
  image?: string;
  /** Timestamp when the message was sent */
  timestamp?: string;
  /** Icon identifier for bot messages */
  botIcon?: string;

  visualizationUrls?: string[];

}
/**
 * Represents a full chat session in the UI, containing its title and all its messages.
 * This is the transformed version of the raw ChatSessionModel from the API.
 */
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}
export interface ChatMessagePageProps {
  title: string;
  input: string;
  readonly: boolean;
  setInput: (value: string) => void;
  currentChatId: string;
  handleSendMessage: (message: string, selectedAgent: string, attachedFiles: FileDetails[]) => void;
  handleFileUpload: (files: File[], sessionIdOverride?: string) => Promise<FileDetails[]>;
  messages: ChatMessage[];
  isThinking: boolean;
  currentTypingIndex: number;
  displayedText: string;
  selectedVizUrl?: string | null;
  onVizSelect?: (url: string) => void;
  onCloseSplitView?: () => void;
  userClosedSplitView?: boolean;
  selectedAgent: string;
  chatLoadingError: boolean;
  currentChatLoading: boolean;
}

/**
 * Props for the ChatInterface component
 */
export interface ChatInterfaceProps {
  /** Optional chat ID to load specific chat */
  chatId?: string;
}
export interface ChatInterfaceSplitProps {
  isSplitLayout?: boolean; // default false
}
export interface ChatMessagesProps {
  messages: Message[];
  isThinking: boolean;
  currentTypingIndex: number;
  displayedText: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  onCommandClick?: (command: string) => void;
}
export interface MessageContentProps {
  input: string;
  setInput: (value: string) => void;
  readonly: boolean;
  currentChatId: string;
  handleSendMessage: (message: string, selectedAgent: string, attachedFiles: FileDetails[]) => void;
  handleEditClick: () => void;
  handleUpdate: () => void;
  handleCancel: () => void;
  message: ChatMessage;
  isTyping: boolean;
  isEditing: boolean;
  updatedText: string | null;
  editableRef?: React.RefObject<HTMLDivElement>;
  showContent: boolean;
  showAdditionalContent: boolean;
  onCommandClick?: (cmd: string) => void;
  onVizSelect?: (url: string) => void;
  onCloseSplitView?: () => void;
  selectedAgent: string;
}
export interface RenderMessageSplitLayoutProps {
  summary: string;
  displayText?: string;
  renderVizUrls: string[];
  code?: string;
  language?: string;
  image?: string;
  chartData?: any;
  chartType?: string;
  tableData?: any;
  columns?: any;
  fileType?: string;
  fileExtension?: string;
  showDownload?: boolean;
  isTyping?: boolean;
  showContent?: boolean;
  showAdditionalContent?: boolean;
  onVizSelect?: (url: string) => void;
  onCloseSplitView?: () => void;
}
export interface ChatInterfaceProps {
  /** Optional chat ID to load specific chat */
  params?: { id?: string };
}

export interface ChatSessions {
    session_id: string;
    initial_text: string;
    is_sharable: boolean;
}

export interface ChatMessage {
    author: string;
    content: string;
    timestamp: string;
    attachments: FileDetails[];
}