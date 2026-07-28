"""
🚀 CORE AGENT APP (Dành cho Role 4: Core Agent Developer)
File chính ghép nối tất cả các thành phần: Tools + Prompts + Test Cases + Multi-Provider.
"""

import inspect
import json
import os
import re
import sys
from dotenv import load_dotenv

# Đảm bảo import các module cùng thư mục src/ hoạt động mượt mà
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Đảm bảo in ra Tiếng Việt và Emojis không bị lỗi trên Windows Console
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

def load_test_cases():
    """Đọc bộ test cases từ config/test_cases.json của Role 1"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(base_dir, "config", "test_cases.json")
    
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


if __name__ == "__main__":
    print("==================================================")
    print("TRỢ LÝ DUYỆT CHI PHÍ DOANH NGHIỆP - LAB 3: CHATBOT VS REACT AGENT")
    print("==================================================")
    
    # Khởi tạo Multi-Provider LLM Adapter (Đọc từ biến môi trường LLM_PROVIDER)
    provider = get_llm_provider()
    model_name = getattr(provider, "model_name", "Offline Mock Mode")
    print(f"🔌 LLM Provider đang hoạt động: {provider.__class__.__name__} (Model: {model_name})")
    
    tests = load_test_cases()
    print(f"✅ Đã tải thành công {len(tests)} Test Cases từ config/test_cases.json\n")
    
    # Chạy thử câu test số 3
    sample_query = tests[2]["question"]
    
    print("--- DEMO 1: CHẠY TRÊN CHATBOT BASELINE ---")
    run_baseline_chatbot(sample_query, provider)
    
    print("\n--- DEMO 2: CHẠY TRÊN REACT AGENT ---")
    run_react_agent(sample_query, provider)
