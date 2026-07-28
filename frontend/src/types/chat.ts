export type MessageRole = 'user' | 'assistant' | 'system';

export interface ToolCall {
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  timestamp: number;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  isCollapsed?: boolean;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  thoughtSteps?: ToolCall[];
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
}

export type { ChatState as ChatStateType };