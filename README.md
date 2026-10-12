# UTT · Danh sách học ☕

Tiện ích Chrome giúp theo dõi video còn thiếu tiến độ trên [hệ thống E-learning UTT](https://hoctructuyen.utt.edu.vn/), chọn bài cần xem và phát lần lượt qua các môn.

**[⬇ Tải bản 1.2.2](https://github.com/nguyen-hau204/utt-study-queue/raw/refs/heads/main/downloads/utt-study-queue-v1.2.2.zip)** · **[Hướng dẫn cài đặt](docs/CAI-DAT.md)** · **[Báo lỗi](https://github.com/nguyen-hau204/utt-study-queue/issues/new/choose)** · **[Hỗ trợ Zalo](https://zaloapp.com/qr/p/agljm1wpfuq9?src=qr)**

## Tiện ích làm được gì?

- Tìm các môn có trạng thái **Đang học** hoặc **Không đủ điều kiện thi**; loại mục **Hướng dẫn học tập trên hệ thống E-learning**.
- Đọc video cần học của từng môn. Thanh tải chỉ đạt **100% khi đã đọc đủ dữ liệu tất cả môn**.
- Hiển thị số phút trường đã ghi nhận, số phút yêu cầu và số phút còn thiếu. Cho phép chọn cả môn hoặc từng video.
- Phát lần lượt các video đã chọn, rồi chuyển sang môn tiếp theo.
- Bỏ qua ghi hình Vclass khi mục điểm danh của cùng buổi đã hoàn thành; để lại ghi hình chưa đến ngày học.
- Khi khoảng **3 phút phát thực tế** không có tiến độ tăng, lưu bài và vị trí, tải lại trang rồi mở lại đúng video. Tối đa 2 lần thử cho một bài.
- Có tùy chọn xác nhận tiếp tục học và báo khi trang cần bạn xử lý.

Tiện ích phát video ở **1×**. Trạng thái đạt yêu cầu lấy từ trang trường. **100% trên thanh tải là hoàn tất lấy danh sách, không phải hoàn thành môn học.**

## Cài nhanh trên Chrome

1. [Tải file ZIP 1.2.2](https://github.com/nguyen-hau204/utt-study-queue/raw/refs/heads/main/downloads/utt-study-queue-v1.2.2.zip), giải nén vào một thư mục cố định, ví dụ `Documents\UTT-Study-Queue`.
2. Mở thư mục đó và kiểm tra có file `manifest.json` cùng `core.js`, `adapter.js`, `content.js`, `bridge.js`, `background.js`, `icon.png`.
3. Mở Chrome, nhập `chrome://extensions` vào thanh địa chỉ rồi nhấn Enter.
4. Bật **Chế độ dành cho nhà phát triển / Developer mode**.
5. Bấm **Tải tiện ích đã giải nén / Load unpacked**, chọn thư mục **chứa trực tiếp `manifest.json`**.
6. Mở UTT, đăng nhập trên trang trường và tải lại trang. Bấm **📚 Danh sách học** ở góc dưới bên phải; dòng đầu phải hiện **1.2.2**.

👉 Xem [hướng dẫn đầy đủ](docs/CAI-DAT.md) để biết cách cập nhật, chọn video, xử lý lỗi và gỡ tiện ích. Đây là bản cài bằng thư mục giải nén; chưa có bản trên Chrome Web Store.

## Cách sử dụng

1. Mở Trang chủ UTT, danh sách lớp hoặc một môn. Tiện ích tự mở từng môn để đọc tiến độ; trang sẽ chuyển qua các môn trong lúc lấy dữ liệu.
2. Chờ lượt đọc kết thúc. Mở **Video cần học của tất cả môn**, chọn môn và mở danh sách bên dưới để chọn từng video.
3. Bấm **Phát danh sách đã chọn**. Chỉ sử dụng một tab UTT để chạy danh sách; giữ tab học hiển thị, máy thức và mạng ổn định.
4. Bấm **Dừng** trước khi đổi lựa chọn. Nếu Chrome chặn tự phát, bấm Play trên video rồi thử lại.

Nếu một môn lỗi, tiện ích ghi rõ lỗi và giữ dữ liệu các môn đã đọc. Sau lượt quét, bạn vẫn có thể chọn, phát các môn đã đọc hoặc bấm **Đọc lại tất cả môn** để thử lại. Môn đã hết video cần xem không được chọn để phát.

## Báo lỗi và hỗ trợ

**[Tạo báo lỗi trên GitHub](https://github.com/nguyen-hau204/utt-study-queue/issues/new/choose)** là cách thuận tiện để theo dõi việc sửa lỗi. Gửi kèm phiên bản tiện ích, phiên bản Chrome, các bước gây lỗi, điều mong đợi và ảnh thông báo lỗi đã che thông tin cá nhân.

Bạn cũng có thể **[liên hệ qua Zalo](https://zaloapp.com/qr/p/agljm1wpfuq9?src=qr)** hoặc quét mã bên dưới. Không gửi mật khẩu, cookie, mã đăng nhập hay thông tin tài khoản vào báo lỗi.

<a href="https://zaloapp.com/qr/p/agljm1wpfuq9?src=qr"><img src="docs/assets/zalo-support-qr.png" alt="Mã QR Zalo hỗ trợ và báo lỗi" width="260"></a>

## Ủng hộ cà phê ☕

Nếu tiện ích giúp bạn quản lý việc học dễ hơn, bạn có thể mời mình một ly cà phê để tiếp thêm động lực bảo trì và sửa lỗi. **Ủng hộ hoàn toàn tự nguyện; tiện ích và việc báo lỗi vẫn miễn phí.** Cảm ơn bạn đã sử dụng, góp ý và chia sẻ!

Mở ứng dụng thanh toán/ngân hàng để quét mã dưới đây. Kiểm tra tên người nhận trong ứng dụng trước khi xác nhận chuyển tiền.

<img src="docs/assets/coffee-qr.png" alt="Mã QR nhận ủng hộ cà phê do tác giả cung cấp" width="300">

## Phiên bản và kiểm thử

**1.2.2** sửa việc đọc trang lớp và tab tiến độ khi dữ liệu đang tải, quay về trang đầu khi tìm môn, giữ phiên Dừng qua tải trang và phục hồi đúng môn khi trang trở về Home.

- **48 kiểm thử tự động** với dữ liệu mô phỏng cấu trúc UTT đã qua.
- **Kiểm tra trực tiếp trên Chrome ngày 13/10/2026:** bản 1.2.2 hiển thị 100%, đọc đủ 7/7 môn và 27 video cần học; danh sách đang phát video C# và nhận được số phút trường ghi nhận.
- Chưa theo dõi một lượt xem hoàn tất toàn bộ 27 video trên trang thật. Trường có thể đổi giao diện; các lỗi mới được tiếp nhận qua Issues.

Chi tiết ở [TESTING.md](docs/TESTING.md) và [CHANGELOG.md](CHANGELOG.md).

## Dành cho người phát triển

Chrome nạp tiện ích trực tiếp từ thư mục chứa `manifest.json`; không cần chạy công cụ biên dịch để cài.

Để chạy kiểm thử với Node.js 22.13 trở lên:

```sh
npm ci
npm test
```

Để đóng gói 8 file của tiện ích trên Windows:

```powershell
./scripts/package.ps1
```

File ZIP được tạo trong `dist/`. Các mã QR, tài liệu và dữ liệu mô phỏng không được đưa vào ZIP cài đặt.

## Dữ liệu và quyền truy cập

Tiện ích chỉ chạy tại `https://hoctructuyen.utt.edu.vn/`. Tiến độ đọc từ trang, lựa chọn video và tùy chọn được lưu trong bộ nhớ Chrome. Tiện ích không có máy chủ riêng hay chức năng gửi dữ liệu về tác giả. Liên kết GitHub và Zalo trong tài liệu chỉ mở khi bạn chọn.

Tiện ích cần quyền **storage** để lưu lựa chọn và **notifications** để báo khi cần thao tác. Bạn đăng nhập trực tiếp trên UTT; tiện ích không cung cấp biểu mẫu nhập tài khoản.

Đây là tiện ích cộng đồng do **[nguyen-hau204](https://github.com/nguyen-hau204)** duy trì, không phải sản phẩm chính thức của UTT. Điều kiện học tập và thi vẫn theo hệ thống trường.
