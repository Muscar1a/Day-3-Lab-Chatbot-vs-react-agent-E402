"""
🚀 CORE AGENT APP (Role 4: Core Agent Developer — Thành An)
Chủ đề 8: Trợ lý Duyệt Chi Phí Doanh Nghiệp
Kết nối: Tools + Prompts + Test Cases + Multi-Provider + Dynamic ReAct Loop.
"""

import inspect
import json
import os
import re
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Import các thành phần từ file của Role 2, Role 3 & Multi-Provider Adapter
from tools import AVAILABLE_TOOLS
from prompts import CHATBOT_BASELINE_PROMPT, REACT_SYSTEM_PROMPT, MAX_ITERATIONS
from providers import get_llm_provider

load_dotenv()


# =============================================================================
# TOOL DESCRIPTION (cho prompt động)
# =============================================================================
def _build_tool_list() -> str:
    lines = []
    for i, (name, fn) in enumerate(AVAILABLE_TOOLS.items(), 1):
        doc = (fn.__doc__ or "").strip()
        # lấy dòng description ngắn từ docstring
        desc = ""
        for line in doc.split("\n"):
            if "Mô tả:" in line:
                desc = line.split("Mô tả:")[1].strip()
                break
        lines.append(f"{i}. {name}: {desc}")
    return "\n".join(lines)


# =============================================================================
# PARSER: Trích xuất Action từ LLM response
# =============================================================================
def _parse_action(llm_text: str) -> tuple:
    """
    Parse: Action: tên_hàm[tham_số]
    Trả về (function_name, arg) hoặc (None, None) nếu không parse được.
    """
    match = re.search(r"Action:\s*(\w+)\[([^\]]*)\]", llm_text)
    if match:
        return match.group(1), match.group(2).strip().strip("'\"")
    return None, None


def _has_final_answer(llm_text: str) -> str | None:
    """Kiểm tra xem LLM đã trả về Final Answer chưa."""
    match = re.search(r"Final Answer:\s*(.*)", llm_text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


# =============================================================================
# DYNAMIC REACT AGENT LOOP
# =============================================================================
def run_react_agent(user_query: str, provider) -> str:
    """
    ReAct Agent dynamic loop: gửi prompt → LLM sinh Action → thực thi Tool → Observation → lặp.
    """
    tool_list = _build_tool_list()
    system = REACT_SYSTEM_PROMPT + f"\n\nDanh sách công cụ hiện tại:\n{tool_list}\n"
    
    # Fallback kiểm tra nếu file ở thư mục hiện tại
    if not os.path.exists(config_path):
        config_path = "test_cases.json"
        
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def run_baseline_chatbot(user_query: str, provider):
    """
    Dựng Chatbot gốc (Baseline) không có công cụ.
    """
    print(f"\n💬 [CHATBOT BASELINE] Câu hỏi: {user_query}")
    print(f"⚙️ System Prompt: {CHATBOT_BASELINE_PROMPT.strip()}")
    
    # Gọi LLM Provider thực hiện sinh câu trả lời
    response = provider.generate(user_query, system_prompt=CHATBOT_BASELINE_PROMPT)
    print(f"🤖 Chatbot trả lời:\n{response}")


def parse_action(text: str):
    """Parse 'Action: tool_name[param]' từ output LLM. Trả về (tool_name, param) hoặc None."""
    m = re.search(r"Action:\s*(\w+)\[([^\]]*)\]", text)
    if m:
        return m.group(1), m.group(2).strip()
    return None


def execute_tool(tool_name: str, param: str) -> str:
    """Gọi tool từ AVAILABLE_TOOLS, trả về kết quả hoặc thông báo lỗi."""
    if tool_name not in AVAILABLE_TOOLS:
        return f"[Lỗi] Không tìm thấy công cụ '{tool_name}'. Các tool khả dụng: {', '.join(AVAILABLE_TOOLS.keys())}"
    func = AVAILABLE_TOOLS[tool_name]
    try:
        if not param:
            return func()
        max_params = len(inspect.signature(func).parameters)
        args = [a.strip().strip("'\"") for a in param.split(",", maxsplit=max(max_params - 1, 0))]
        return func(*args)
    except Exception as e:
        return f"[Lỗi gọi tool] {e}"


def run_react_agent(user_query: str, provider):
    """Vòng lặp ReAct: LLM sinh Thought/Action → parse → gọi tool → Observation → lặp."""
    print(f"\n🤖 [REACT AGENT] Câu hỏi: {user_query}")

    conversation = f"User: {user_query}"

    for step in range(1, MAX_ITERATIONS + 1):
        print(f"\n--- Vòng lặp ReAct (Step {step}/{MAX_ITERATIONS}) ---")

        llm_output = provider.generate(conversation, system_prompt=REACT_SYSTEM_PROMPT)
        print(llm_output)

        if "Final Answer:" in llm_output:
            final = llm_output.split("Final Answer:")[-1].strip()
            print(f"\n✅ [KẾT QUẢ] {final}")
            return

        parsed = parse_action(llm_output)
        if not parsed:
            print("\n⚠️ LLM không sinh Action hợp lệ. Dừng.")
            return

        tool_name, param = parsed
        observation = execute_tool(tool_name, param)
        print(f"👁️ Observation: {observation}")

        conversation += f"\n{llm_output}\nObservation: {observation}"

    print(f"\n🛡️ GUARDRAIL: Đã đạt giới hạn {MAX_ITERATIONS} bước. Ngắt lặp an toàn.")

# =============================================================================
# BASELINE CHATBOT
# =============================================================================
def run_baseline_chatbot(user_query: str, provider):
    print(f"\n💬 [CHATBOT BASELINE] Câu hỏi: {user_query}")
    response = provider.generate(user_query, system_prompt=CHATBOT_BASELINE_PROMPT)
    print(f"🤖 Chatbot trả lời:\n{response}")


# =============================================================================
# TEST CASE LOADER
# =============================================================================
def load_test_cases() -> list:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(base_dir, "config", "test_cases.json")
    if not os.path.exists(config_path):
        config_path = "test_cases.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


# =============================================================================
# MAIN
# =============================================================================
if __name__ == "__main__":
    print("=" * 60)
    print("🏫 ĐẠI HỌC VINUNI - BÀI LAB 3: CHATBOT VS REACT AGENT")
    print("📋 Chủ đề 8: Trợ lý Duyệt Chi Phí Doanh Nghiệp")
    print("=" * 60)

    provider = get_llm_provider()
    model_name = getattr(provider, "model_name", "Offline Mock Mode")
    print(f"🔌 LLM Provider: {provider.__class__.__name__} (Model: {model_name})")

    tests = load_test_cases()
    print(f"✅ Đã tải {len(tests)} Test Cases\n")
    
    # Tìm test case multi-step đầu tiên để demo
    multi_test = next((t for t in tests if "Cần Tool" in t.get("category", "")), tests[0])
    
    print("=" * 60)
    print("DEMO 1: CHATBOT BASELINE")
    print("=" * 60)
    run_baseline_chatbot(multi_test["question"], provider)

    print("\n" + "=" * 60)
    print("DEMO 2: REACT AGENT (Dynamic Loop)")
    print("=" * 60)
    result = run_react_agent(multi_test["question"], provider)
    print(f"\n✅ Kết quả cuối cùng: {result}")
