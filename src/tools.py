"""
TOOL REGISTRY - Trợ Lý Duyệt Chi Phí Doanh Nghiệp
Các công cụ mà ReAct Agent có thể gọi để tra cứu ngân sách, duyệt chi, ghi log và thông báo.
"""


def escalate_to_human(query: str) -> str:
    """Chuyển yêu cầu lên chuyên gia/quản lý cấp trên khi vượt thẩm quyền hoặc cần phê duyệt đặc biệt.

    Args:
        query: Mô tả vấn đề hoặc yêu cầu cần chuyển lên cấp trên.
    Returns:
        Xác nhận đã tiếp nhận và chuyển tiếp yêu cầu.
    Khi nào dùng:
        - Khoản chi vượt hạn mức cho phép của Agent.
        - Yêu cầu nằm ngoài phạm vi xử lý tự động (xóa dữ liệu, thay đổi chính sách).
        - Trường hợp cần phán đoán của con người (chi phí bất thường, tranh chấp).
    """
    return f"Chuyên gia con người đã nhận được câu hỏi: '{query}' và sẽ phản hồi sớm."


def request_clarification(query: str) -> str:
    """Yêu cầu người dùng cung cấp thêm thông tin khi yêu cầu chi phí thiếu dữ liệu bắt buộc.

    Args:
        query: Nội dung cần người dùng làm rõ (số tiền, mục đích, phòng ban, ...).
    Returns:
        Câu hỏi làm rõ gửi lại cho người dùng.
    Khi nào dùng:
        - Thiếu số tiền, mục đích chi, hoặc phòng ban đề xuất.
        - Thông tin mập mờ, không đủ để đưa ra quyết định duyệt/từ chối.
    """
    return f"Xin vui lòng cung cấp thêm thông tin về: '{query}'."


def audit_log(action: str) -> str:
    """Ghi lại hành động duyệt chi vào nhật ký kiểm toán để truy vết sau này.

    Args:
        action: Mô tả hành động cần ghi (VD: "Duyệt chi 20 triệu cho đào tạo nhân viên").
    Returns:
        Xác nhận hành động đã được ghi vào hệ thống.
    Khi nào dùng:
        - Sau mỗi quyết định duyệt hoặc từ chối chi phí.
        - Khi chuyển yêu cầu lên cấp trên (ghi lại lý do escalate).
    """
    return f"Hành động '{action}' đã được ghi lại trong hệ thống kiểm toán."


def check_budget_remaining() -> str:
    """Tra cứu số dư ngân sách hiện tại của phòng ban.

    Returns:
        Số dư ngân sách còn lại (VNĐ).
    Khi nào dùng:
        - Trước khi duyệt bất kỳ khoản chi nào, để xác nhận còn đủ ngân sách.
        - Khi người dùng hỏi về tình trạng ngân sách.
    """
    return "Số dư ngân sách còn lại: 50,000,000 VNĐ."


def check_budget_limit() -> str:
    """Tra cứu hạn mức ngân sách tối đa được phân bổ cho phòng ban.

    Returns:
        Hạn mức ngân sách tối đa (VNĐ).
    Khi nào dùng:
        - So sánh với số dư để tính phần trăm đã sử dụng.
        - Đánh giá khoản chi có gần chạm trần ngân sách hay không.
    """
    return "Ngân sách tối đa cho phép: 100,000,000 VNĐ."


def check_request_history() -> str:
    """Tra cứu lịch sử các yêu cầu chi phí đã được nộp và trạng thái xử lý.

    Returns:
        Danh sách yêu cầu kèm trạng thái (Đã hoàn thành / Đang xử lý / Từ chối).
    Khi nào dùng:
        - Người dùng muốn xem lại các đề xuất chi đã nộp.
        - Kiểm tra trùng lặp trước khi tạo yêu cầu mới.
    """
    return "Lịch sử yêu cầu: 1. Yêu cầu A - Đã hoàn thành, 2. Yêu cầu B - Đang xử lý."


def send_notification(message: str) -> str:
    """Gửi thông báo đến phòng kế toán hoặc người liên quan sau khi duyệt/từ chối chi phí.

    Args:
        message: Nội dung thông báo (VD: "Đã duyệt chi 20 triệu cho đào tạo nhân viên").
    Returns:
        Xác nhận thông báo đã được gửi thành công.
    Khi nào dùng:
        - Sau khi duyệt chi: thông báo kế toán để thực hiện thanh toán.
        - Sau khi từ chối: thông báo người đề xuất biết lý do.
    """
    return f"Thông báo đã được gửi: '{message}'."


AVAILABLE_TOOLS = {
    "escalate_to_human": escalate_to_human,
    "request_clarification": request_clarification,
    "audit_log": audit_log,
    "check_budget_remaining": check_budget_remaining,
    "check_budget_limit": check_budget_limit,
    "check_request_history": check_request_history,
    "send_notification": send_notification,
}
