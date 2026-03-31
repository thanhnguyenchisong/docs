⭐ 1. Subagents hữu ích khi nào?
Ý tưởng cốt lõi:

Subagents hoạt động tốt nhất khi phần “khám phá” (exploration) tách biệt khỏi phần “thực thi” (execution).
Bạn chỉ cần kết quả, không cần xem từng bước subagent đã làm.

Các trường hợp subagent tỏa sáng:
✔ Khi bạn chỉ cần kết quả cuối, không cần theo dõi từng bước
Nếu việc subagent dò tìm, thử nghiệm, tìm file… chỉ làm rác context của main thread, hãy để subagent làm toàn bộ và trả về 1 summary.
✔ Khi công việc khám phá sẽ làm loãng context chính
Thay vì để main thread đọc 20 file, subagent đọc hết và gửi lại kết luận ngắn gọn.
✔ Khi bạn cần một góc nhìn độc lập, không dính lịch sử của main thread
Ví dụ: review code do chính main thread viết.

⭐ 2. Các loại nhiệm vụ subagent làm rất tốt
✅ Research
Ví dụ: tìm nơi JWT được validate trong codebase.
Subagent có thể đọc hàng chục file → main thread chỉ nhận 1 dòng kết luận.
✅ Code Review
Main thread thường “mù quáng” với code nó vừa viết → feedback yếu.
Reviewer subagent có bối cảnh độc lập → review sâu và khách quan hơn.
✅ Custom system prompts
Một số tác vụ cần system prompt hoàn toàn khác:

Copywriting subagent: giọng văn mềm mại, marketing → khác hẳn Claude Code.
Styling/CSS subagent: tự động load file design system vào context.

Subagents cho phép tạo “persona + knowledge” chuyên biệt.

⭐ 3. Khi nào subagents gây hại?
Subagents không phải lúc nào cũng giúp. Ba pattern thường gây lỗi:
❌ Expert personas giả tạo
“Bạn là chuyên gia Python / Kubernetes…”
→ Không thêm năng lực gì, vì Claude đã có kiến thức này.
❌ Pipelines nhiều subagent nối tiếp nhau
Ví dụ: reproduce bug → debug → fix (3 agent).
Hỏng vì:
→ mỗi bước cần kết quả chi tiết từ bước trước, nhưng chi tiết bị “nén” thành summary → mất thông tin quan trọng.
❌ Test runner subagent
Main thread cần thấy full test output.
Subagent chỉ trả “test failed”, thiếu log chi tiết → khó debug → tệ hơn nhiều.

⭐ 4. Quy tắc quyết định dùng subagent
Trang đưa một decision rule cực quan trọng:

Hãy tự hỏi: công việc trung gian có quan trọng không?


Không quan trọng → dùng subagent
Quan trọng → giữ ở main thread


⭐ 5. Gợi ý dùng subagent đúng chuẩn
✔ Nên dùng cho:

Research / khảo sát / đọc code
Code review
Tác vụ cần custom system prompt mạnh

✘ Tránh dùng cho:

Expert personas không thêm năng lực
Quy trình nhiều bước phụ thuộc lẫn nhau
Chạy test cần log đầy đủ


🏁 KẾT LUẬN
Subagents rất mạnh, nhưng chỉ hữu ích khi:

tác vụ cần khám phá nhiều nhưng bạn chỉ cần kết luận cuối,
hoặc khi bạn muốn một agent chuyên môn hóa với bối cảnh và system prompt riêng.

Ngược lại, khi bạn cần quan sát từng bước, hoặc nhiệm vụ cần toàn bộ dữ kiện chi tiết → main thread làm tốt hơn.