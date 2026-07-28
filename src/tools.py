"""
🛠️ TOOL REGISTRY & SCHEMAS (Dành cho Role 2: Tool & Spec Engineer)
Nơi khai báo tất cả các "món đồ nghề" mà ReAct Agent có thể gọi.
"""

def escalate_to_human(query: str) -> str:
    """
    Tool: escalate_to_human
    Mô tả: Gọi một chuyên gia con người để xử lý câu hỏi hoặc vấn đề phức tạp.
    Input: query (str) - Câu hỏi hoặc vấn đề cần được chuyên gia con người xử lý.
    Output: str - Phản hồi từ chuyên gia con người.
    """
    # Logic giả lập để gọi chuyên gia con người
    return f"Chuyên gia con người đã nhận được câu hỏi: '{query}' và sẽ phản hồi sớm."

def request_clarification(query: str) -> str:
    """
    Tool: request_clarification
    Mô tả: Yêu cầu người dùng cung cấp thêm thông tin hoặc làm rõ câu hỏi.
    Input: query (str) - Câu hỏi hoặc vấn đề cần làm rõ.
    Output: str - Yêu cầu làm rõ từ người dùng.
    """
    # Logic giả lập để yêu cầu làm rõ
    return f"Xin vui lòng cung cấp thêm thông tin về: '{query}'."

def audit_log(action: str) -> str:
    """
    Tool: audit_log
    Mô tả: Ghi lại các hành động hoặc sự kiện quan trọng để phục vụ kiểm toán.
    Input: action (str) - Hành động hoặc sự kiện cần ghi lại.
    Output: str - Xác nhận rằng hành động đã được ghi lại.
    """
    # Logic giả lập để ghi log
    return f"Hành động '{action}' đã được ghi lại trong hệ thống kiểm toán."

def check_budget_remaining() -> str:
    """
    Tool: check_budget_remaining
    Mô tả: Kiểm tra số dư ngân sách còn lại.
    Input: None
    Output: str - Thông tin về số dư ngân sách.
    """
    return "Số dư ngân sách còn lại: 50,000,000 VNĐ."

def check_budget_limit() -> str:
    return "Ngân sách tối đa cho phép: 100,000,000 VNĐ."


def check_request_history() -> str:
    """
    Tool: check_request_history
    Mô tả: Kiểm tra lịch sử các yêu cầu đã được thực hiện.
    Input: None
    Output: str - Thông tin về lịch sử yêu cầu.
    """
    return "Lịch sử yêu cầu: 1. Yêu cầu A - Đã hoàn thành, 2. Yêu cầu B - Đang xử lý."

def send_notification(message: str) -> str:
    """
    Tool: send_notification
    Mô tả: Gửi thông báo đến người dùng hoặc hệ thống.
    Input: message (str) - Nội dung thông báo cần gửi.
    Output: str - Xác nhận rằng thông báo đã được gửi.
    """
    # Logic giả lập để gửi thông báo
    return f"Thông báo đã được gửi: '{message}'."


# Danh sách các tool được đăng ký để Agent sử dụng
AVAILABLE_TOOLS = {
    "escalate_to_human": escalate_to_human,
    "request_clarification": request_clarification,
    "audit_log": audit_log,
    "check_budget_remaining": check_budget_remaining,
    "check_budget_limit": check_budget_limit,
    "check_request_history": check_request_history,
    "send_notification": send_notification,
}
