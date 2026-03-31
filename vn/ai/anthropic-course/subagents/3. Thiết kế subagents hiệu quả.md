#  Designing Effective Subagents
Trang này giải thích cách thiết kế subagent sao cho hoạt động hiệu quả, sau khi bạn đã biết cách tạo subagent. Mục tiêu là tránh việc subagent chạy lan man, mất thời gian, hoặc trả kết quả mà agent chính không thể sử dụng.

⭐ 1. Vai trò của mô tả (description)

Khi bạn gửi tin nhắn cho agent chính, name và description của tất cả subagent sẽ được đưa vào system prompt.
Description quyết định:

Khi nào subagent được kích hoạt
Nội dung input prompt mà agent chính gửi cho subagent



➡️ Viết description rõ ràng giúp agent chính giao nhiệm vụ đúng trọng tâm, tránh mơ hồ.
Ví dụ: thêm yêu cầu như “hãy chỉ rõ file cần review” sẽ buộc agent chính đưa chỉ dẫn cụ thể hơn.

⭐ 2. Định nghĩa một cấu trúc output rõ ràng
Đây là yếu tố quan trọng nhất để subagent hoạt động hiệu suất.
Lợi ích:

Subagent có điểm kết thúc tự nhiên, không chạy quá lâu.
Output rõ ràng → agent chính dễ hiểu và xử lý.

Ví dụ format cho code review:

Summary
Critical issues
Major issues
Minor issues
Recommendations
Approval status

```
Provide your review in a structured format:

1. Summary: Brief overview of what you reviewed and overall assessment
2. Critical Issues: Any security vulnerabilities, data integrity risks,
   or logic errors that must be fixed immediately
3. Major Issues: Quality problems, architecture misalignment, or
   significant performance concerns
4. Minor Issues: Style inconsistencies, documentation gaps, or
   minor optimizations
5. Recommendations: Suggestions for improvement, refactoring
   opportunities, or best practices to apply
6. Approval Status: Clear statement of whether the code is ready
   to merge/deploy or requires changes
```

➡️ Một format tốt giúp subagent hoạt động như checklist: hoàn thành từng mục và dừng đúng lúc.

⭐ 3. Yêu cầu subagent báo cáo “obstacles” (vướng mắc)
Nếu subagent gặp sự cố như:

Lỗi môi trường
Thiếu dependency
Cần dùng lệnh đặc biệt
Setting hệ thống bất thường

Thì những thông tin này cần được đưa vào phần output để agent chính không phải tự khám phá lại từ đầu.
➡️ Cách tốt nhất: thêm mục “Obstacles Encountered” vào output format.

⭐ 4. Giới hạn quyền truy cập vào tool
Không phải subagent nào cũng nên có quyền dùng mọi tool.
Nguyên tắc:

Research / đọc dữ liệu → chỉ cần Glob, Grep, Read
Code reviewer → cần Bash để xem diff, không cần quyền Edit/Write
Agent chỉnh sửa code → cần Edit + Write

➡️ Giới hạn đúng giúp:

Tránh tác động ngoài ý muốn
Làm rõ vai trò từng subagent


⭐ 5. Tổng kết – 4 yếu tố tạo nên subagent hiệu quả

Description cụ thể → Điều khiển thời điểm chạy & nội dung chỉ dẫn.
Output format có cấu trúc → Dễ hiểu, dễ dừng đúng lúc.
Báo cáo obstacles → Giúp main agent tiết kiệm thời gian & token.
Giới hạn tool hợp lý → Tránh rủi ro và tăng tính tập trung.

Khi kết hợp cả 4 yếu tố này, subagent trở thành một worker rõ ràng, nhanh gọn, và đáng tin cậy, thay vì một công cụ chạy lung tung và tốn tài nguyên.