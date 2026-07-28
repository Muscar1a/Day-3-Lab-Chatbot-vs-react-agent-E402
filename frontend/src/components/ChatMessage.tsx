import { Copy, Check } from 'lucide-react';
import { ThoughtStep } from './ThoughtStep';
import { formatTime } from '@/lib/utils';
import { useState } from 'react';

interface ToolCall {
  type: 'thought' | 'action' | 'observation' | 'final' | 'error';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  result?: unknown;
  timestamp: number;
  isExpanded?: boolean;
}

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thoughtSteps?: ToolCall[];
  timestamp: number;
  isStreaming?: boolean;
  isCopied?: boolean;
}

export function ChatMessage({ role, content, thoughtSteps = [], timestamp, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="msg-user">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{content}</p>
          <div className="mt-2 flex justify-end">
            <span className="text-[10px] text-white/50 font-mono">{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'system') {
    return (
      <div className="animate-fade-in">
        <div className="msg-system">{content}</div>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex items-start gap-3 animate-slide-up">
      {/* avatar dot */}
      <div className="w-9 h-9 rounded-full bg-canvas-soft border-2 border-ink/20 flex items-center justify-center shrink-0 mt-1">
        <span className="text-[10px] font-display font-bold text-ink/50">CA</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* ReAct thought steps */}
        {thoughtSteps.length > 0 && (
          <div className="mb-3 space-y-1">
            {thoughtSteps.map((step, i) => (
              <ThoughtStep key={i} step={step} index={i} />
            ))}
          </div>
        )}

        {/* Main content block */}
        <div className="msg-assistant">
          {content.split('\n').map((line, i) => (
            <p key={i} className="text-[15px] leading-relaxed whitespace-pre-wrap">{line || '\u00A0'}</p>
          ))}

          {/* Streaming indicator inside block */}
          {isStreaming && (
            <div className="mt-3 pt-3 border-t border-ink/20 flex items-center gap-2">
              <span className="status-node status-node--active animate-pulse-soft" />
              <span className="text-[12px] text-text-muted font-mono">Generating...</span>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-[10px] text-text-muted font-mono">{formatTime(timestamp)}</span>
          <div className="flex-1" />
          <button onClick={handleCopy} className="btn-ghost text-[12px] px-2 py-1" aria-label={copied ? 'Đã sao chép' : 'Sao chép'}>
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
