import { useState, useCallback, useRef } from 'react';
import type { Message, ToolCall, MessageRole } from '../types/chat';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parseReActResponse(response: string): ToolCall[] {
  const steps: ToolCall[] = [];
  const thoughtRegex = /Thought:\s*([\s\S]*?)(?=Action:|Final Answer:|$)/g;
  const actionRegex = /Action:\s*(\w+)\[([\s\S]*?)\](?=Observation:|Final Answer:|$)/g;
  const observationRegex = /Observation:\s*([\s\S]*?)(?=Thought:|Action:|Final Answer:|$)/g;
  const finalRegex = /Final Answer:\s*([\s\S]*?)(?=Thought:|Action:|$)/g;

  let match;
  let thoughtIndex = 0;

  while ((match = thoughtRegex.exec(response)) !== null) {
    steps.push({
      type: 'thought',
      content: match[1].trim(),
      timestamp: Date.now() + thoughtIndex,
    });
    thoughtIndex++;
  }

  let actionIndex = 0;
  while ((match = actionRegex.exec(response)) !== null) {
    try {
      const args = JSON.parse(match[2].trim());
      steps.push({
        type: 'action',
        content: `Gọi công cụ: ${match[1]}`,
        timestamp: Date.now() + actionIndex + 1000,
        toolName: match[1],
        args,
      });
    } catch {
      steps.push({
        type: 'action',
        content: `Gọi công cụ: ${match[1]}(${match[2].trim()})`,
        timestamp: Date.now() + actionIndex + 1000,
        toolName: match[1],
      });
    }
    actionIndex++;
  }

  let obsIndex = 0;
  while ((match = observationRegex.exec(response)) !== null) {
    steps.push({
      type: 'observation',
      content: match[1].trim(),
      timestamp: Date.now() + obsIndex + 2000,
    });
    obsIndex++;
  }

  const finalMatch = finalRegex.exec(response);
  if (finalMatch) {
    steps.push({
      type: 'final',
      content: finalMatch[1].trim(),
      timestamp: Date.now() + 3000,
    });
  }

  return steps.sort((a, b) => a.timestamp - b.timestamp);
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((role: MessageRole, content: string, thoughtSteps?: ToolCall[]) => {
    const newMessage: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
      thoughtSteps,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading) return;

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // Add user message
    addMessage('user', content);

    // Create assistant message placeholder
    const assistantMsg = addMessage('assistant', '', []);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const thoughtSteps = parseReActResponse(data.response || '');

      updateMessage(assistantMsg.id, {
        content: data.response || '',
        thoughtSteps,
        isStreaming: false,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Chat error:', error);
      updateMessage(assistantMsg.id, {
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        thoughtSteps: [{
          type: 'final',
          content: 'Lỗi kết nối đến server. Kiểm tra backend đang chạy.',
          timestamp: Date.now(),
        }],
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, addMessage, updateMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    stopGeneration,
  };
}