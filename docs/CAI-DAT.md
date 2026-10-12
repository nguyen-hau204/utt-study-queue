# Cài đặt và sử dụng UTT · Danh sách học

[← Về trang dự án](../README.md) · [Tải ZIP 1.2.2](https://github.com/nguyen-hau204/utt-study-queue/raw/refs/heads/main/downloads/utt-study-queue-v1.2.2.zip) · [Báo lỗi](https://github.com/nguyen-hau204/utt-study-queue/issues/new/choose)

## 1. Chuẩn bị

- Dùng Chrome trên máy tính. Manifest của tiện ích yêu cầu Chrome 111 trở lên.
- Có tài khoản truy cập [UTT E-learning](https://hoctructuyen.utt.edu.vn/).
- Tạo một thư mục cố định để giữ tiện ích, ví dụ `C:\Users\TenBan\Documents\UTT-Study-Queue`. Chrome tiếp tục đọc file từ thư mục này sau khi cài; đừng xóa hay chuyển nó sang chỗ khác.

Không cần cài Node.js, Python hoặc phần mềm lập trình để sử dụng tiện ích.

## 2. Tải và giải nén

1. Vào [bản phát hành 1.2.2](https://github.com/nguyen-hau204/utt-study-queue/releases/tag/v1.2.2).
2. Bấm liên kết **Tải ZIP 1.2.2** ở đầu trang này hoặc trong ghi chú bản phát hành để tải **`utt-study-queue-v1.2.2.zip`**. Đây là gói tiện ích gọn, dễ cài.
3. Trên Windows, nhấp chuột phải file ZIP → **Extract All / Giải nén tất cả**. Chọn thư mục cố định rồi bấm **Extract / Giải nén**.
4. Mở thư mục đã giải nén. Bạn phải thấy những file sau:

```text
UTT-Study-Queue/
├── manifest.json
├── core.js
├── adapter.js
├── content.js
├── bridge.js
├── background.js
├── icon.png
└── HUONG-DAN.html
```

Nếu tải **Code → Download ZIP** thay vì gói phát hành, giải nén rồi chọn thư mục `utt-study-queue-main` chứa `manifest.json`. Thư mục mã nguồn có thêm tài liệu và kiểm thử; vẫn cài được.

**Lỗi chọn nhầm thư mục:** nếu một thư mục chỉ chứa thêm một thư mục con, hãy mở tiếp thư mục con để tìm `manifest.json`. Chrome cần thư mục chứa trực tiếp file này. File ZIP chưa giải nén không nạp được bằng Load unpacked.

## 3. Nạp tiện ích vào Chrome

1. Mở Chrome, nhập `chrome://extensions` vào thanh địa chỉ và nhấn Enter.
2. Bật công tắc **Developer mode / Chế độ dành cho nhà phát triển** ở góc trên bên phải.
3. Bấm **Load unpacked / Tải tiện ích đã giải nén**.
4. Chọn thư mục có `manifest.json`, rồi bấm **Select Folder / Chọn thư mục**.
5. Kiểm tra thẻ **UTT • Danh sách học** xuất hiện, công tắc đang bật và phiên bản là **1.2.2**.
6. Bấm biểu tượng mảnh ghép trên thanh công cụ Chrome. Có thể ghim tiện ích UTT để dễ mở.

Cách nạp thư mục và cập nhật được Chrome mô tả trong [hướng dẫn chính thức](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

## 4. Mở tiện ích trên UTT

1. Mở `https://hoctructuyen.utt.edu.vn/` bằng đúng hồ sơ Chrome vừa cài tiện ích.
2. Đăng nhập trên trang trường như bình thường.
3. Tải lại trang UTT bằng nút Reload của Chrome. Đây là bước cần thiết nếu trang đã mở từ trước khi cài tiện ích.
4. Bấm nút **📚 Danh sách học** ở góc dưới bên phải, hoặc biểu tượng UTT trên thanh công cụ.
5. Kiểm tra dòng đầu bảng hiện **UTT · TRỢ LÝ VIDEO · 1.2.2**.

Bấm biểu tượng tiện ích sẽ mở bảng ngay trong trang UTT, không mở một cửa sổ popup riêng. Ở trang web khác, bảng UTT không xuất hiện.

## 5. Lấy danh sách và chọn video

Khi lần đầu vào trang học, tiện ích tự tìm môn rồi mở từng môn để đọc **Tiến trình học tập**. Trong thời gian này, trang có thể chuyển qua danh sách lớp và các môn. Chờ lượt đọc hoàn tất trước khi đổi môn bằng tay.

Các môn được lấy là **Đang học** hoặc **Không đủ điều kiện thi**. Mục **Hướng dẫn học tập trên hệ thống E-learning** bị loại. Môn không còn video thiếu tiến độ sẽ không được chọn để phát.

Thanh tải có hai ý nghĩa:

| Hiển thị | Ý nghĩa |
| --- | --- |
| Chưa tới 100%, tên môn đang xử lý | Đang đọc dữ liệu từng môn |
| 100%, đã đọc đủ các môn | Đã lấy đủ danh sách video; chưa có nghĩa đã hoàn thành môn |
| Có môn lỗi | Dữ liệu của môn đó chưa đọc được; số phần trăm không báo đủ |
| Đã dừng lấy danh sách | Bạn đã bấm Dừng; bấm Đọc lại tất cả môn khi muốn tiếp tục |

Sau lượt đọc:

1. Mở **Video cần học của tất cả môn**.
2. Đánh dấu các môn muốn xem. Môn có video cần học được chọn sẵn khi quét thành công.
3. Bấm dòng **… video cần học · … đã chọn** dưới môn để mở các video của môn đó.
4. Đánh dấu hoặc bỏ chọn từng video.
5. Bấm **Phát danh sách đã chọn**. Tiện ích mở môn đầu tiên và phát theo thứ tự.

Trong lúc đang đọc, chuyển trang hoặc phát, ô chọn được khóa để giữ đúng danh sách. **Bấm Dừng trước khi thay đổi lựa chọn.**

## 6. Theo dõi và điều khiển khi phát

| Mục | Cách hiểu |
| --- | --- |
| Đã học | Số phút trường ghi nhận trong lần đọc gần nhất |
| Cần đạt | Số phút tối thiểu do trang trường hiển thị |
| Còn thiếu | Số phút còn thiếu theo dữ liệu trường |
| Extension đếm | Thời gian phát quan sát trên máy, chỉ để tham khảo |
| Bỏ qua · đã điểm danh | Ghi hình Vclass có điểm danh hoàn thành cùng buổi |
| Chưa đến ngày | Ghi hình Vclass được để lại vì buổi học ở tương lai |

- **Phát danh sách đã chọn** chạy qua nhiều môn; **Phát đã chọn** chạy các video đã chọn trong môn đang mở.
- **Đọc tiến độ** cập nhật bảng của môn hiện tại khi danh sách đang dừng.
- **Đọc lại tất cả môn** thực hiện lại lượt quét; video cần học được xác định lại từ trang trường.
- **Dừng** tạm dừng video, hủy việc tự phục hồi đang chờ và giữ trạng thái dừng qua tải lại trang.
- **Xuất tiến độ** tạo file JSON để bạn lưu hoặc tự kiểm tra. File có thể chứa tên môn và lịch học; xem lại trước khi chia sẻ.

Giữ máy thức, mạng ổn định và một tab UTT để chạy. Trang UTT có thể tạm dừng video khi tab bị ẩn hoặc khi bạn đổi cửa sổ. Bấm Play trên trình phát nếu Chrome yêu cầu thao tác để cho phép tự phát.

## 7. Xác nhận học tập, Vclass và tự tải lại

**Xác nhận học tập:** nếu muốn tự xử lý hộp tiếp tục học, bật **Tự xác nhận tiếp tục học khi đang phát danh sách**. Tùy chọn chỉ xử lý hộp tiếp tục học nhận diện được; các hộp khác sẽ dừng để bạn kiểm tra.

**Vclass:** tiện ích chỉ bỏ qua ghi hình khi có mục điểm danh hoàn thành thuộc cùng buổi. Bài giảng thông thường trong tuần vẫn cần xem. Ghi hình chưa đến ngày được để lại, rồi danh sách chuyển sang bài hoặc môn có thể xem. Bài tập, bài thi và việc tham gia buổi học trực tiếp vẫn theo yêu cầu của trường.

**Tự tải lại:** nếu khoảng 3 phút phát thực tế không có tiến độ tăng khi đọc lại, tiện ích lưu bài, lựa chọn và vị trí xem trước khi tải trang. Sau đó mở lại đúng video; tối đa 2 lần cho một bài khi tiến độ vẫn không tăng. Bài lỗi được giữ là chưa đạt và để lại. Bạn có thể tắt **Tải lại và mở lại bài nếu 3 phút phát không có tiến độ tăng** trong cài đặt.

## 8. Cập nhật bản mới, giữ thư mục đã cài

1. Bấm **Dừng** trên UTT.
2. Tải gói ZIP mới và giải nén ra một thư mục tạm.
3. Sao chép 8 file tiện ích mới vào **đúng thư mục đã dùng để cài**, chọn thay thế file cũ.
4. Mở `chrome://extensions`, tìm **UTT • Danh sách học**, bấm biểu tượng **Reload / Tải lại** trên thẻ tiện ích.
5. Tải lại trang UTT.
6. Mở bảng và kiểm tra phiên bản mới ở dòng đầu. Bấm **Đọc lại tất cả môn** để cập nhật danh sách nếu cần.

Không cần cài thêm một bản thứ hai. Giữ nguyên thư mục và thẻ tiện ích thường giữ được dữ liệu đã lưu; số phút chính thức vẫn được lấy từ trường. Nếu chọn cài từ thư mục khác, hãy tránh để hai bản UTT cùng chạy.

## 9. Khắc phục các lỗi thường gặp

| Hiện tượng | Thử xử lý |
| --- | --- |
| Chrome báo không tìm thấy manifest | Giải nén ZIP, chọn lại thư mục chứa trực tiếp `manifest.json` |
| Không thấy nút Danh sách học | Kiểm tra công tắc tiện ích bật, đúng hồ sơ Chrome, đúng trang UTT; tải lại trang |
| Vẫn hiện phiên bản cũ | Kiểm tra đã thay file đúng thư mục, tải lại thẻ tiện ích rồi tải lại UTT |
| Trang quay về Home | Giữ một tab học, kiểm tra đăng nhập và dòng lỗi; bấm Đọc lại tất cả môn khi danh sách dừng |
| Thanh tải dừng hoặc có môn lỗi | Chờ thông báo kết thúc; phát các môn đã đọc nếu có, hoặc đọc lại tất cả môn |
| Ô chọn bị khóa | Bấm Dừng; môn không còn video cần xem không được chọn |
| Không tự phát video | Bấm Play trên video, rồi chạy lại danh sách |
| Video phát nhưng phút không tăng | Kiểm tra thông báo và tùy chọn tự tải lại; chờ lần đọc tiến độ tiếp theo |
| Bài không có video | Tiện ích có giới hạn thử lại và để lại lỗi; báo tên loại bài và thông báo cụ thể |
| Môn vẫn thiếu điều kiện sau khi hết video | Xem điểm danh, buổi học trực tiếp, bài tập và kiểm tra trên trang trường |

Nếu vẫn lỗi, [gửi báo lỗi](https://github.com/nguyen-hau204/utt-study-queue/issues/new/choose) hoặc [liên hệ Zalo](https://zaloapp.com/qr/p/agljm1wpfuq9?src=qr). Gửi phiên bản, bước thực hiện và ảnh thông báo đã che thông tin cá nhân; không gửi tài khoản đăng nhập.

## 10. Gỡ tiện ích

Mở `chrome://extensions`, tìm **UTT • Danh sách học** → **Remove / Xóa** → xác nhận. Sau đó tải lại trang UTT. Gỡ tiện ích xóa dữ liệu cục bộ của tiện ích; số phút học đã ghi nhận trên hệ thống trường vẫn do trường lưu.

## 11. Ủng hộ và liên hệ

Tiện ích và việc báo lỗi miễn phí. Nếu thấy hữu ích, bạn có thể [ủng hộ một ly cà phê](../README.md#ủng-hộ-cà-phê-) hoặc quét mã dưới đây. Cảm ơn bạn đã góp ý để tiện ích ngày càng ổn định!

<img src="assets/coffee-qr.png" alt="QR ủng hộ cà phê" width="260">

[Hỗ trợ Zalo](https://zaloapp.com/qr/p/agljm1wpfuq9?src=qr)

<img src="assets/zalo-support-qr.png" alt="QR Zalo hỗ trợ" width="240">
