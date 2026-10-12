# Kiểm thử bản 1.2.2

## Kết quả tự động

48 kiểm thử đã qua với Node.js, JSDOM và đồng hồ mô phỏng. Tất cả dữ liệu trong `tests/fixture.js` là dữ liệu giả để kiểm thử; không chứa phiên đăng nhập hay hồ sơ học thật.

Các nhóm hành vi được kiểm tra:

- Đọc cột tiến độ, số phút lẻ, trạng thái hoàn thành và bài chưa có ngưỡng rõ ràng.
- Chọn và phát lần lượt, nhận diện hộp xác nhận tiếp tục học, dừng khi có hộp khác.
- Bỏ qua đúng ghi hình có điểm danh cùng buổi; tránh nhầm buổi, ngày hoặc nhóm.
- Để lại Vclass tương lai và tiếp tục sang môn tiếp theo.
- Lưu bài, vị trí và lựa chọn trước khi tải lại; giới hạn 2 lần phục hồi.
- Ngăn hai tab tranh phiên phát; lưu phiên trước khi chuyển trang; chỉ cho chuyển sang đường dẫn học UTT.
- Đọc hết phân trang, quay về trang đầu trước khi tìm môn, chờ tên môn cập nhật xong.
- Chờ khởi tạo nội dung trước khi đổi tab tiến độ; lưu đúng môn trước khi chờ dữ liệu.
- Chỉ báo 100% khi đã đọc đủ mọi môn; giữ các môn đã đọc khi một môn lỗi.
- Giữ trạng thái Dừng qua trang mới; giữ lựa chọn video qua chuyển môn.

Chạy lại từ thư mục dự án:

```sh
npm ci
npm test
```

## Quan sát trực tiếp trên Chrome

Ngày **13/10/2026**, bảng điều khiển bản **1.2.2** trên UTT hiển thị:

- Đã đọc **7/7 môn**, thanh tải **100%**, **27 video cần học**.
- Danh sách đang phát một video môn C# và hiển thị số phút đã được trường ghi nhận.
- Mục hướng dẫn hệ thống không nằm trong danh sách môn.

Đây là quan sát một phiên thực tế. Chưa theo dõi lượt phát hoàn tất toàn bộ 27 video, hoặc chứng minh mọi khóa học và mọi tình huống mạng đều hoạt động. Các tình huống giới hạn phục hồi, Vclass tương lai và chuyển hết toàn bộ danh sách được kiểm tra bằng dữ liệu mô phỏng.

Ảnh phiên học thật được lưu riêng để kiểm chứng, không đưa vào kho công khai nhằm tránh chia sẻ hồ sơ học cá nhân.
