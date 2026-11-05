# Website bán sách

Đồ án môn **Lập trình web và ứng dụng**.

## Chạy thử

Mở `index.html` trực tiếp bằng trình duyệt hoặc dùng extension Live Server trong VS Code.

## Cấu trúc

- `index.html`: cửa hàng
- `admin.html`: khu vực quản trị
- `cart.html`: giỏ hàng và đặt hàng
- `account.html`: tài khoản khách hàng và lịch sử mua
- `css/styles.css`: kiểu dáng dùng chung
- `js/app.js`: JavaScript dùng chung
- `js/data.js`, `js/storage.js`: dữ liệu mẫu và API lưu trữ dùng chung
- `js/storefront.js`: danh mục, tìm kiếm/lọc, phân trang và chi tiết sách
- `js/admin-catalog.js`: quản lý loại sách, sách, giá bán và tồn kho
- `assets/`: hình ảnh và tài nguyên của website

Mở `index.html` hoặc chạy Live Server để thử. Dữ liệu là mô phỏng trong `localStorage` của trình duyệt; không nhập thông tin thật.

## Quản trị

- Mở `admin.html`.
- Tài khoản demo: `admin`
- Mật khẩu demo: `admin123`
- Dữ liệu khách hàng, đơn hàng, phiếu nhập và tồn kho lưu trong `localStorage` của trình duyệt.

## Tài khoản khách hàng

- Mở `account.html` để đăng nhập, tạo tài khoản, cập nhật hồ sơ và xem lịch sử đơn hàng.
- Tài khoản demo: `an@example.com`
- Mật khẩu demo: `123456`
- Đây là prototype phía trình duyệt; mật khẩu demo chỉ phục vụ kiểm thử, không có bảo mật và không được dùng thông tin thật.
