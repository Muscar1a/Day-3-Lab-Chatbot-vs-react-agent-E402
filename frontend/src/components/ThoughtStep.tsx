import { useState } from 'react';
import { ChevronDown, Brain, Zap, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Step {
  type: 'thought' | 'action' | 'observation' | 'final' | 'error';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  result?: unknown;
  timestamp: number;
  isExpanded?: boolean;
}

interface ThoughtStepProps {
  step: Step;
  index: number;
}

const ICON_MAP = {
  thought: Brain,
  action: Zap,
  observation: Eye,
  final: CheckCircle,
  error: AlertTriangle,
};

const LABEL_MAP: Record<string, string> = {
  thought: 'Thought',
  action: 'Action',
  observation: 'Observation',
  final: 'Result',
  error: 'Error',
};

const STEP_CLASS: Record<string, string> = {
  thought: 'step-row--thought',
  action: 'step-row--action',
  observation: 'step-row--observation',
  final: 'step-row--final',
  error: 'step-row--error',
};

export function ThoughtStep({ step }: ThoughtStepProps) {
  const [expanded, setExpanded] = useState(step.isExpanded ?? true);
  const Icon = ICON_MAP[step.type] || Brain;

  const formatArgs = (args?: Record<string, unknown>) => {
    if (!args || Object.keys(args).length === 0) return null;
    return Object.entries(args)
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? `"${v}"` : JSON.stringify(v)}`)
      .join(', ');
  };

  return (
    <div className={`step-row ${STEP_CLASS[step.type] || ''}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left py-1 group"
        aria-expanded={expanded}
      >
        <Icon className="w-4 h-4 shrink-0 text-text-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted font-display">
          {LABEL_MAP[step.type] || step.type}
        </span>
        {step.toolName && (
          <span className="pill pill--accent text-[9px]">{step.toolName}</span>
        )}
        <span className="flex-1" />
        <span className="text-[10px] text-text-muted font-mono">{formatTime(step.timestamp)}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Body — collapse/expand */}
      <div className={`overflow-hidden transition-all duration-normal ease-standard ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-1 pb-2">
          {step.type === 'thought' && (
            <p className="text-[14px] text-text-muted italic whitespace-pre-wrap">{step.content}</p>
          )}

          {step.type === 'action' && (
            <div className="tool-card">
              <div className="tool-card__header">
                <span className="status-node status-node--active" />
                {step.toolName}
                {step.toolArgs && (
                  <span className="text-white/60 ml-auto text-[10px]">{formatArgs(step.toolArgs)}</span>
                )}
              </div>
            </div>
          )}

          {step.type === 'observation' && (
            <div className="tool-card">
              <div className="tool-card__header">
                <span className="status-node status-node--complete" />
                Result
              </div>
              <div className="tool-card__body">
                {typeof step.result === 'string' ? (
                  <pre className="whitespace-pre-wrap text-[13px] font-mono text-ink leading-relaxed m-0">{step.result}</pre>
                ) : step.result ? (
                  <pre className="whitespace-pre-wrap text-[13px] font-mono text-ink leading-relaxed m-0">
                    {JSON.stringify(step.result, null, 2)}
                  </pre>
                ) : (
                  <p className="text-text-muted italic text-[13px]">No data returned</p>
                )}
              </div>
            </div>
          )}

          {step.type === 'final' && (
            <div className="text-[14px] text-ink whitespace-pre-wrap">{step.content}</div>
          )}

          {step.type === 'error' && (
            <div className="bg-danger/10 border border-danger/30 rounded-sm px-3 py-2">
              <p className="text-[13px] text-danger whitespace-pre-wrap">{step.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
