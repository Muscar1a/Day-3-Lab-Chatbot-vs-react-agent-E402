# CONTEXT.md — Lab 3: Chatbot vs ReAct Agent (Topic 8: Cost Review Assistant)

## 1. PROJECT SUMMARY

| Item | Detail |
|------|--------|
| **Repo origin** | `Muscar1a/Day-3-Lab-Chatbot-vs-react-agent-E402` (branch: `muscar1a-main`) |
| **Lab** | VinUni Bài Lab 3: Chatbot vs ReAct Agent |
| **Topic** | #8: Trợ lý Duyệt Chi Phí Doanh Nghiệp (Corporate Expense Approval Assistant) |
| **Goal** | ReAct Agent that reviews/approves/rejects expense requests against national laws + company policies |
| **Python** | 3.14.6 (LLM deps) / 3.11.15 (vnstock via uv) |
| **Venvs** | `.venv/` (3.14, LLM deps) + `.venv-py311/` (3.11, vnstock + data libs) |
| **LLM** | Google AI Studio (gemma-4-26b-a4b-it) via GeminiProvider |
| **Fallback** | gemini-2.5-flash for faster dev; mock for offline testing |

## 2. 4-LEVEL AI SPECTRUM

| Level | Type | What It Does |
|-------|------|-------------|
| 1 | Rule-Based Bot | if/else keyword matching (no LLM) |
| 2 | LLM Chatbot | Pure LLM, no tool use — answers from static knowledge |
| 3 | **ReAct Agent** | Thought → Action → Observation loop with tools (IMPLEMENTED) |
| 4 | Autonomous Agent | Self-planning, memory, goal decomposition (Bonus +10%) |

## 3. LEGAL & POLICY FRAMEWORK (embedded in prompts)

| Source | Coverage |
|--------|----------|
| Thông tư 40/2017/TT-BTC | Công tác phí, hội nghị, tiếp khách |
| Nghị định 132/2020/NĐ-CP | Giao dịch liên kết, giá thị trường |
| Luật Doanh nghiệp 2020 | Quyền và nghĩa vụ doanh nghiệp |
| Company Policy | Hạn mức theo cấp bậc, tỷ lệ tiếp khách ≤15%, yêu cầu hóa đơn VAT >500K, phê duyệt 2 cấp |

## 4. TOOLS (src/tools.py)

| Tool | Input | Purpose |
|------|-------|---------|
| `check_budget_remaining` | none | Số dư ngân sách hiện tại |
| `check_budget_limit` | none | Hạn mức ngân sách tối đa |
| `check_request_history` | none | Lịch sử các yêu cầu trước |
| `audit_log` | action: str | Ghi nhật ký kiểm toán |
| `escalate_to_human` | query: str | Chuyển cho người phê duyệt |
| `request_clarification` | query: str | Yêu cầu làm rõ thông tin |
| `send_notification` | message: str | Gửi thông báo |

## 5. REACT LOOP (Dynamic — src/app.py)

- Parses LLM output with regex: `Action: tên_hàm[tham_số]` and `Final Answer: ...`
- Feeds `Observation:` back into conversation for next iteration
- Guardrail: `MAX_ITERATIONS=5`, `TIMEOUT_SECONDS=15`
- MockProvider simulates full ReAct flow for offline demo

## 6. TEST CASES (config/test_cases.json)

| ID | Category | Scenario |
|----|----------|----------|
| 1 | 🟢 Simple | Hỏi về quy định hóa đơn VAT |
| 2 | 🟢 Simple | Hạn mức công tác phí theo cấp bậc |
| 3 | 🟡 Multi-step | Đề xuất chi phí + kiểm tra ngân sách |
| 4 | 🟡 Multi-tool | Lịch sử + ngân sách + đề xuất mới |
| 5 | 🔴 Edge Case | 200M quà cá nhân, không hóa đơn → từ chối |

## 7. TEST RESULTS

### MockProvider (offline)
- TEST 1 (Baseline): ✅ Answers VAT policy with Thông tư 40 reference
- TEST 2 (ReAct): ✅ check_budget_remaining → approves 5M with conditions + legal cite
- TEST 3 (ReAct Edge Case): ✅ Rejects 200M personal gift citing 3 laws + audit_log

### GeminiProvider + gemma-4-26b-a4b-it (real LLM)
- Gemma-4-26b generates correct ReAct `Action:` format: ✅
- Cold start: ~45-120s first call. Subsequent calls: ~5-20s
- Fallback for speed: set `LLM_MODEL=gemini-2.5-flash` in .env

## 8. KNOWN ISSUES

1. **Python 3.14 too new:** vnstock needs numpy → use `.venv-py311/` via uv
2. **Gemma-4-26b cold start:** Large model, first call 45-120s. Switch to `gemini-2.5-flash` for fast dev iteration
3. **GeminiProvider timeout:** Added `HttpOptions(timeout=60000)` — adjust in `src/providers.py` if needed
4. **Static tools:** check_budget/check_history return hardcoded values — connect to real DB for production
5. **Auto-detect chatbot vs agent:** hybrid_flowchart.mermaid needed (Mốc 4)

## 9. PROJECT SKILL

`.agents/skills/vn-financial-data-setup/SKILL.md` — TDD-based skill encoding all setup workarounds (uv venv, vnstock v4 API migration, dead libraries).

## 10. ROLE ASSIGNMENT

| Role | File | Person |
|------|------|--------|
| 1: Product Architect | `config/test_cases.json` | Ngọc Lan |
| 2: Tool Engineer | `src/tools.py` | Quang Nhật |
| 3: Prompt Engineer | `src/prompts.py` | **Quốc Thanh** ✅ |
| 4: Core Developer | `src/app.py` | Thành An |
| 5: Observability | `docs/trace_eval.md` | (TBD) |
