import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
  steps?: Step[];
};

type Step = {
  step: number;
  llm: string;
  tool?: string;
  param?: string;
  observation?: string;
  final?: boolean;
};

type TestCase = {
  id: number;
  category: string;
  question: string;
  expected_behavior: string;
};

const API = "/api";

export default function App() {
  const [mode, setMode] = useState<"chatbot" | "agent">("chatbot");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [showTests, setShowTests] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`${API}/test-cases`)
      .then((r) => r.json())
      .then(setTestCases)
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        text: m.text,
      }));
      const endpoint = mode === "chatbot" ? "chatbot" : "agent";
      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let steps: Step[] = [];

        // Insert initial placeholder message for stream
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Đang suy luận...", steps: [] },
        ]);

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("event: ")) {
              currentEvent = trimmed.replace("event: ", "").trim();
            } else if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.replace("data: ", "").trim();
              try {
                const data = JSON.parse(dataStr);
                if (currentEvent === "step") {
                  steps = [...steps, data];
                  setMessages((prev) => {
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    if (lastIdx >= 0 && next[lastIdx].role === "bot") {
                      next[lastIdx] = {
                        ...next[lastIdx],
                        text: data.final
                          ? (data.llm.split("Final Answer:")[1] || data.llm).trim()
                          : `Đang xử lý bước ${data.step}...`,
                        steps: steps,
                      };
                    }
                    return next;
                  });
                } else if (currentEvent === "done") {
                  setMessages((prev) => {
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    if (lastIdx >= 0 && next[lastIdx].role === "bot") {
                      next[lastIdx] = {
                        ...next[lastIdx],
                        text: data.reply,
                        steps: steps,
                      };
                    }
                    return next;
                  });
                }
              } catch {
                // Ignore parse errors on chunk boundary
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.reply, steps: data.steps },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "bot") {
            const updated = [...prev];
            const baseText = last.text === "Đang suy luận..." || last.text.startsWith("Đang xử lý") ? "" : last.text + "\n\n";
            updated[updated.length - 1] = {
              ...last,
              text: baseText + "⏹️ Đã dừng câu trả lời theo yêu cầu người dùng.",
            };
            return updated;
          }
          return [
            ...prev,
            { role: "bot", text: "⏹️ Đã dừng câu trả lời theo yêu cầu người dùng." },
          ];
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Lỗi kết nối server. Kiểm tra dịch vụ backend FastAPI đang hoạt động." },
        ]);
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  function stop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  function clear() {
    setMessages([]);
  }

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead-meta">
          <span className="badge-tag">Internal Finance</span>
          <span className="badge-tag">ReAct Benchmark</span>
        </div>
        <h1>Trợ Lý Duyệt Chi Phí</h1>
        <p className="subtitle">
          Hệ thống thử nghiệm so sánh hiệu năng Chatbot Baseline vs ReAct Agent tự động tra cứu chính sách & ngân sách.
        </p>
      </header>

      <div className="toolbar">
        <div className="mode-switch" role="tablist">
          <button
            className={`chatbot ${mode === "chatbot" ? "active" : ""}`}
            onClick={() => setMode("chatbot")}
            role="tab"
            aria-selected={mode === "chatbot"}
          >
            Chatbot Baseline
            <span className="mode-badge">Direct LLM</span>
          </button>
          <button
            className={`agent ${mode === "agent" ? "active" : ""}`}
            onClick={() => setMode("agent")}
            role="tab"
            aria-selected={mode === "agent"}
          >
            ReAct Agent
            <span className="mode-badge">Autonomous</span>
          </button>
        </div>

        <div className="toolbar-right">
          <button
            className={`btn-ghost ${showTests ? "active" : ""}`}
            onClick={() => setShowTests(!showTests)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {showTests ? "Ẩn Test Cases" : "Test Cases (" + testCases.length + ")"}
          </button>

          {messages.length > 0 && (
            <button className="btn-ghost" onClick={clear} title="Xóa toàn bộ hội thoại">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Xóa chat
            </button>
          )}
        </div>
      </div>

      {showTests && (
        <div className="test-panel-wrapper">
          <div className="test-panel-title">
            <span>Kịch bản thử nghiệm mẫu</span>
            <span className="test-panel-hint">Nhấp vào một câu hỏi để gửi nhanh</span>
          </div>
          <div className="test-panel-grid">
            {testCases.map((tc) => (
              <button
                key={tc.id}
                className="test-chip"
                onClick={() => send(tc.question)}
                title={`Kỳ vọng: ${tc.expected_behavior}`}
              >
                <span className="test-cat">{tc.category}</span>
                <span className="test-q">{tc.question}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat">
        {messages.length === 0 && (
          <div className="empty-slate">
            <div className="empty-slate-icon">
              {mode === "chatbot" ? "💬" : "🤖"}
            </div>
            <h3>
              {mode === "chatbot" ? "Chế độ Chatbot Baseline" : "Chế độ ReAct Agent Tự Động"}
            </h3>
            <p>
              {mode === "chatbot"
                ? "Chatbot trả lời trực tiếp dựa trên tri thức có sẵn, phù hợp cho các câu hỏi tra cứu thông thường."
                : "ReAct Agent suy luận từng bước (Reasoning + Acting), gọi công cụ kiểm tra chính sách tài chính và số dư ngân sách."}
            </p>
            <div className="empty-features">
              <span className="empty-feature-item">Hạn mức chi tiêu</span>
              <span className="empty-feature-item">Duyệt đề xuất tài chính</span>
              <span className="empty-feature-item">Tra cứu công tác phí</span>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-header">
              <div className={`msg-avatar ${m.role === "user" ? "" : mode}`}>
                {m.role === "user" ? "U" : mode === "chatbot" ? "C" : "A"}
              </div>
              <div className="msg-label">
                {m.role === "user" ? "Bạn (Nhân viên)" : mode === "chatbot" ? "Chatbot Baseline" : "ReAct Agent"}
              </div>
            </div>

            <div className="msg-body">
              <p>{m.text}</p>

              {m.steps && m.steps.length > 0 && (
                <details className="trace-container" open>
                  <summary>
                    <span>Quá trình suy luận ReAct Trace</span>
                    <span className="trace-badge">{m.steps.length} steps executed</span>
                  </summary>
                  <div className="trace-steps-list">
                    {m.steps.map((s, j) => (
                      <div key={j} className="trace-step-card">
                        <div className="step-meta">
                          <span className="step-num">Step {s.step}</span>
                          {s.tool && <span className="tool-tag">Tool: {s.tool}</span>}
                        </div>
                        <pre>{s.llm}</pre>
                        {s.observation && (
                          <div className="obs-box">
                            <div className="obs-title">Observation Result:</div>
                            <div>{s.observation}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg bot">
            <div className="msg-header">
              <div className={`msg-avatar ${mode}`}>
                {mode === "chatbot" ? "C" : "A"}
              </div>
              <div className="msg-label">
                {mode === "chatbot" ? "Chatbot Baseline" : "ReAct Agent"}
              </div>
            </div>
            <div className="typing-wrapper">
              <div className="typing-box">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <button className="stop-btn" onClick={stop} type="button" title="Dừng tạo câu trả lời">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
                <span>Dừng lại</span>
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        className="input-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) send();
        }}
      >
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập yêu cầu xin duyệt chi phí (ví dụ: Tiếp khách 2.5 triệu)..."
            disabled={loading}
          />
          {loading ? (
            <button type="button" className="stop-action-btn" onClick={stop} title="Dừng câu trả lời">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              <span>Dừng</span>
            </button>
          ) : (
            <button type="submit" className="send-btn" disabled={!input.trim()}>
              <span>Gửi</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
