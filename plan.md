# Kế hoạch thực hiện đồ án: Website bán sách Bookabook

**Cập nhật:** 05/11/2026 (Hoàn thành nghiệm thu toàn bộ tính năng)  
**Hạn nộp:** 05/11/2026  
**Repo:** https://github.com/ngtuankiet241-cmd/web-ban-sach  
**Nhóm thực hiện:** Nhóm 9  
**Công nghệ:** HTML, CSS, JavaScript thuần; dữ liệu mô phỏng trong trình duyệt (`localStorage`)

## Thành viên nhóm và phân công (25% mỗi thành viên)

| STT | MSSV | Họ và tên | Vai trò | Phụ trách chính | Khối lượng |
|:---:|:---:|---|---|---|:---:|
| 1 | **3124410175** | **Nguyễn Tấn Kiệt** | Trưởng nhóm | Kiến trúc hệ thống, Storefront, Quản lý sách/giá/kho (`js/admin-catalog.js`) | 25% |
| 2 | **3124410207** | **Võ Đình Lượng** | Thành viên | Khung quản trị, Quản lý khách hàng, Phiếu nhập, Đơn hàng (`js/admin.js`) | 25% |
| 3 | **3124410204** | **Nguyễn Minh Luân** | Thành viên | Module tài khoản khách hàng, Đăng ký/Đăng nhập, Hồ sơ (`js/account.js`) | 25% |
| 4 | **3125410071** | **Nguyễn Trọng Kha** | Thành viên | Module giỏ hàng, Quy trình giao hàng & Thanh toán (`js/cart.js`) | 25% |

## Mục tiêu

Hoàn thiện clickable prototype website bán sách Bookabook, liên kết đầy đủ và bao phủ 100% các yêu cầu trong phiếu chấm: **5 điểm phần admin + 5 điểm phần khách hàng** và hướng tới **2 điểm cộng**. Kế hoạch này lấy mọi tiêu chí trong phiếu chấm làm checklist bắt buộc.

## Phạm vi và quyết định kỹ thuật

- Đúng **4 file HTML**: `index.html`, `admin.html`, `cart.html`, `account.html`. Chi tiết sách, đăng nhập, xác nhận đơn và các mục quản trị dùng modal/tab/section trong bốn trang này, không tạo thêm trang HTML.
- Dùng JavaScript thuần. Tách dữ liệu mẫu và logic thành các file JS trong `js/`; dùng `localStorage` để mô phỏng trạng thái giữa các trang trên cùng trình duyệt.
- Dùng giao diện sáng, dễ đọc: xanh lá đậm `#345b45`, nền kem `#f6f5f0`, thẻ trắng. Font chữ tiêu đề và bìa sách dùng **Cambria** để tối ưu hiển thị tiếng Việt có dấu chuẩn đẹp.
- Đây là prototype phía trình duyệt. Chỉ dùng tài khoản, sách, địa chỉ và đơn hàng giả lập; không thu thập thông tin thật, không lưu mật khẩu thật, không kết nối thanh toán.
- Giữ bốn trang và các đường dẫn tương đối để có thể mở `index.html` trực tiếp bằng Chrome (`file:///`). Đảm bảo hoạt động hoàn hảo khi không có Internet.
- Nhận diện thương hiệu riêng của nhóm: **Bookabook** (Logo chữ B).

## Cấu trúc thực tế

```text
web-ban-sach/
├── index.html
├── admin.html
├── cart.html
├── account.html
├── css/
│   ├── cart.css
│   └── styles.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── storage.js
│   ├── storefront.js
│   ├── account.js
│   ├── cart.js
│   ├── admin.js
│   └── admin-catalog.js
└── assets/
    └── .gitkeep
```


## Quy ước dữ liệu và tích hợp

- Dùng chung `js/storage.js` với các khóa `localStorage` có tiền tố `bookstore.`.
- Tên khóa và cấu trúc thống nhất:
  - `bookstore.categories`: `{id, name, active, marginPercent}[]`
  - `bookstore.books`: `{id, categoryId, code, title, author, image, description, costPrice, sellingPrice, stock, active, marginPercent?}[]`
  - `bookstore.customers`: `{id, name, email, phone, addresses, status}[]`
  - `bookstore.currentCustomerId`: ID khách hoặc `null`
  - `bookstore.cart`: `{bookId, quantity}[]`
  - `bookstore.orders`: `{id, customerId, items, deliveryAddress, paymentMethod, status, orderedAt, total}[]`
  - `bookstore.receipts`: `{id, receivedAt, status, items}[]`
  - `bookstore.stockMovements`: `{id, bookId, direction, quantity, occurredAt, referenceId}[]`
- Tồn kho tự động trừ khi tạo đơn hàng (`direction: 'out'`), tự động cộng khi hoàn tất phiếu nhập (`direction: 'in'`), tự động hoàn kho khi hủy đơn. Cảnh báo sắp hết hàng khi tồn $\le 5$ cuốn.

## Các giai đoạn và checklist thực hiện

### Giai đoạn 1 — Chốt chung và nền tảng (02/11)

- [x] T001 [Plan:1.1] Phân chia nhánh và module cho từng thành viên, khởi tạo repo GitHub.
- [x] T002 [Plan:1.2] Thống nhất tên thương hiệu Bookabook, màu sắc, kiểu chữ và bộ dữ liệu seed mẫu trong `js/data.js`.
- [x] T003 [Plan:1.2] Hoàn thiện thành phần dùng chung và responsive cơ bản trong `css/styles.css` và `js/app.js`.
- [x] T004 [Plan:1.3] Chuẩn hóa `js/storage.js` để đọc ghi JSON an toàn cho dữ liệu demo, tự khởi tạo khi chưa có dữ liệu.
- [x] T005 [Plan:1.1] Chốt kịch bản demo xuyên suốt theo biểu mẫu chấm điểm đồ án.

### Giai đoạn 2 — Hành trình khách hàng (02–03/11)

- [x] T006 [US1] Dựng header, danh mục và bố cục cửa hàng trong `index.html` và `css/styles.css`.
- [x] T007 [US1] Hiển thị sách theo loại, phân trang, trạng thái không có kết quả và popup chi tiết sách trong `js/storefront.js`.
- [x] T008 [US1] Thực hiện tìm kiếm tên cơ bản và lọc nâng cao kết hợp tên + loại + khoảng giá; phân trang kết quả trong `js/storefront.js`.
- [x] T009 [US1] Bắt buộc đăng nhập trước khi dùng giỏ hàng; thêm giỏ từ danh sách và chi tiết trong `js/storefront.js`.
- [x] T010 [US2] Tạo giao diện đăng ký/đăng nhập/đăng xuất khách hàng, form xem/sửa hồ sơ trong `account.html` và `js/account.js`.
- [x] T011 [US3] Hiển thị giỏ, cập nhật/xóa số lượng và tổng tiền; đồng bộ dữ liệu giỏ hàng qua `js/cart.js` và `js/storage.js`.
- [x] T012 [US3] Form địa chỉ giao hàng (chọn địa chỉ lưu sẵn hoặc nhập mới 6 trường đầy đủ); 3 phương thức thanh toán (mặc định COD) trong `cart.html` và `js/cart.js`.
- [x] T013 [US3] Xác nhận đơn hàng, trừ tồn kho và ghi nhận biến động kho, hiển thị lại chi tiết đơn sau mua trong `js/cart.js`.
- [x] T014 [US2] Hiển thị lịch sử và chi tiết các đơn đã mua của tài khoản hiện tại trong `account.html` và `cart.html`.

### Giai đoạn 3 — Nghiệp vụ quản trị (02–03/11)

- [x] T015 [US4] Màn hình đăng nhập admin riêng biệt (`admin`/`admin123`) và menu sidebar quản trị 7 mục trong `admin.html` và `js/admin.js`.
- [x] T016 [US4] Quản lý khách hàng: hiển thị danh sách, tìm kiếm, reset mật khẩu, khóa/mở khóa tài khoản trong `js/admin.js`.
- [x] T017 [US4] Quản lý loại sách: thêm, sửa, xóa/ẩn loại sách trong `js/admin-catalog.js`.
- [x] T018 [US4] Quản lý sản phẩm (sách): thêm, sửa (điền sẵn dữ liệu cũ), xóa/ẩn sách trong `js/admin-catalog.js`.
- [x] T019 [US4] Quản lý nhập hàng: xem, tìm phiếu nhập; tạo phiếu (ngày, sách, giá, SL); cho sửa khi nháp, khóa sửa sau khi hoàn tất trong `js/admin.js`.
- [x] T020 [US4] Quản lý giá bán: tỷ lệ lợi nhuận theo loại và ghi đè theo sách; hiển thị giá vốn, tỷ lệ và giá bán trong `js/admin-catalog.js`.
- [x] T021 [US4] Quản lý đơn hàng: lọc theo khoảng ngày và 4 trạng thái; xem chi tiết và cập nhật trạng thái trong `js/admin.js`.
- [x] T022 [US4] Quản lý tồn kho: tra cứu tồn theo loại tại thời điểm, cảnh báo sắp hết hàng ($\le 5$), báo cáo nhập–xuất–tồn một sách theo khoảng thời gian trong `js/admin-catalog.js`.
- [x] T023 [US4] Đồng bộ các thao tác quản trị nhất quán trên cùng bộ nhớ `localStorage`.

### Giai đoạn 4 — Tích hợp, kiểm thử và bàn giao (04–05/11)

- [x] T024 [Plan:4.1] Tinh chỉnh font chữ Cambria nịnh mắt cho tiêu đề và bìa sách, khắc phục hoàn toàn lỗi tách dấu tiếng Việt.
- [x] T025 [Plan:4.2] Đồng bộ trạng thái Header (tên tài khoản đăng nhập + số lượng giỏ hàng) trên tất cả các trang qua `js/app.js`.
- [x] T026 [Plan:4.3] Gộp giao diện quản trị thành menu Sidebar thống nhất 7 mục trong `admin.html`.
- [x] T027 [Plan:4.4] Kiểm thử mở trực tiếp bằng đường dẫn file local (`file:///`) trên Google Chrome khi ngắt mạng: hoạt động 100%, không lỗi console.
- [x] T028 [Plan:4.5] Chốt bản nộp trên nhánh `main`, đảm bảo cấu trúc sạch sẽ, đúng 4 file HTML.
- [x] T029 [Plan:4.6] Chuẩn bị mockup giao diện đồ họa (xét điểm cộng 1.00 điểm).
- [x] T030 [Plan:4.7] Kích hoạt GitHub Pages để triển khai trên môi trường Internet thực tế (xét điểm cộng 1.00 điểm).

## Requirement Mapping (Bám sát phiếu chấm thi 10 điểm)

| REQ ID | Tiêu chí trong phiếu chấm | Điểm | Phụ trách chính | File thực hiện | Trạng thái |
|---|---|:---:|---|---|:---:|
| REQ-001 | Admin đăng nhập riêng & danh mục quản trị | 0.50 | Lượng & Kiệt | `admin.html`, `js/admin.js` | Hoàn thành |
| REQ-002 | Xem danh sách khách hàng | 0.25 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-003 | Reset mật khẩu khách hàng | 0.25 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-004 | Khóa / mở khóa tài khoản | 0.25 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-005 | Thêm, sửa, xóa / ẩn loại sản phẩm | 0.50 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-006 | Thêm sản phẩm (loại, mã, tên, hình, mô tả) | 0.25 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-007 | Sửa sản phẩm (điền sẵn dữ liệu); Xóa/ẩn | 0.50 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-008 | Hiển thị & tìm phiếu nhập hàng | 0.25 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-009 | Thêm phiếu nhập (ngày, giá nhập, số lượng) | 0.25 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-010 | Chỉ sửa phiếu nhập trước khi hoàn tất | 0.25 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-011 | Tỷ lệ lợi nhuận theo loại và theo sản phẩm | 0.25 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-012 | Tra cứu giá vốn, % lợi nhuận, giá bán | 0.25 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-013 | Lọc đơn hàng (ngày, trạng thái), xem chi tiết & cập nhật 4 trạng thái | 0.50 | Lượng | `js/admin.js` | Hoàn thành |
| REQ-014 | Tra cứu tồn theo loại tại một thời điểm | 0.25 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-015 | Cảnh báo sản phẩm sắp hết hàng ($\le 5$) | 0.25 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-016 | Báo cáo nhập – xuất – tồn theo thời gian | 0.25 | Kiệt | `js/admin-catalog.js` | Hoàn thành |
| REQ-017 | Khách đăng ký tài khoản | 0.25 | Luân | `account.html`, `js/account.js` | Hoàn thành |
| REQ-018 | Đăng nhập/đăng xuất, hiển thị tài khoản hiện tại | 0.25 | Luân & Kiệt | `account.html`, `js/account.js`, `js/app.js` | Hoàn thành |
| REQ-019 | Xem và sửa thông tin cá nhân | 0.50 | Luân | `account.html`, `js/account.js` | Hoàn thành |
| REQ-020 | Hiển thị sản phẩm theo phân loại (có phân trang) | 0.50 | Kiệt | `index.html`, `js/storefront.js` | Hoàn thành |
| REQ-021 | Hiển thị chi tiết sản phẩm | 0.50 | Kiệt | `index.html`, `js/storefront.js` | Hoàn thành |
| REQ-022 | Tìm cơ bản theo tên (có phân trang) | 0.50 | Kiệt | `index.html`, `js/storefront.js` | Hoàn thành |
| REQ-023 | Tìm nâng cao kết hợp tên + loại + khoảng giá (có phân trang) | 0.50 | Kiệt | `index.html`, `js/storefront.js` | Hoàn thành |
| REQ-024 | Chỉ khách đăng nhập mới dùng giỏ; thêm từ danh sách/chi tiết | 0.50 | Kiệt & Kha | `index.html`, `js/storefront.js`, `js/cart.js` | Hoàn thành |
| REQ-025 | Thêm / bớt số lượng trong giỏ | 0.50 | Kha | `cart.html`, `js/cart.js` | Hoàn thành |
| REQ-026 | Chọn địa chỉ từ tài khoản hoặc nhập mới đủ trường | 0.50 | Kha | `cart.html`, `js/cart.js` | Hoàn thành |
| REQ-027 | 3 hình thức thanh toán (mặc định COD) | 0.25 | Kha | `cart.html`, `js/cart.js` | Hoàn thành |
| REQ-028 | Xem lại đơn đặt hàng khi kết thúc mua | 0.25 | Kha | `cart.html`, `js/cart.js` | Hoàn thành |
| REQ-029 | Khách xem lại đơn hàng đã mua | 0.25 | Luân & Kha | `account.html`, `cart.html` | Hoàn thành |
