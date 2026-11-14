# Viết tiếng Anh

Web app dịch và viết **email, tin nhắn, văn bản** từ tiếng Việt sang tiếng Anh dùng cho công việc, bằng Claude.

## Cách dùng

1. Chọn **loại**: Email (có tiêu đề, lời chào, chữ ký) · Tin nhắn (ngắn, tự nhiên, cho Zalo/WhatsApp/Slack) · Văn bản (giữ nguyên tiêu đề, gạch đầu dòng).
2. Chọn **giọng**: Trang trọng · Lịch sự, tự nhiên · Thân thiện.
3. Chọn **cách làm**:
   - *Dịch sát ý*: bạn đã viết hoàn chỉnh bằng tiếng Việt và chỉ cần chuyển sang tiếng Anh.
   - *Viết lại cho tự nhiên*: bạn chỉ ghi ý chính hoặc nháp lộn xộn, AI viết thành bài hoàn chỉnh.
4. Dán nội dung, bấm **Viết tiếng Anh** (hoặc Ctrl+Enter).
5. Đọc **bản dịch ngược** để chắc bản tiếng Anh nói đúng ý mình, rồi copy.

Mở **Cài đặt** ở cuối trang để đặt chữ ký, **bảng thuật ngữ** (ví dụ `cành = stem`, tên cần giữ nguyên) và quy tắc riêng. Các cài đặt này được lưu trong trình duyệt.

AI được dặn không thêm hay bớt ý: không tự hứa hẹn, không tự xin lỗi, chép đúng số liệu. Thiếu thông tin thì nó để chỗ trống như `[DATE]` và báo cho bạn.

Mỗi lần bấm, nội dung bạn nhập sẽ được gửi tới API của Anthropic. Đừng dán thông tin bạn không được phép chia sẻ với bên thứ ba.

## Chạy trên máy

```bash
cd writing-assistant
npm install
cp .env.example .env.local   # điền ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3001
npm test
```

## Deploy lên Vercel

1. Vercel → *Add New Project* → chọn repo này → **Root Directory: `writing-assistant`**.
2. Đặt *Environment Variables*:
   - `ANTHROPIC_API_KEY`: lấy tại console.anthropic.com (nên đặt giới hạn chi tiêu tháng).
   - `APP_PASSWORD`: **bắt buộc**. Nếu thiếu, app sẽ khoá AI để người lạ không tiêu tiền API của bạn được.
3. Mở app và nhập mật khẩu ở góc trên.

## Kỹ thuật

Next.js 16 · React 19 · TypeScript · Zod · `@anthropic-ai/sdk`. Endpoint duy nhất là `src/app/api/write/route.ts`: kiểm tra mật khẩu, kiểm tra dữ liệu, gọi `claude-opus-5-5` (effort `medium`) và nhận JSON có cấu trúc (`subject`, `english`, `back_translation_vi`, `notes`). Server không lưu dữ liệu gì.
