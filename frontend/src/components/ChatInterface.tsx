import { Send, Paperclip, Trash2, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import { useState, useRef, useEffect, useCallback } from 'react';

export function ChatInterface() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    textareaRef.current?.focus();
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const adjustHeight = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }, []);

  const suggestionPrompts = [
    'Kiểm tra chi phí tiếp khách 5 triệu đồng',
    'Duyệt đề xuất mua thiết bị văn phòng 15 triệu',
    'Công tác phí cho 3 người đi Hà Nội 3 ngày',
  ];

  // --- Mobile sidebar overlay ---
  const SidebarOverlay = sidebarOpen && (
    <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
      <div className="absolute inset-0 bg-ink/40" />
      <div
        className="relative w-[280px] h-full sidebar bg-surface-muted shadow-floating"
        onClick={e => e.stopPropagation()}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-canvas">

      {/* ── TOP BAR ── */}
      <header className="top-bar shrink-0">
        <button className="lg:hidden p-1 -ml-1" onClick={() => setSidebarOpen(true)} aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-tight">Circuit</span>
          <span className="status-node status-node--active" />
        </div>
        <span className="text-label text-white/50 ml-2 hidden sm:inline">Expense Approval Agent</span>
        <div className="flex-1" />
        <nav className="flex items-center gap-1.5">
          <span className="nav-pill nav-pill--active">Chat</span>
          <span className="nav-pill">Sources</span>
          <span className="nav-pill">Settings</span>
        </nav>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex min-h-0">

        {/* ── SIDEBAR (desktop) ── */}
        <aside className="sidebar hidden lg:flex">
          <Sidebar />
        </aside>

        {/* ── CHAT WORKSPACE ── */}
        <main className="chat-workspace">

          {/* Chat header */}
          <div className="chat-header">
            <div>
              <h2 className="chat-header__title">Trợ lý Duyệt Chi Phí</h2>
              <p className="chat-header__subtitle">
                ReAct Agent · TT 40/2017/TT-BTC · NĐ 132/2020/NĐ-CP
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={clearChat} className="btn-ghost" title="Xoá hội thoại" disabled={messages.length === 0 && !isLoading}>
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setContextOpen(!contextOpen)}
                className="btn-ghost"
                title={contextOpen ? 'Ẩn ngữ cảnh' : 'Hiện ngữ cảnh'}
              >
                {contextOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Workflow strip (shown when agent is working) */}
          {isLoading && (
            <div className="workflow-strip">
              <div className="workflow-node">
                <span className="workflow-dot workflow-dot--complete" />
                Understanding
              </div>
              <div className="workflow-connector" />
              <div className="workflow-node">
                <span className="workflow-dot workflow-dot--active" />
                Processing
              </div>
              <div className="workflow-connector" />
              <div className="workflow-node">
                <span className="workflow-dot" />
                Verifying
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="message-thread">
            {messages.length === 0 ? (
              <EmptyState prompts={suggestionPrompts} onPrompt={setInput} />
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} {...msg} />
              ))
            )}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="composer">
            <form onSubmit={handleSubmit}>
              <div className="composer__inner">
                <button type="button" disabled={isLoading} className="p-1.5 text-text-muted hover:text-ink transition-colors" aria-label="Đính kèm">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); adjustHeight(e); }}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? 'Đang xử lý...' : 'Nhập yêu cầu duyệt chi phí...'}
                  disabled={isLoading}
                  rows={1}
                  className="composer__input"
                  aria-label="Nhập tin nhắn"
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="btn-send" aria-label="Gửi">
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-caption">
                  <kbd className="font-mono text-[10px] bg-surface-muted border border-ink/20 rounded-xs px-1 py-0.5 mr-1">Enter</kbd>
                  Gửi · <kbd className="font-mono text-[10px] bg-surface-muted border border-ink/20 rounded-xs px-1 py-0.5 mx-1">Shift + Enter</kbd>
                  Xuống dòng
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  {messages.length > 0 && `${messages.length} tin nhắn`}
                </span>
              </div>
            </form>
          </div>
        </main>

        {/* ── CONTEXT RAIL (optional) ── */}
        {contextOpen && (
          <aside className="context-rail hidden xl:flex">
            <ContextRail messages={messages} />
          </aside>
        )}
      </div>

      {SidebarOverlay}
    </div>
  );
}

/* ========== SIDEBAR ========== */
function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="sidebar__header flex items-center justify-between">
        Conversations
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-ink">&times;</button>
        )}
      </div>
      <button className="mx-3 mt-3 btn-secondary text-sm w-[calc(100%-24px)]">
        + New conversation
      </button>
      <div className="px-3 mt-4">
        <input
          type="text"
          placeholder="Search conversations"
          className="w-full px-3 py-2 text-sm border-2 border-ink rounded-sm bg-surface text-ink placeholder:text-text-muted/50 outline-none focus:border-accent"
        />
      </div>
      <div className="flex-1 overflow-y-auto mt-3">
        <div className="sidebar__item sidebar__item--active">
          <div className="font-semibold text-sm">Duyệt chi phí tiếp khách</div>
          <div className="text-[11px] text-text-muted font-mono">Hôm nay · 2 phút trước</div>
        </div>
        <div className="sidebar__item">
          <div className="text-sm">Mua thiết bị văn phòng</div>
          <div className="text-[11px] text-text-muted font-mono">Hôm qua</div>
        </div>
        <div className="sidebar__item">
          <div className="text-sm">Công tác phí Hà Nội</div>
          <div className="text-[11px] text-text-muted font-mono">22/07</div>
        </div>
        <div className="sidebar__item">
          <div className="text-sm">Hội thảo khách hàng</div>
          <div className="text-[11px] text-text-muted font-mono">20/07</div>
        </div>
      </div>
      <div className="border-t border-ink/20 p-4">
        <div className="text-xs text-text-muted font-mono">Circuit v1.0 · ReAct Agent</div>
      </div>
    </>
  );
}

/* ========== CONTEXT RAIL ========== */
function ContextRail({ messages }: { messages: Array<{ role: string; content: string; timestamp: number }> }) {
  const toolCalls = messages.filter(m => m.role === 'assistant').length;
  return (
    <>
      <div className="context-rail__section">
        <div className="context-rail__header">Summary</div>
        <div className="context-rail__body">
          <div className="text-xs space-y-1">
            <div className="flex justify-between"><span className="text-text-muted">Messages</span> <span className="font-mono font-semibold">{messages.length}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Tool calls</span> <span className="font-mono font-semibold">{toolCalls}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Status</span> <span className="pill pill--success text-[9px]">Active</span></div>
          </div>
        </div>
      </div>
      <div className="context-rail__section">
        <div className="context-rail__header">Legal Bases</div>
        <div className="context-rail__body">
          <ul className="text-xs space-y-1.5 text-text-muted">
            <li className="font-mono">TT 40/2017/TT-BTC</li>
            <li className="font-mono">NĐ 132/2020/NĐ-CP</li>
            <li className="font-mono">Thông tư 96/2015/TT-BTC</li>
            <li className="font-mono">Luật Thuế TNDN</li>
          </ul>
        </div>
      </div>
      <div className="context-rail__section">
        <div className="context-rail__header">Quick Actions</div>
        <div className="context-rail__body">
          <div className="flex flex-wrap gap-1">
            <span className="pill pill--muted text-[9px]">Tiếp khách</span>
            <span className="pill pill--muted text-[9px]">Công tác</span>
            <span className="pill pill--muted text-[9px]">VPP</span>
            <span className="pill pill--muted text-[9px]">Đào tạo</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ========== EMPTY STATE ========== */
function EmptyState({ prompts, onPrompt }: { prompts: string[]; onPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 bg-canvas border-2 border-ink rounded-lg flex items-center justify-center shadow-panel-sm">
          <span className="font-display text-2xl font-bold text-ink">C</span>
        </div>
        <h2 className="text-display text-2xl font-bold text-ink mb-2">
          Trợ lý Duyệt Chi Phí
        </h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          Hệ thống kiểm tra và phê duyệt chi phí doanh nghiệp dựa trên khung pháp lý Việt Nam.
          Nhập một đề xuất chi phí để bắt đầu.
        </p>
        <div className="flex flex-col items-stretch gap-2">
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onPrompt(p)}
              className="btn-secondary text-left px-4 py-2.5 text-sm"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== TYPING INDICATOR ========== */
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-canvas-soft border-2 border-ink/30 flex items-center justify-center">
        <span className="status-node status-node--active" />
      </div>
      <div className="msg-assistant">
        <div className="flex items-center gap-2 py-1">
          <span className="w-2 h-2 rounded-full bg-ink/30 animate-pulse-soft" />
          <span className="w-2 h-2 rounded-full bg-ink/30 animate-pulse-soft" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-ink/30 animate-pulse-soft" style={{ animationDelay: '300ms' }} />
          <span className="text-xs text-text-muted font-mono ml-1">Đang phân tích...</span>
        </div>
      </div>
    </div>
  );
}
