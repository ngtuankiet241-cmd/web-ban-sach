# Website bán sách

Đồ án môn **Lập trình web và ứng dụng**.

## Chạy thử

Mở `index.html` trực tiếp bằng trình duyệt hoặc dùng extension Live Server trong VS Code.

## Các file và cách chúng liên kết

### Các trang HTML

| File | Chức năng | Liên kết chính |
|---|---|---|
| [`index.html`](index.html) | Trang cửa hàng: tìm/lọc, sắp xếp, phân trang, xem chi tiết và chọn sách. | Tải [`css/styles.css`](css/styles.css), [`js/data.js`](js/data.js), [`js/storage.js`](js/storage.js), [`js/app.js`](js/app.js), [`js/storefront.js`](js/storefront.js); điều hướng đến `admin.html`, `cart.html`, `account.html`. |
| [`account.html`](account.html) | Đăng ký/đăng nhập, hồ sơ và lịch sử mua của khách hàng. | Tải CSS và các file JS dùng chung như trang cửa hàng, sau đó chạy [`js/account.js`](js/account.js); liên kết với `index.html`, `admin.html`, `cart.html`. |
| [`cart.html`](cart.html) | Giỏ hàng, địa chỉ giao hàng, chọn thanh toán mô phỏng, xác nhận đơn và xem đơn đã mua. | Tải CSS chung và riêng [`css/cart.css`](css/cart.css), JS dùng chung và [`js/cart.js`](js/cart.js); liên kết với `index.html`, `account.html`, `admin.html`. |
| [`admin.html`](admin.html) | Trang quản trị: đăng nhập quản trị và các chức năng quản lý cửa hàng. | Tải CSS/JS dùng chung, [`js/admin.js`](js/admin.js) và [`js/admin-catalog.js`](js/admin-catalog.js); liên kết với `index.html`, `cart.html`, `account.html`. |

### CSS, JavaScript và tài nguyên

| File | Chức năng | Được dùng bởi / liên kết với |
|---|---|---|
| [`css/styles.css`](css/styles.css) | Giao diện, bố cục và thành phần dùng chung. | Cả bốn trang HTML. |
| [`css/cart.css`](css/cart.css) | Kiểu riêng cho bảng giỏ hàng, các bước đặt hàng và biểu mẫu giao hàng. | `cart.html`, bổ sung cho `css/styles.css`. |
| [`js/data.js`](js/data.js) | Khai báo dữ liệu mẫu ban đầu cho thể loại, sách, khách hàng, đơn hàng, phiếu nhập và biến động kho. | Được nạp trước `js/storage.js` trên cả bốn trang. |
| [`js/storage.js`](js/storage.js) | Tạo API `Bookstore` để khởi tạo, đọc và ghi dữ liệu trong `localStorage`; phát sự kiện khi dữ liệu đổi. | Phụ thuộc dữ liệu mẫu ở `js/data.js`; được dùng bởi các script chức năng của từng trang. |
| [`js/app.js`](js/app.js) | Tiện ích chung nhỏ, hiện cập nhật năm ở chân trang. | Được nạp trên cả bốn trang HTML. |
| [`js/storefront.js`](js/storefront.js) | Điều khiển danh mục cửa hàng, tìm kiếm/lọc, sắp xếp, phân trang và chi tiết sách. | `index.html`; dùng dữ liệu/API từ `js/data.js` và `js/storage.js`, đồng bộ luồng giỏ hàng với `js/cart.js`. |
| [`js/account.js`](js/account.js) | Xử lý tài khoản khách: đăng ký, đăng nhập/đăng xuất, cập nhật hồ sơ và lịch sử đơn. | `account.html`; đọc/ghi dữ liệu qua `js/storage.js`, phối hợp với giỏ hàng và đơn trong `js/cart.js`. |
| [`js/cart.js`](js/cart.js) | Xử lý giỏ hàng, yêu cầu đăng nhập, đặt hàng và lịch sử đơn của khách. | `cart.html`; dùng `js/storage.js`, dữ liệu sách/khách và liên kết với `js/account.js`, `js/admin.js`. |
| [`js/admin.js`](js/admin.js) | Đăng nhập quản trị, điều hướng các mục và quản lý khách hàng, phiếu nhập, đơn hàng/kho. | `admin.html`; dùng dữ liệu chung từ `js/storage.js`, hiển thị khu danh mục do `js/admin-catalog.js` phụ trách. |
| [`js/admin-catalog.js`](js/admin-catalog.js) | Quản lý thể loại, sách, giá và các chức năng danh mục phía quản trị. | `admin.html`; được bật/tắt bởi `js/admin.js`, đọc/ghi dữ liệu qua `js/storage.js`. |
| [`assets/.gitkeep`](assets/.gitkeep) | Giữ thư mục tài nguyên trong Git khi chưa có hình ảnh/tệp tài nguyên. | Thư mục `assets/`; có thể được tham chiếu bởi giao diện hoặc dữ liệu sách khi bổ sung tài nguyên. |

### Tài liệu và luồng chính

| File | Chức năng | Liên kết chính |
|---|---|---|
| [`README.md`](README.md) | Hướng dẫn chạy thử và bản đồ chức năng/liên kết của các file trong dự án. | Tóm tắt cách dùng ứng dụng và dẫn đến các trang, mã nguồn, tài liệu liên quan. |
| [`plan.md`](plan.md) | Kế hoạch, phạm vi, yêu cầu, phân công và checklist thực hiện đồ án. | Là tài liệu nguồn cho hai bảng đối chiếu trong `checkpoints/`. |
| [`checkpoints/spec-to-plan.yaml`](checkpoints/spec-to-plan.yaml) | Đối chiếu yêu cầu đề bài với các mục trong kế hoạch. | Truy vết yêu cầu về `plan.md`. |
| [`checkpoints/plan-to-tasks.yaml`](checkpoints/plan-to-tasks.yaml) | Đối chiếu các mục kế hoạch với các task thực hiện. | Truy vết task về `plan.md`. |

Luồng khách hàng: `index.html` → đăng nhập/đăng ký tại `account.html` → thêm sách và thao tác tại `cart.html` → đơn hàng được lưu để khách xem trong `account.html` và quản trị xem tại `admin.html`. Các trang cùng chia sẻ dữ liệu qua `js/storage.js` và `localStorage` với tiền tố `bookstore.`. Luồng quản trị dùng `js/admin.js` cho đơn hàng/khách/phiếu nhập và `js/admin-catalog.js` cho thể loại/sách; các thay đổi dùng chung dữ liệu với cửa hàng và giỏ hàng.

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
