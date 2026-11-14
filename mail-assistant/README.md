# Trợ lý trả lời email

Web app giúp viết nhanh email trả lời (ưu tiên tiếng Anh) dựa trên **hồ sơ đối tác**, **tình huống** và **phong cách viết** của bạn. AI (Claude) chỉ viết **bản nháp**: bạn đọc lại, sửa, rồi copy sang hộp thư để gửi. App không bao giờ tự gửi email.

App độc lập với website: có `package.json` riêng và deploy thành một project Vercel riêng.

## Cách dùng

1. **Phong cách**: điền tên, chữ ký, quy tắc viết chung. Chỉ cần làm một lần.
2. **Đối tác**: mỗi người hoặc công ty một hồ sơ.
   - *Email nhận diện*: `jane@acme.com` cho một người, `@acme.com` cho cả công ty. Khi bạn dán email, app tự chọn đúng hồ sơ.
   - *Cách giao tiếp*: họ thích gì, nên tránh gì.
   - *Lịch sử & thoả thuận*: giá đã chốt, điều khoản, sự cố cũ. **AI chỉ dùng số liệu có ở đây hoặc trong ô "Ý chính".**
3. **Tình huống**: các mẫu có sẵn (báo giá, trễ hàng, từ chối, nhắc thanh toán…). Thêm một *email mẫu bạn từng viết hay* là cách nhanh nhất để AI viết giống giọng bạn.
4. **Soạn trả lời**: dán email nhận được, ghi ý chính (tiếng Việt cũng được), rồi bấm *Viết bản nháp*.
   - Ô vàng **Cần kiểm tra** liệt kê những chỗ AI để trống (`[PRICE]`) hoặc những điểm bạn cần xác nhận.
   - Ô *Muốn sửa gì?* dùng để chỉnh nhanh, ví dụ "ngắn hơn" hay "trang trọng hơn".
   - Ô *Ghi nhớ vào hồ sơ* lưu điều vừa thoả thuận để lần sau AI biết.

## ⚠️ Dữ liệu nằm trong trình duyệt

Hồ sơ đối tác chỉ được lưu trong trình duyệt đang dùng (localStorage). Đổi máy, xoá dữ liệu trình duyệt hoặc dùng tab ẩn danh là **mất hết**. Hãy vào tab **Sao lưu** để tải file JSON định kỳ. Muốn dùng trên máy khác thì nhập lại file đó.

Nội dung email và hồ sơ đối tác liên quan sẽ được gửi tới API của Anthropic mỗi lần bạn tạo bản nháp. Đừng dán thông tin bạn không được phép chia sẻ với bên thứ ba.

## Chạy trên máy

```bash
cd mail-assistant
npm install
cp .env.example .env.local   # điền ANTHROPIC_API_KEY (APP_PASSWORD không bắt buộc khi chạy local)
npm run dev                  # http://localhost:3001
npm test
```

## Deploy lên Vercel

1. Vercel → *Add New Project* → chọn repo này → **Root Directory: `mail-assistant`**.
2. Vào *Environment Variables*, đặt:
   - `ANTHROPIC_API_KEY`: lấy tại console.anthropic.com.
   - `APP_PASSWORD`: mật khẩu dài, khó đoán. **Bắt buộc**: nếu thiếu, app sẽ khoá AI. Không có mật khẩu thì ai biết đường link cũng có thể tiêu tiền API của bạn.
3. Mở app, nhập mật khẩu ở góc trên (trình duyệt sẽ nhớ).

## Kỹ thuật

- Next.js 16 · React 19 · TypeScript · Zod · `@anthropic-ai/sdk`.
- `src/app/api/draft/route.ts`: endpoint duy nhất trên server. Endpoint kiểm tra mật khẩu, kiểm tra dữ liệu, gọi Claude (`claude-opus-5-5`, effort `medium`) và nhận về JSON có cấu trúc (`subject`, `body`, `summary_vi`, `needs_check`). Fallback phía server được bật để khi model từ chối nhầm thì API tự chuyển sang model khác.
- `src/lib/prompt.ts`: system prompt cố định (được cache) cộng phần dữ liệu riêng của từng email. Quy tắc số 1 là không bịa số liệu.
- Server không lưu dữ liệu gì. Hồ sơ được gửi kèm theo từng yêu cầu.
