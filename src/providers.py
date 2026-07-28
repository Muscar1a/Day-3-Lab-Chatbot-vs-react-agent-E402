"""
🔌 MULTI-PROVIDER LLM ADAPTER (OpenAI, Gemini, Anthropic, OpenRouter & Offline Mock)
Hỗ trợ chuyển đổi linh hoạt giữa các nhà cung cấp AI chỉ bằng cách đổi biến môi trường LLM_PROVIDER.
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Đảm bảo in ra Tiếng Việt và Emojis không bị lỗi trên Windows Console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

class BaseLLMProvider:
    """Interface cơ sở cho tất cả các LLM Provider"""
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        raise NotImplementedError


class GeminiProvider(BaseLLMProvider):
    """Google Gemini Provider"""
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model or os.getenv("LLM_MODEL") or "gemini-2.5-flash"
        
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            return "[Gemini Error]: Chưa cấu hình GEMINI_API_KEY trong file .env!"
        try:
            from google import genai
            from google.genai.types import HttpOptions
            client = genai.Client(
                api_key=self.api_key,
                http_options=HttpOptions(timeout=60000)
            )
            contents = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            response = client.models.generate_content(
                model=self.model_name,
                contents=contents
            )
            return response.text
        except Exception as e:
            return f"[Gemini Exception]: {str(e)}"


class OpenAIProvider(BaseLLMProvider):
    """OpenAI Provider (GPT-4o, GPT-3.5-turbo, etc.)"""
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model_name = model or os.getenv("LLM_MODEL") or "gpt-4o-mini"
        
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key or self.api_key == "your_openai_api_key_here":
            return "[OpenAI Error]: Chưa cấu hình OPENAI_API_KEY trong file .env!"
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = client.chat.completions.create(
                model=self.model_name,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[OpenAI Exception]: {str(e)}"


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude Provider (Claude 3.5 Sonnet, Claude 3 Haiku)"""
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model_name = model or os.getenv("LLM_MODEL") or "claude-3-haiku-20240307"
        
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key or self.api_key == "your_anthropic_api_key_here":
            return "[Anthropic Error]: Chưa cấu hình ANTHROPIC_API_KEY trong file .env!"
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            kwargs = {
                "model": self.model_name,
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            }
            if system_prompt:
                kwargs["system"] = system_prompt
                
            response = client.messages.create(**kwargs)
            return response.content[0].text
        except Exception as e:
            return f"[Anthropic Exception]: {str(e)}"


class OpenRouterProvider(BaseLLMProvider):
    """OpenRouter Provider (Hỗ trợ gọi mọi model qua OpenRouter API)"""
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.model_name = model or os.getenv("LLM_MODEL") or "google/gemini-2.5-flash"
        
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key or self.api_key == "your_openrouter_api_key_here":
            return "[OpenRouter Error]: Chưa cấu hình OPENROUTER_API_KEY trong file .env!"
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": self.model_name,
                "messages": messages
            }
            res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"[OpenRouter API Error {res.status_code}]: {res.text}"
        except Exception as e:
            return f"[OpenRouter Exception]: {str(e)}"


class MockProvider(BaseLLMProvider):
    """Offline Mock Provider (Cho bài test không cần kết nối API)

    Mô phỏng ReAct Agent responses cho domain duyệt chi phí.
    Dùng để demo offline khi chưa có API key.
    """
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        text = prompt.lower()

        # Multi-step: kiểm tra ngân sách + đề xuất chi phí
        if "ngân sách" in text and ("đề xuất" in text or "duyệt" in text):
            # Nếu đã có Observation trong prompt → đưa ra Final Answer
            if "observation:" in text and "50,000,000" in text:
                return (
                    "Thought: Ngân sách còn 50,000,000 VNĐ, hạn mức tối đa 100,000,000 VNĐ. "
                    "Khoản đề xuất 5,000,000 VNĐ nằm trong hạn mức. "
                    "Tuy nhiên cần kiểm tra yêu cầu có hóa đơn hợp lệ không. "
                    "Đối chiếu Thông tư 40/2017/TT-BTC: công tác phí được duyệt khi có hóa đơn > 500,000 VNĐ.\n"
                    "Final Answer: Khoản chi 5,000,000 VNĐ đi gặp khách hàng được DUYỆT với điều kiện: "
                    "(1) Có hóa đơn VAT hợp lệ, (2) Trong hạn mức ngân sách (còn 50M/100M), "
                    "(3) Phù hợp Thông tư 40/2017/TT-BTC và chính sách công ty. "
                    "Vui lòng nộp hóa đơn để hoàn tất phê duyệt."
                )
            # Lần đầu → gọi kiểm tra ngân sách
            return "Thought: Cần kiểm tra số dư ngân sách hiện tại để đối chiếu.\nAction: check_budget_remaining[]"

        # Multi-step: kiểm tra lịch sử + ngân sách + đề xuất
        if "lịch sử" in text and "ngân sách" in text:
            if "observation:" in text:
                return (
                    "Thought: Đã có lịch sử yêu cầu và số dư ngân sách. "
                    "Ngân sách còn 50,000,000 VNĐ, đề xuất thêm 3,000,000 VNĐ còn trong hạn mức. "
                    "Không phát hiện yêu cầu trùng lặp trong lịch sử.\n"
                    "Final Answer: Có thể đề xuất thêm 3,000,000 VNĐ chi phí tiếp khách. "
                    "Ngân sách sau phê duyệt: 47,000,000 VNĐ. "
                    "Lưu ý: tỷ lệ chi phí tiếp khách phải ≤ 15% tổng chi phí theo chính sách công ty."
                )
            return "Thought: Cần kiểm tra lịch sử yêu cầu và số dư ngân sách.\nAction: check_request_history[]"

        # Edge case: chi phí cá nhân, không hóa đơn, vượt hạn mức
        if "cá nhân" in text or ("200,000,000" in text) or ("không có hóa đơn" in text):
            return (
                "Thought: Khoản chi 200,000,000 VNĐ vượt xa hạn mức 100,000,000 VNĐ. "
                "Mua quà tặng cá nhân không liên quan công việc. "
                "Không có hóa đơn — vi phạm chính sách công ty (yêu cầu hóa đơn VAT > 500,000 VNĐ). "
                "Cần từ chối và ghi log kiểm toán.\n"
                "Action: audit_log['Từ chối khoản chi 200M - cá nhân, không hóa đơn']\n"
                "Final Answer: ❌ TỪ CHỐI. Lý do: (1) Vượt hạn mức ngân sách (200M > 100M), "
                "(2) Chi phí cá nhân không thuộc phạm vi công ty theo Luật Doanh nghiệp 2020, "
                "(3) Không có hóa đơn hợp lệ — vi phạm chính sách hóa đơn VAT của công ty. "
                "Vui lòng liên hệ kế toán trưởng nếu cần giải trình thêm."
            )

        # Simple: hỏi về quy định, chính sách
        if "quy định" in text or "hóa đơn vat" in text:
            return (
                "Thought: Đây là câu hỏi kiến thức, không cần gọi Tool. Có thể trả lời từ hiểu biết.\n"
                "Final Answer: Theo Thông tư 40/2017/TT-BTC và chính sách công ty: "
                "Mọi khoản chi > 500,000 VNĐ phải có hóa đơn VAT hợp lệ. "
                "Chi phí tiếp khách không vượt quá 15% tổng chi phí. "
                "Quy trình phê duyệt 2 cấp: Trưởng phòng → Giám đốc."
            )

        if "hạn mức" in text or "công tác phí" in text:
            return (
                "Thought: Đây là câu hỏi về chính sách nội bộ, không cần gọi Tool.\n"
                "Final Answer: Hạn mức công tác phí theo chính sách công ty: "
                "Nhân viên: 1,000,000 VNĐ/ngày, Trưởng phòng: 2,000,000 VNĐ/ngày, "
                "Giám đốc: 5,000,000 VNĐ/ngày. "
                "Bao gồm chi phí đi lại, ăn ở. Cần hóa đơn hợp lệ để quyết toán."
            )

        # Fallback: tạo Action mẫu phù hợp domain
        if "ngân sách" in text:
            return "Thought: Người dùng hỏi về ngân sách, cần kiểm tra thực tế.\nAction: check_budget_remaining[]"
        if "kiểm toán" in text or "audit" in text:
            return "Thought: Cần ghi log kiểm toán cho hành động này.\nAction: audit_log['kiểm tra yêu cầu']"

        return (
            "Thought: Tôi có thể trả lời câu hỏi này từ kiến thức về quy định doanh nghiệp.\n"
            "Final Answer: [Mock Provider] Tôi là trợ lý duyệt chi phí. "
            "Vui lòng cung cấp thêm chi tiết về khoản chi bạn muốn đề xuất: "
            "số tiền, mục đích, có hóa đơn không, và cấp bậc của bạn."
        )


def get_llm_provider(provider_name: str = None) -> BaseLLMProvider:
    """Factory function tự chọn Provider từ biến môi trường LLM_PROVIDER"""
    name = (provider_name or os.getenv("LLM_PROVIDER") or "mock").lower().strip()
    
    if name == "gemini":
        return GeminiProvider()
    elif name == "openai":
        return OpenAIProvider()
    elif name == "anthropic":
        return AnthropicProvider()
    elif name == "openrouter":
        return OpenRouterProvider()
    else:
        return MockProvider()


if __name__ == "__main__":
    print("=== TEST MULTI-PROVIDER LLM ADAPTER ===")
    provider = get_llm_provider()
    print(f"✅ Provider đang dùng: {provider.__class__.__name__}")
    print(f"🤖 User Query: Hello")
    print(f"💬 Response  : {provider.generate('Hello')}")
