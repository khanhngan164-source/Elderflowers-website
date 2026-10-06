# Hướng dẫn: nối website với Google Sheets

Làm **một lần**, mất khoảng 10 phút. Sau đó bạn chỉ cần sửa bảng tính là website tự cập nhật, và mọi đơn hàng sẽ tự ghi vào bảng tính kèm email báo cho shop.

**Bảng tính:** *Elderflowers Garden – Nội dung & Đơn hàng* (nằm trong thư mục Drive *Elderflowers Garden – Website*, đã chia sẻ cho elderflowersgarden@gmail.com).

---

## Bước 1: Mở bảng tính bằng đúng tài khoản

1. Đăng nhập Google bằng **elderflowersgarden@gmail.com**.
2. Mở email "đã chia sẻ thư mục với bạn", rồi mở thư mục **Elderflowers Garden – Website**.
3. Mở bảng tính **Elderflowers Garden – Nội dung & Đơn hàng**.

> Vì sao phải dùng tài khoản này: email báo đơn sẽ được gửi **từ** tài khoản cài script.

## Bước 2: Dán code

1. Trên thanh menu của bảng tính, chọn **Tiện ích mở rộng** (Extensions), rồi chọn **Apps Script**. Một tab mới sẽ mở ra.
2. Bạn sẽ thấy file `Code.gs` có sẵn vài dòng `function myFunction() {}`. **Xoá hết** các dòng đó.
3. Mở file `Code.gs` mà Claude đã gửi, chọn tất cả (Ctrl+A), sao chép (Ctrl+C), rồi dán (Ctrl+V) vào chỗ vừa xoá.
4. Bấm biểu tượng **💾 Lưu** (hoặc Ctrl+S).

## Bước 3: Cấp quyền

1. Ở thanh trên cùng, ngay cạnh nút **▶ Chạy** (Run), có một ô chọn hàm. Bạn chọn hàm **kiemTra**.
2. Bấm **▶ Chạy**.
3. Google hỏi quyền: bấm **Xem lại quyền** (Review permissions), rồi chọn tài khoản elderflowersgarden@gmail.com.
4. Google sẽ hiện cảnh báo **"Google chưa xác minh ứng dụng này"**. Đây là điều bình thường, vì script do chính bạn tạo, chưa nộp cho Google kiểm duyệt.
   - Bấm **Nâng cao** (Advanced), rồi bấm **Đi tới … (không an toàn)**.
   - Bấm **Cho phép** (Allow).

   Script cần các quyền sau:
   - Đọc và ghi bảng tính: để lấy nội dung và ghi đơn hàng.
   - Gửi email: để báo đơn mới.
   - Truy cập Drive: để công khai ảnh bạn dán link vào bảng tính.
5. Khung **Nhật ký thực thi** (Execution log) ở dưới sẽ hiện dòng `Sản phẩm: 8, email nhận đơn: elderflowersgarden@gmail.com`. Thấy dòng này là thành công.

## Bước 4: Xuất bản (Deploy)

1. Bấm nút xanh **Triển khai** (Deploy) ở góc trên bên phải, rồi chọn **Tùy chọn triển khai mới** (New deployment).
2. Bấm biểu tượng **⚙ bánh răng** cạnh chữ "Chọn loại" và chọn **Ứng dụng web** (Web app).
3. Điền như sau:
   - **Mô tả**: Website
   - **Thực thi dưới dạng** (Execute as): **Tôi** (Me)
   - **Người có quyền truy cập** (Who has access): **Bất kỳ ai** (Anyone)
4. Bấm **Triển khai**.
5. Google hiện ô **URL ứng dụng web** (Web app URL), là một đường link kết thúc bằng `/exec`. Bấm **Sao chép**.

> "Bất kỳ ai" nghĩa là website (và khách hàng) gửi được đơn tới script. Họ **không** xem được bảng tính, vì script chỉ trả ra nội dung công khai của website. Email và thông tin khách luôn nằm trong bảng tính.

## Bước 5: Gửi link cho Claude

Dán đường link `/exec` vào chat. Claude sẽ nối website với link này. Bạn chỉ cần merge Pull Request như lần trước.

**Kiểm tra nhanh:** dán link đó vào trình duyệt. Nếu thấy một trang chữ bắt đầu bằng `{"ok":true,"settings":…` là đúng.

---

## Dùng hằng ngày

| Muốn… | Làm gì |
|---|---|
| Đổi chữ trên banner | Tab **CaiDat**, dòng `announcement_en` / `announcement_vi`, sửa cột **Giá trị** |
| Đổi tiêu đề hoặc ảnh lớn đầu trang | Tab **CaiDat**, dòng `hero_title`, `hero_image` |
| Đổi giá | Tab **SanPham**, cột **Giá (₫)** |
| Thêm sản phẩm | Tab **SanPham**, thêm một dòng mới. **Mã** viết liền, không dấu, không trùng |
| Tạm ẩn sản phẩm | Cột **Hiển thị**, chọn **Không** |
| Thêm ảnh | Tải ảnh vào thư mục **Elderflowers – Ảnh website**, bấm chuột phải vào ảnh, chọn **Chia sẻ**, chọn **Sao chép đường liên kết**, rồi dán vào cột **Ảnh (link)** |
| Bật chuyển khoản bằng mã QR | Tab **CaiDat**, điền `bank_id` (VD: VCB), `bank_account`, `bank_name` |
| Xem đơn mới | Tab **DonHang**, đồng thời có email báo |

Website cập nhật sau **khoảng 1–2 phút**. Lần tải trang đầu tiên có thể vẫn hiện bản cũ, tải lại lần nữa là thấy bản mới.

**Không** đổi tên tab, **không** đổi tên cột ở dòng tiêu đề màu tím.

## Khi cần sửa code của script

Sau khi dán code mới vào Apps Script, vào **Triển khai**, chọn **Quản lý các lần triển khai** (Manage deployments), bấm ✏️, ở mục **Phiên bản** chọn **Phiên bản mới** (New version), rồi bấm **Triển khai**. Làm theo cách này thì link `/exec` **giữ nguyên**, không phải sửa website.

## Giới hạn cần biết

- Gmail miễn phí gửi được khoảng **100 email/ngày** qua script. Nếu vượt mức, đơn vẫn được ghi vào bảng tính, chỉ không có email báo.
- Ảnh lưu trên Google Drive phù hợp cho shop nhỏ. Khi lượng truy cập lớn, nên chuyển ảnh sang dịch vụ chuyên dụng (Cloudinary, Vercel Blob).
- Bảng tính đang **thuộc sở hữu của tài khoản catfein.vn@gmail.com**. Nếu tài khoản đó bị xoá, bảng tính cũng mất. Nên chuyển quyền sở hữu hoặc tạo bản sao dưới tài khoản của shop.
