# Bookabook - Website bán sách

Đồ án môn học: **Lập trình web và ứng dụng**  
**Nhóm thực hiện:** Nhóm 9  

## Thành viên nhóm

| STT | MSSV | Họ và tên | Vai trò | Nhiệm vụ chính | Đóng góp |
|:---:|:---:|---|---|---|:---:|
| 1 | **3124410175** | **Nguyễn Tấn Kiệt** | Trưởng nhóm | Kiến trúc hệ thống, Storefront, Quản lý sách/giá/kho (`js/admin-catalog.js`) | 25% |
| 2 | **3124410207** | **Võ Đình Lượng** | Thành viên | Khung quản trị, Quản lý khách hàng, Phiếu nhập, Đơn hàng (`js/admin.js`) | 25% |
| 3 | **3124410204** | **Nguyễn Minh Luân** | Thành viên | Module tài khoản khách hàng, Đăng ký/Đăng nhập, Hồ sơ (`js/account.js`) | 25% |
| 4 | **3125410071** | **Nguyễn Trọng Kha** | Thành viên | Module giỏ hàng, Quy trình giao hàng & Thanh toán (`js/cart.js`) | 25% |

---

## Hướng dẫn chạy thử

Trang web được xây dựng hoàn toàn bằng HTML, CSS và JavaScript thuần (sử dụng `localStorage` lưu trữ dữ liệu mô phỏng, không dùng backend ngoài):
- **Chấm bài cục bộ (Offline):** Mở trực tiếp file `index.html` bằng trình duyệt Google Chrome hoặc Firefox qua đường dẫn file tuyệt đối (`file:///`).
- **Phát triển (Local Server):** Chạy thông qua extension Live Server trên VS Code.

---

## Tài khoản demo phục vụ chấm bài

### 1. Khu vực quản trị (Admin)
- Đường dẫn: Mở `admin.html`
- Tài khoản: `admin`
- Mật khẩu: `admin123`
- *Chức năng:* Quản lý khách hàng (khóa/mở khóa, reset mật khẩu), Loại sách, Sách, Phiếu nhập (cộng tồn kho), Quản lý giá bán, Đơn hàng (cập nhật 4 trạng thái), Tồn kho & Cảnh báo sắp hết hàng.

### 2. Khu vực khách hàng (Customer)
- Đường dẫn: Mở `account.html`
- Tài khoản có sẵn: `an@example.com`
- Mật khẩu: `123456`
- *Chức năng:* Đăng ký tài khoản mới, Đăng nhập/đăng xuất, Sửa hồ sơ cá nhân, Xem lịch sử đơn hàng đã mua.

---

## Cấu trúc thư mục

```text
web-ban-sach/
├── index.html        # Trang cửa hàng: hiển thị theo loại, tìm kiếm cơ bản/nâng cao, chi tiết sách
├── admin.html        # Trang quản trị: sidebar 7 chức năng quản trị thống nhất
├── cart.html         # Trang giỏ hàng: cập nhật số lượng, địa chỉ nhận hàng, thanh toán mô phỏng
├── account.html      # Trang tài khoản: đăng ký, đăng nhập, thông tin cá nhân, lịch sử đơn hàng
├── css/
│   ├── styles.css    # Kiểu dáng giao diện chính toàn trang (font Cambria thanh lịch)
│   └── cart.css      # Kiểu dáng riêng cho quy trình giỏ hàng & thanh toán
├── js/
│   ├── app.js            # Tiện ích chung, đồng bộ tên tài khoản & số giỏ hàng trên Header
│   ├── data.js           # Dữ liệu hạt giống (seed data) & tạo bìa sách SVG tự động
│   ├── storage.js        # Lớp tương tác lưu trữ localStorage tập trung
│   ├── storefront.js     # Logic danh mục, tìm kiếm, phân trang và popup chi tiết
│   ├── account.js        # Logic xác thực khách hàng, cập nhật hồ sơ, đơn mua
│   ├── cart.js           # Logic giỏ hàng, chọn/nhập địa chỉ, thanh toán COD/online
│   ├── admin.js          # Khung quản trị, quản lý khách hàng, phiếu nhập, đơn hàng
│   └── admin-catalog.js  # Quản lý loại sách, danh mục sách, giá bán và tồn kho
└── plan.md           # Kế hoạch thực hiện đồ án và ma trận yêu cầu (Requirement Mapping)
```
