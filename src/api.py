"""
FastAPI backend — wrap Chatbot Baseline & ReAct Agent thành REST API.
Chạy: uvicorn api:app --reload  (từ thư mục src/)
"""

import os
import sys
import re
import json
import asyncio
import inspect

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from tools import AVAILABLE_TOOLS
from prompts import CHATBOT_BASELINE_PROMPT, REACT_SYSTEM_PROMPT, MAX_ITERATIONS
from providers import get_llm_provider

load_dotenv()

app = FastAPI(title="Trợ Lý Duyệt Chi Phí Doanh Nghiệp")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

provider = get_llm_provider()


class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


def _parse_action(text: str):
    m = re.search(r"Action:\s*(\w+)\[([^\]]*)\]", text)
    return (m.group(1), m.group(2).strip()) if m else None


def _execute_tool(tool_name: str, param: str) -> str:
    if tool_name not in AVAILABLE_TOOLS:
        return f"[Lỗi] Không tìm thấy công cụ '{tool_name}'."
    func = AVAILABLE_TOOLS[tool_name]
    try:
        if not param:
            return func()
        max_params = len(inspect.signature(func).parameters)
        args = [a.strip().strip("'\"") for a in param.split(",", maxsplit=max(max_params - 1, 0))]
        return func(*args)
    except Exception as e:
        return f"[Lỗi gọi tool] {e}"


@app.get("/api/test-cases")
def get_test_cases():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(base_dir, "config", "test_cases.json")
    if not os.path.exists(config_path):
        config_path = "test_cases.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _build_history_prompt(history: list[ChatMessage], current: str) -> str:
    parts = []
    for m in history:
        prefix = "User" if m.role == "user" else "Assistant"
        parts.append(f"{prefix}: {m.text}")
    parts.append(f"User: {current}")
    return "\n".join(parts)


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.post("/api/chatbot")
async def chatbot(req: ChatRequest, request: Request):
    if await request.is_disconnected():
        print("🛑 [Backend] Client disconnected before chatbot execution.")
        return {"reply": "Đã hủy", "mode": "chatbot"}

    prompt = _build_history_prompt(req.history, req.message)
    
    # Run provider generate in threadpool to keep asyncio loop responsive
    response = await asyncio.to_thread(provider.generate, prompt, system_prompt=CHATBOT_BASELINE_PROMPT)
    
    if await request.is_disconnected():
        print("🛑 [Backend] Client disconnected after chatbot execution.")
        return {"reply": "Đã hủy", "mode": "chatbot"}
        
    return {"reply": response, "mode": "chatbot"}


@app.post("/api/agent")
async def agent(req: ChatRequest, request: Request):
    async def stream():
        conversation = _build_history_prompt(req.history, req.message)

        for step in range(1, MAX_ITERATIONS + 1):
            # 1. Check client disconnect before LLM call
            if await request.is_disconnected():
                print(f"🛑 [Backend] Client disconnected before Step {step}. Aborting ReAct Agent loop.")
                break

            print(f"⚙️ [Backend] ReAct Agent Step {step}/{MAX_ITERATIONS} starting...")

            # Run blocking LLM call in thread pool so async loop & disconnect detector remain active
            llm_output = await asyncio.to_thread(provider.generate, conversation, system_prompt=REACT_SYSTEM_PROMPT)

            # 2. Check client disconnect right after LLM call
            if await request.is_disconnected():
                print(f"🛑 [Backend] Client disconnected after LLM call at Step {step}. Aborting.")
                break

            if "Final Answer:" in llm_output:
                final = llm_output.split("Final Answer:")[-1].strip()
                yield _sse("step", {"step": step, "llm": llm_output, "final": True})
                yield _sse("done", {"reply": final})
                return

            parsed = _parse_action(llm_output)
            if not parsed:
                yield _sse("step", {"step": step, "llm": llm_output, "error": "Không parse được Action"})
                yield _sse("done", {"reply": llm_output})
                return

            tool_name, param = parsed

            # 3. Check client disconnect before tool execution
            if await request.is_disconnected():
                print(f"🛑 [Backend] Client disconnected before tool '{tool_name}' execution. Aborting.")
                break

            print(f"🔧 [Backend] Executing tool: {tool_name}[{param}]")
            observation = await asyncio.to_thread(_execute_tool, tool_name, param)

            # 4. Check client disconnect after tool execution
            if await request.is_disconnected():
                print(f"🛑 [Backend] Client disconnected after tool '{tool_name}' execution. Aborting.")
                break

            yield _sse("step", {"step": step, "llm": llm_output, "tool": tool_name, "param": param, "observation": observation})

            if tool_name in ("request_clarification", "escalate_to_human"):
                yield _sse("done", {"reply": observation})
                return

            conversation += f"\n{llm_output}\nObservation: {observation}"

        if not await request.is_disconnected():
            yield _sse("done", {"reply": f"GUARDRAIL: Đã đạt giới hạn {MAX_ITERATIONS} bước."})
        else:
            print("🛑 [Backend] ReAct Agent execution stopped due to client cancellation.")

    return StreamingResponse(stream(), media_type="text/event-stream")


@app.get("/api/info")
def info():
    return {
        "provider": provider.__class__.__name__,
        "model": getattr(provider, "model_name", "mock"),
        "tools": list(AVAILABLE_TOOLS.keys()),
        "max_iterations": MAX_ITERATIONS,
    }
