# Kế hoạch thực hiện đồ án: Website bán sách

**Cập nhật:** 02/11/2026
**Hạn nộp:** 05/11/2026  
**Repo:** https://github.com/ngtuankiet241-cmd/web-ban-sach  
**Nhóm:** Kiệt, Lượng, Luân, Kha  
**Công nghệ:** HTML, CSS, JavaScript thuần; dữ liệu mẫu mô phỏng trong trình duyệt

## Mục tiêu

Hoàn thiện clickable prototype website bán sách, liên kết đầy đủ và bao phủ các yêu cầu trong phiếu chấm: **5 điểm phần admin + 5 điểm phần khách hàng**. Không thể bảo đảm điểm số do giảng viên chấm, nhưng kế hoạch này lấy mọi tiêu chí trong phiếu làm checklist bắt buộc, không chỉ ưu tiên giao diện.

Hạn nộp chỉ còn vài ngày. Nhóm nên chốt phạm vi/phân công ngay, làm chức năng thiết yếu trước và dành ngày cuối cho kiểm thử trên máy sạch. Không mở rộng sang backend, database hoặc thanh toán thật nếu giảng viên chưa yêu cầu.

## Phạm vi và quyết định kỹ thuật

- Tối đa **4 file HTML**: `index.html`, `admin.html`, `cart.html`, `account.html`. Chi tiết sách, đăng nhập, xác nhận đơn và các mục quản trị dùng modal/tab/section trong bốn trang này, không tạo thêm trang HTML.
- Dùng JavaScript thuần. Tách dữ liệu mẫu và logic thành các file JS trong `js/`; dùng `localStorage` để mô phỏng trạng thái giữa các trang trên cùng trình duyệt.
- Dùng giao diện sáng, dễ đọc dựa trên bộ khung hiện có: xanh lá đậm `#345b45`, nền kem `#f6f5f0`, thẻ trắng; tham khảo Newshop ở cách sắp xếp cửa hàng, không sao chép nhận diện.
- Đây là prototype phía trình duyệt, **không phải xác thực hay lưu trữ an toàn**. Chỉ dùng tài khoản, sách, địa chỉ và đơn hàng giả lập; không thu thập thông tin thật, không lưu mật khẩu thật, không kết nối thanh toán.
- Giữ bốn trang và các đường dẫn tương đối để có thể mở `index.html` trực tiếp bằng Chrome. Kiểm tra kỹ ảnh, font và dữ liệu khi không có Internet.
- Không sao chép logo, hình sách, nội dung, mã nguồn hoặc nguyên bố cục của Newshop. Dùng Newshop.vn để tham khảo ở mức ý tưởng: thanh tìm kiếm dễ thấy, điều hướng danh mục, khu vực sách nổi bật/khuyến mãi, lưới sản phẩm và thông tin sản phẩm rõ ràng. Thiết kế nhận diện riêng cho nhóm.

## Cấu trúc dự kiến

```text
web-ban-sach/
├── index.html
├── admin.html
├── cart.html
├── account.html
├── css/
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
    └── books/
```

Chỉ tạo các module JS cần thiết; không thêm framework/dependency mới trong giai đoạn gấp này. Hiện repo đã có bốn trang HTML, CSS và `js/app.js` ở dạng khung.

## Phân công đã thống nhất

- **Kiệt và Lượng — cùng chịu trách nhiệm `index.html` và `admin.html`:** cùng thống nhất bố cục, luồng chức năng và kiểm tra hai trang. Kiệt tập trung cửa hàng, dữ liệu/CSS dùng chung và module admin danh mục/sách/giá/tồn kho (`js/admin-catalog.js`). Lượng tập trung khung/tab admin và module quản lý khách hàng, phiếu nhập, đơn hàng (`js/admin.js`). Đây là chia đầu mối để làm song song; cả hai cùng review và hỗ trợ hoàn thiện cả hai trang.
- **Kha — chính `cart.html`:** giỏ hàng, địa chỉ nhận, thanh toán mô phỏng và xác nhận đơn.
- **Luân — chính `account.html`:** đăng ký/đăng nhập/đăng xuất khách hàng, hồ sơ và lịch sử đơn.

Kiệt và Lượng cùng sở hữu chức năng của `index.html` và `admin.html`, nhưng không cùng sửa một file đồng thời. Lượng làm đầu mối dựng khung/tab trong `admin.html`; Kiệt làm đầu mối khu vực cửa hàng trong `index.html` và module `js/admin-catalog.js`. Hai bạn thống nhất vùng HTML và selector trước khi nối module, rồi cùng review/test. Nếu cần sửa file của đầu mối kia, trao đổi trước và chỉ một người chỉnh tại một thời điểm. Kha phụ trách `cart.html`, Luân phụ trách `account.html`. Ghi nhận đóng góp theo công việc thực tế, không chỉ theo tên file.

## Quy ước dữ liệu và tích hợp

- Dùng chung một `js/storage.js` và cùng các khóa localStorage có tiền tố `bookstore.`. Không tự đặt khóa riêng theo từng trang.
- Tên khóa và cấu trúc thống nhất: `bookstore.categories` = `{id,name,active,marginPercent}[]`; `bookstore.books` = `{id,categoryId,code,title,author,image,description,costPrice,sellingPrice,stock,active,marginPercent?}[]`; `bookstore.customers` = `{id,name,email,phone,addresses,status}[]`; `bookstore.currentCustomerId` = ID khách hoặc `null`; `bookstore.cart` = `{bookId,quantity}[]`; `bookstore.orders` = `{id,customerId,items,deliveryAddress,paymentMethod,status,orderedAt,total}[]`; `bookstore.receipts` = `{id,receivedAt,status,items}[]`; `bookstore.stockMovements` = `{id,bookId,direction,quantity,occurredAt,referenceId}[]`.
- Dùng chung một `js/storage.js` để parse/ghi các khóa trên và tạo dữ liệu mẫu khi chưa có; không tự đặt khóa hay cấu trúc riêng. Giá bán ưu tiên margin riêng của sách, nếu không có thì dùng margin loại. Order item lưu lại tên/giá tại thời điểm đặt.
- Thống nhất `direction` kho là `in`/`out`; phiếu nhập hoàn tất tạo biến động `in`, đơn mới tạo biến động `out`, đơn hủy tạo biến động hoàn kho. Cảnh báo sắp hết hàng khi tồn không quá 5 cuốn. Admin session chỉ là trạng thái mô phỏng riêng, không dùng chung tài khoản khách.
- Kiệt tạo bộ dữ liệu mẫu theo contract này và gửi nhóm; mọi người không tự đổi tên khóa/trường. Kha và Luân dùng cùng ID tài khoản để liên kết giỏ/đơn; các module admin cập nhật đúng cùng sách/đơn/phiếu.
- Chỉ dùng dữ liệu giả. Đây là prototype phía trình duyệt, không lưu mật khẩu thật và không xử lý thanh toán thật.
- Do hành vi `localStorage` với `file://` có thể khác theo trình duyệt, dùng Live Server/localhost khi cần kiểm tra luồng dữ liệu xuyên trang; đồng thời mở từng HTML bằng đường dẫn local trên Chrome để xác nhận trang/tài nguyên vẫn hiển thị và không lỗi. Nếu giảng viên bắt buộc toàn bộ luồng phải chạy khi mở file trực tiếp, báo nhóm để kiểm tra riêng trên đúng Chrome máy chấm.

## Quy ước GitHub

- Nhánh hiện tại là `main`; giữ `main` làm bản tích hợp, không sửa trực tiếp sau khi bắt đầu làm tính năng.
- Kiệt và Lượng cùng làm trên nhánh `feature/store-admin` cho `index.html`, `admin.html`, `js/admin.js`, `js/admin-catalog.js`; hai người thay phiên commit, không cùng chỉnh một file đồng thời. Kha tạo `feature/cart`, Luân tạo `feature/account`; tất cả nhánh bắt đầu từ `main`.
- Mở Pull Request từ từng nhánh về `main`; Kiệt và Lượng cùng review phần cửa hàng/admin, sau đó Kiệt merge khi luồng liên quan chạy thử. Không force-push, không đưa tài liệu môn học, thông tin cá nhân hay mật khẩu lên repo.
- Kiệt là đầu mối các file dùng chung `css/styles.css`, `js/data.js`, `js/storage.js`; cả nhóm thống nhất trước khi đổi contract. Lượng là đầu mối `admin.html`/`js/admin.js`; Kiệt là đầu mối `index.html`/`js/admin-catalog.js`. Đây là đầu mối để tránh xung đột, không có nghĩa chỉ người đó được góp ý hay làm cùng tính năng. Nếu lỡ sửa chung, báo ngay trước merge để chọn một bản tích hợp.
- Trước khi bắt đầu mỗi buổi, cập nhật nhánh bằng `main`; sau khi merge, mọi người cập nhật lại nhánh của mình. Nếu nhóm chưa quen Pull Request, dùng GitHub Desktop/VS Code Source Control và nhờ Kiệt hỗ trợ, nhưng vẫn giữ nguyên tắc mỗi người làm nhánh riêng.

## Các giai đoạn và checklist thực hiện

### Giai đoạn 1 — Chốt chung và nền tảng (02/11)

**Mục tiêu:** mỗi người biết phần mình chọn; các trang dùng chung một kiểu giao diện và cùng một nguồn dữ liệu.

- [ ] T001 [Plan:1.1] Tạo nhánh chung `feature/store-admin` cho Kiệt và Lượng, cùng các nhánh `feature/cart` và `feature/account` từ `main`; ghi cặp phụ trách, đầu mối từng module và checklist trong GitHub issues.
- [x] T002 [P] [Plan:1.2] Thống nhất tên hiệu sách, màu sắc, kiểu chữ, trường dữ liệu sách và bộ dữ liệu giả lập trong `js/data.js`.
- [x] T003 [P] [Plan:1.2] Hoàn thiện thành phần dùng chung và responsive cơ bản trong `css/styles.css` và `js/app.js`.
- [x] T004 [Plan:1.3] Tạo/chuẩn hóa `js/storage.js` để đọc ghi JSON an toàn cho dữ liệu demo (sách, tài khoản giả lập, giỏ hàng, đơn hàng, loại sách, phiếu nhập), với giá trị khởi tạo khi chưa có dữ liệu.
- [ ] T005 [Plan:1.1] Chốt kịch bản demo xuyên suốt: khách xem/tìm sách → đăng nhập → thêm giỏ → đặt hàng → xem đơn; admin cập nhật một thao tác quản lý.

### Giai đoạn 2 — Hành trình khách hàng (02–03/11)

**Mục tiêu:** bao phủ hiển thị/tìm sách, tài khoản, mua hàng và xem lại đơn.

- [x] T006 [US1] [P] [Plan:2.1] Dựng header, danh mục và bố cục cửa hàng trong `index.html` và `css/styles.css`, tham khảo ý tưởng giao diện Newshop nhưng dùng nhận diện/tài nguyên riêng.
- [x] T007 [US1] [Plan:2.1] Hiển thị sách theo loại, phân trang, trạng thái không có kết quả và chi tiết sách bằng modal/section trong `js/storefront.js`.
- [x] T008 [US1] [Plan:2.2] Thực hiện tìm kiếm tên cơ bản và lọc nâng cao kết hợp tên + loại + khoảng giá; phân trang kết quả trong `js/storefront.js`.
- [x] T009 [US1] [Plan:2.3] Cho phép thêm vào giỏ từ danh sách và chi tiết; nếu chưa đăng nhập thì điều hướng/nhắc đăng nhập, không tạo thêm HTML trong `js/storefront.js` và `js/account.js`.
- [ ] T010 [US2] [P] [Plan:2.4] Tạo giao diện đăng ký/đăng nhập/đăng xuất khách hàng, trạng thái tài khoản đang đăng nhập và form xem/sửa hồ sơ trong `account.html` và `js/account.js`.
- [ ] T011 [US3] [Plan:2.5] Hiển thị giỏ, cập nhật/xóa số lượng và tổng tiền; đồng bộ dữ liệu với `index.html` qua `js/cart.js` và `js/storage.js`.
- [ ] T012 [US3] [Plan:2.6] Làm form địa chỉ giao hàng có lựa chọn địa chỉ đã lưu hoặc nhập mới với các trường phù hợp; mặc định chọn tiền mặt khi nhận hàng, thêm chuyển khoản/thanh toán trực tuyến dạng mô phỏng trong `cart.html` và `js/cart.js`.
- [ ] T013 [US3] [Plan:2.7] Xác nhận đơn, lưu đơn giả lập và hiển thị lại chi tiết đơn sau mua; chặn đặt hàng khi chưa đăng nhập/giỏ trống trong `js/cart.js`.
- [ ] T014 [US2] [Plan:2.8] Hiển thị lịch sử và chi tiết các đơn của tài khoản hiện tại trong `account.html` và `js/account.js`.

### Giai đoạn 3 — Nghiệp vụ quản trị (02–03/11)

**Mục tiêu:** bao phủ đủ các mục admin trong phiếu chấm; dùng tab/section bên trong `admin.html`.

- [ ] T015 [US4] [Plan:3.1] Tạo màn hình đăng nhập admin riêng với khách hàng và danh mục điều hướng quản trị trong `admin.html` và `js/admin.js`.
- [ ] T016 [US4] [Plan:3.2] Hiển thị danh sách khách hàng mẫu; mô phỏng reset mật khẩu và khóa/mở khóa tài khoản với trạng thái nhìn thấy được trong `js/admin.js`.
- [x] T017 [US4] [Plan:3.3] Thực hiện thêm/sửa/xóa/ẩn loại sách; đảm bảo thao tác có xác nhận/thông báo và cập nhật danh sách trong `js/admin-catalog.js`.
- [x] T018 [US4] [Plan:3.4] Thực hiện thêm/sửa/ẩn hoặc xóa sách với loại, mã, tên, hình, mô tả; khi sửa phải điền sẵn đúng dữ liệu hiện có trong `js/admin-catalog.js`.
- [ ] T019 [US4] [Plan:3.5] Hiển thị/tìm phiếu nhập; tạo phiếu có ngày nhập, sách, giá nhập và số lượng; cho sửa khi chưa hoàn tất, khóa sửa sau khi hoàn tất trong `js/admin.js`.
- [x] T020 [US4] [Plan:3.6] Quản lý tỷ lệ lợi nhuận theo loại và cho phép ghi đè theo sách; hiển thị giá vốn, tỷ lệ và giá bán tính toán trong `js/admin-catalog.js`.
- [ ] T021 [US4] [Plan:3.7] Tra cứu đơn theo khoảng ngày và trạng thái; xem chi tiết và cập nhật đúng các trạng thái mới đặt/đã xử lý/đã giao/hủy trong `js/admin.js`.
- [x] T022 [US4] [Plan:3.8] Tra cứu tồn theo loại/thời điểm, cảnh báo sắp hết hàng và hiển thị nhập–xuất–tồn một sách theo khoảng thời gian trong `js/admin-catalog.js`.
- [ ] T023 [US4] [Plan:3.9] Đồng bộ các thao tác quản trị với cùng dữ liệu demo để đơn mới, phiếu nhập, giá và tồn kho phản ánh nhất quán trong `js/admin.js` và `js/storage.js`.

### Giai đoạn 4 — Tích hợp, kiểm thử và bàn giao (04–05/11)

**Mục tiêu:** không có liên kết chết, lỗi dữ liệu hoặc hình/font bị mất khi giảng viên mở file local trên Chrome.

- [ ] T024 [Plan:4.1] Kiểm tra đủ bốn HTML, liên kết tương đối, điều hướng, modal/tab, form validation, tiếng Việt và thông báo lỗi/thành công; sửa lỗi tích hợp trong các file liên quan.
- [ ] T025 [Plan:4.2] Chạy checklist khách hàng: đăng ký/đăng nhập/đăng xuất, hồ sơ, tìm cơ bản/nâng cao + phân trang, xem sách, thêm giỏ có/không đăng nhập, đổi số lượng, hai cách địa chỉ, ba cách thanh toán, xem đơn và lịch sử.
- [ ] T026 [Plan:4.3] Chạy checklist admin: đăng nhập riêng, khách hàng, loại sách, sản phẩm (đặc biệt form sửa có dữ liệu sẵn), phiếu nhập trước/sau hoàn tất, giá, bộ lọc/cập nhật đơn, tồn/thấp hàng/nhập-xuất-tồn.
- [ ] T027 [Plan:4.4] Thử mở `index.html` trực tiếp bằng Chrome khi ngắt mạng; xác nhận mọi ảnh/font/tài nguyên dùng đường dẫn tương đối, không có lỗi console làm hỏng luồng chính.
- [ ] T028 [Plan:4.5] Chốt bản nộp trên `main`, xác nhận repo có đúng tối đa bốn file `.html`, README có hướng dẫn chạy và không có file bài giảng, mật khẩu hay dữ liệu cá nhân.
- [ ] T029 [Plan:4.6] Nếu các tiêu chí 10 điểm đã ổn và còn thời gian, chuẩn bị layout/mockup bằng công cụ đồ họa để xét điểm cộng; không đánh đổi chức năng bắt buộc.
- [ ] T030 [Plan:4.7] Chỉ sau khi bản local hoàn chỉnh, cân nhắc triển khai Internet để xét điểm cộng; kiểm tra lại đường dẫn và trải nghiệm, đồng thời vẫn giữ bản mở local làm phương án chấm chính.

## Thứ tự ưu tiên khi không kịp

1. **Không được bỏ:** đủ 4 trang liên kết, giỏ yêu cầu đăng nhập, tìm kiếm nâng cao có kết hợp tiêu chí và phân trang, đặt hàng và lịch sử, admin riêng.
2. **Tiếp theo:** hoàn thiện từng thao tác CRUD/tra cứu/status đúng rubric cho admin, nhất là phiếu nhập chỉ sửa trước hoàn tất và form sửa sản phẩm có dữ liệu cũ.
3. **Cuối cùng:** hiệu ứng trang trí, ảnh/banner cầu kỳ, deploy Internet. Không làm điểm cộng trước khi checklist 10 điểm chạy ổn.

## Definition of Done

- Mỗi tiêu chí trong bảng Requirement Mapping đã được chạy thử, không chỉ có nút/ảnh minh họa.
- Các nút chính thực hiện thao tác hoặc thông báo rõ ràng; form có kiểm tra dữ liệu hợp lệ.
- Trạng thái khách hàng, giỏ, đơn, nhập kho dùng chung dữ liệu demo và tồn tại khi tải lại trang.
- Không vượt quá 4 file HTML; bốn trang mở được bằng đường dẫn local trên Chrome, không cần server.
- Ảnh, font, tiếng Việt, dữ liệu và liên kết không lỗi khi chấm offline.
- Từng thành viên được ghi nhận đúng khối lượng công việc thực tế; nhóm lưu repo và bản dự phòng trước hạn.

## Requirement Mapping

| REQ ID | Mô tả theo phiếu chấm | Plan Items | Bằng chứng hoàn thành |
|---|---|---|---|
| REQ-001 | Admin có đăng nhập riêng và danh mục quản trị | 3.1 | `admin.html`, `js/admin.js` |
| REQ-002 | Xem danh sách khách hàng | 3.2 | `js/admin.js` |
| REQ-003 | Reset mật khẩu khách hàng (mô phỏng) | 3.2 | `js/admin.js` |
| REQ-004 | Khóa/mở khóa tài khoản | 3.2 | `js/admin.js` |
| REQ-005 | Thêm/sửa/xóa/ẩn loại sản phẩm | 3.3 | `js/admin.js` |
| REQ-006 | Thêm sản phẩm gồm loại, mã, tên, hình, mô tả | 3.4 | `js/admin.js` |
| REQ-007 | Sửa sản phẩm điền sẵn dữ liệu; xóa/ẩn sản phẩm | 3.4 | `js/admin.js` |
| REQ-008 | Hiển thị và tìm danh mục phiếu nhập | 3.5 | `js/admin.js` |
| REQ-009 | Tạo phiếu nhập gồm ngày, giá nhập và số lượng từng sách | 3.5 | `js/admin.js` |
| REQ-010 | Chỉ sửa phiếu nhập trước khi hoàn tất | 3.5 | `js/admin.js` |
| REQ-011 | Thiết lập tỷ lệ lợi nhuận theo loại và theo sản phẩm | 3.6 | `js/admin.js` |
| REQ-012 | Tra cứu giá vốn, lợi nhuận và giá bán | 3.6 | `js/admin.js` |
| REQ-013 | Lọc đơn theo khoảng ngày/trạng thái, xem chi tiết và cập nhật 4 trạng thái | 3.7 | `js/admin.js` |
| REQ-014 | Tra cứu tồn theo loại tại một thời điểm | 3.8 | `js/admin.js` |
| REQ-015 | Cảnh báo sách sắp hết | 3.8 | `js/admin.js` |
| REQ-016 | Tra cứu nhập–xuất–tồn theo sách và khoảng thời gian | 3.8 | `js/admin.js` |
| REQ-017 | Khách đăng ký | 2.4 | `account.html`, `js/account.js` |
| REQ-018 | Khách đăng nhập/đăng xuất, hiển thị tài khoản hiện tại | 2.4 | `account.html`, `js/account.js` |
| REQ-019 | Xem và sửa thông tin cá nhân | 2.4 | `account.html`, `js/account.js` |
| REQ-020 | Xem sách theo loại và có phân trang | 2.1 | `index.html`, `js/storefront.js` |
| REQ-021 | Xem chi tiết phù hợp với sách | 2.1 | `index.html`, `js/storefront.js` |
| REQ-022 | Tìm cơ bản theo tên; kết quả có phân trang | 2.2 | `index.html`, `js/storefront.js` |
| REQ-023 | Tìm nâng cao kết hợp tên, loại và khoảng giá; kết quả có phân trang | 2.2 | `index.html`, `js/storefront.js` |
| REQ-024 | Chỉ khách đăng nhập mới dùng giỏ; thêm từ danh sách/chi tiết | 2.3 | `index.html`, `account.html`, `js/storefront.js`, `js/cart.js` |
| REQ-025 | Thêm/bớt số lượng trong giỏ | 2.5 | `cart.html`, `js/cart.js` |
| REQ-026 | Chọn địa chỉ tài khoản hoặc nhập địa chỉ mới với control phù hợp | 2.6 | `cart.html`, `js/cart.js` |
| REQ-027 | COD/chuyển khoản/trực tuyến; mặc định COD | 2.6 | `cart.html`, `js/cart.js` |
| REQ-028 | Xem lại đơn sau khi kết thúc mua | 2.7 | `cart.html`, `js/cart.js` |
| REQ-029 | Khách xem lại các đơn đã mua | 2.8 | `account.html`, `js/account.js` |

## Applied Guidelines

Không có guideline chuyển đổi framework phù hợp: đây là prototype HTML/CSS/JavaScript thuần, không phải migration. Giữ nguyên công nghệ hiện có, không thêm dependency mới.
