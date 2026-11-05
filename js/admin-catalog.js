(function () {
  "use strict";

  // ==========================================================================
  // KHỞI TẠO MODULE CATALOG ADMIN (LOẠI SÁCH, SÁCH, GIÁ BÁN, TỒN KHO)
  // ==========================================================================
  const root = document.querySelector("#catalog-admin");
  if (!root) {
    return;
  }

  const money = new Intl.NumberFormat("vi-VN");
  let selectedImage = "";            // Lưu URL ảnh hoặc chuỗi Base64 Data URL của ảnh được chọn
  let activeTab = "categories";      // Tab mặc định khi mở: "categories"

  /**
   * Hàm bảo mật chống XSS: escape các ký tự nguy hiểm sang HTML entities.
   */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Hiển thị thông báo phản hồi thao tác (thành công hoặc báo lỗi).
   */
  function showMessage(message, isError) {
    const box = root.querySelector("#catalog-admin-message");
    box.textContent = message;
    box.classList.toggle("form-message--error", Boolean(isError));
    box.hidden = !message;
  }

  /**
   * Bắt lỗi và in ra console cùng banner thông báo lỗi.
   */
  function fail(error) {
    console.error(error);
    showMessage(error.message || "Thao tác chưa thực hiện được.", true);
  }

  /**
   * Đọc dữ liệu từ lớp lưu trữ Bookstore (localStorage).
   */
  function read(name) {
    const value = Bookstore.read(name);
    if (value === undefined) {
      throw new Error("Thiếu dữ liệu '" + name + "'. Hãy tải lại trang hoặc kiểm tra bộ nhớ trình duyệt.");
    }
    return value;
  }

  /**
   * Ghi dữ liệu vào lớp lưu trữ Bookstore (localStorage).
   */
  function write(name, value) {
    Bookstore.write(name, value);
  }

  /**
   * Chuyển đổi an toàn về kiểu số (tránh NaN).
   */
  function numberField(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  /**
   * Định dạng số tiền có thêm ký hiệu ₫.
   */
  function formatMoney(value) {
    return money.format(numberField(value)) + " ₫";
  }

  /**
   * Kiểm tra xem đường dẫn ảnh có hợp lệ (ảnh assets/ nội bộ hoặc Data URI base64/SVG).
   */
  function validImage(image) {
    return /^(assets\/|data:image\/)/i.test(String(image || ""));
  }

  /**
   * [BAREM I.6] Lấy tỷ lệ % lợi nhuận áp dụng cho cuốn sách:
   * - Ưu tiên 1: Tỷ lệ riêng được đặt cho cuốn sách đó (book.marginPercent).
   * - Ưu tiên 2: Nếu sách không có tỷ lệ riêng thì lấy tỷ lệ chung của Loại sách (category.marginPercent).
   */
  function getMargin(book, category) {
    return book.marginPercent == null ? numberField(category.marginPercent) : numberField(book.marginPercent);
  }

  /**
   * [BAREM I.6] Tính giá bán theo công thức chuẩn:
   * Giá bán = Giá vốn * (1 + % lợi nhuận / 100) (làm tròn số nguyên).
   */
  function getSellingPrice(book, category) {
    return Math.round(numberField(book.costPrice) * (1 + getMargin(book, category) / 100));
  }

  // ==========================================================================
  // KHỞI TẠO BỐ CỤC GIAO DIỆN CATALOG (HTML NỘI BỘ CỦA 4 TAB CON)
  // ==========================================================================
  root.innerHTML =
    '<section class="admin-catalog panel" aria-labelledby="catalog-admin-title">' +
    '<div class="section-heading section-heading--compact">' +
    '<div><p class="eyebrow">Quản lý danh mục và tồn kho</p><h2 id="catalog-admin-title">Sách &amp; kho hàng</h2></div>' +
    '<p class="muted">Dữ liệu mô phỏng được chia sẻ với cửa hàng qua bộ nhớ trình duyệt.</p></div>' +
    '<p class="form-message" id="catalog-admin-message" role="status" aria-live="polite" hidden></p>' +
    '<div class="admin-tabs" role="tablist" aria-label="Quản lý sách">' +
    '<button type="button" class="admin-tab is-active" role="tab" aria-selected="true" data-admin-tab="categories">Loại sách</button>' +
    '<button type="button" class="admin-tab" role="tab" aria-selected="false" data-admin-tab="books">Sách</button>' +
    '<button type="button" class="admin-tab" role="tab" aria-selected="false" data-admin-tab="pricing">Giá bán</button>' +
    '<button type="button" class="admin-tab" role="tab" aria-selected="false" data-admin-tab="inventory">Tồn kho</button>' +
    "</div>" +

    // --- TAB 1: LOẠI SÁCH ---
    '<section class="admin-tab-panel" role="tabpanel" data-panel="categories">' +
    '<div class="admin-panel-heading"><h3>Loại sách</h3><p>Thêm, sửa, ẩn hoặc xóa loại không còn được sử dụng.</p></div>' +
    '<form class="admin-form admin-form--inline" id="category-form">' +
    '<input type="hidden" name="id">' +
    '<label>Tên loại sách<input name="name" required maxlength="60" placeholder="Ví dụ: Khoa học"></label>' +
    '<label>Lợi nhuận mặc định (%)<input name="marginPercent" type="number" min="0" max="500" step="0.1" required value="30"></label>' +
    '<div class="admin-form__actions"><button class="button button--primary" type="submit" data-submit-label>Thêm loại sách</button>' +
    '<button class="button button--quiet" type="button" data-reset-form="category-form">Làm mới</button></div>' +
    "</form>" +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Loại sách</th><th>Lợi nhuận</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="category-table"></tbody></table></div>' +
    "</section>" +

    // --- TAB 2: DANH MỤC SÁCH ---
    '<section class="admin-tab-panel" role="tabpanel" data-panel="books" hidden>' +
    '<div class="admin-panel-heading"><h3>Danh mục sách</h3><p>Thông tin gồm loại, mã, tên, hình và mô tả. Khi sửa, biểu mẫu được điền sẵn dữ liệu hiện có.</p></div>' +
    '<form class="admin-form admin-form--grid" id="book-form">' +
    '<input type="hidden" name="id">' +
    '<label>Loại sách<select name="categoryId" required id="book-category"></select></label>' +
    '<label>Mã sách<input name="code" required maxlength="24" placeholder="VD: VH013"></label>' +
    '<label class="admin-form__wide">Tên sách<input name="title" required maxlength="120"></label>' +
    '<label>Tác giả<input name="author" required maxlength="100"></label>' +
    '<label>Nhà xuất bản<input name="publisher" maxlength="100"></label>' +
    '<label>Năm xuất bản<input name="publishedYear" type="number" min="1400" max="2100"></label>' +
    '<label>Số trang<input name="pages" type="number" min="1" max="10000"></label>' +
    '<label>Giá nhập (đồng)<input name="costPrice" type="number" min="0" step="1000" required></label>' +
    '<label>Số lượng tồn<input name="stock" type="number" min="0" step="1" required value="0"></label>' +
    '<label class="admin-form__wide">Mô tả<textarea name="description" rows="3" required maxlength="600"></textarea></label>' +
    '<label class="admin-form__wide">Đường dẫn ảnh (tương đối, ví dụ assets/books/bia.jpg)' +
    '<input name="image" id="book-image-path" placeholder="assets/books/bia-sach.jpg">' +
    "</label>" +
    '<label class="admin-form__wide">Hoặc chọn ảnh từ máy (tối đa 1.5 MB)' +
    '<input name="imageFile" id="book-image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif">' +
    "</label>" +
    '<div class="image-preview admin-form__wide" id="book-image-preview" hidden></div>' +
    '<div class="admin-form__actions admin-form__wide"><button class="button button--primary" type="submit" data-submit-label>Thêm sách</button>' +
    '<button class="button button--quiet" type="button" data-reset-form="book-form">Làm mới</button></div>' +
    "</form>" +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Sách</th><th>Loại</th><th>Giá bán</th><th>Tồn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="book-table"></tbody></table></div>' +
    "</section>" +

    // --- TAB 3: QUẢN LÝ GIÁ BÁN ---
    '<section class="admin-tab-panel" role="tabpanel" data-panel="pricing" hidden>' +
    '<div class="admin-panel-heading"><h3>Quản lý giá bán</h3><p>Giá bán = giá vốn × (1 + tỷ lệ lợi nhuận). Tỷ lệ riêng của sách được ưu tiên hơn tỷ lệ của loại.</p></div>' +
    '<h4>Tỷ lệ theo loại sách</h4>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Loại sách</th><th>Tỷ lệ lợi nhuận (%)</th><th>Thao tác</th></tr></thead><tbody id="category-margin-table"></tbody></table></div>' +
    '<h4>Tỷ lệ và giá theo từng sách</h4>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Sách</th><th>Giá vốn</th><th>Tỷ lệ riêng (%)</th><th>Giá bán hiện tại</th><th>Giá bán dự kiến</th><th>Thao tác</th></tr></thead><tbody id="book-margin-table"></tbody></table></div>' +
    "</section>" +

    // --- TAB 4: TRA CỨU TỒN KHO & BÁO CÁO ---
    '<section class="admin-tab-panel" role="tabpanel" data-panel="inventory" hidden>' +
    '<div class="admin-panel-heading"><h3>Tra cứu tồn kho</h3><p>Số tồn tại thời điểm được tính từ sổ biến động nhập/xuất.</p></div>' +
    '<form class="admin-form admin-form--inline" id="inventory-query">' +
    '<label>Loại sách<select name="categoryId" id="inventory-category"><option value="">Tất cả loại</option></select></label>' +
    '<label>Tồn tại ngày<input name="asOf" type="date" required></label>' +
    '<button class="button button--primary" type="submit">Tra cứu tồn</button></form>' +
    '<h4>Tồn theo loại và cảnh báo sắp hết (≤ 5 cuốn)</h4>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Mã</th><th>Sách</th><th>Loại</th><th>Tồn tại ngày chọn</th><th>Cảnh báo</th></tr></thead><tbody id="inventory-table"></tbody></table></div>' +
    '<h4>Nhập – xuất – tồn theo một sách</h4>' +
    '<form class="admin-form admin-form--inline" id="movement-query">' +
    '<label>Sách<select name="bookId" required id="movement-book"></select></label>' +
    '<label>Từ ngày<input name="from" type="date" required></label>' +
    '<label>Đến ngày<input name="to" type="date" required></label>' +
    '<button class="button button--primary" type="submit">Xem biến động</button></form>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Đầu kỳ</th><th>Nhập</th><th>Xuất</th><th>Cuối kỳ</th><th>Khoảng thời gian</th></tr></thead><tbody id="movement-table"></tbody></table></div>' +
    "</section></section>";

  /**
   * Reset form nhập liệu về trạng thái trống ban đầu để chuẩn bị thêm mới.
   */
  function resetForm(formId) {
    const form = root.querySelector("#" + formId);
    form.reset();
    form.elements.id.value = "";
    if (formId === "category-form") {
      form.elements.marginPercent.value = "30";
      form.querySelector("[data-submit-label]").textContent = "Thêm loại sách";
    } else {
      form.elements.stock.value = "0";
      form.querySelector("[data-submit-label]").textContent = "Thêm sách";
      selectedImage = "";
      renderImagePreview("");
    }
  }

  /**
   * Hiển thị khung xem trước hình ảnh bìa sách khi chọn file hoặc nhập link.
   */
  function renderImagePreview(source) {
    const preview = root.querySelector("#book-image-preview");
    const safeSource = validImage(source) ? escapeHtml(source) : "";
    preview.hidden = !safeSource;
    preview.innerHTML = safeSource
      ? '<img src="' + safeSource + '" alt="Xem trước ảnh sách">'
      : "";
  }

  /**
   * [BAREM I.3] QUẢN LÝ LOẠI SẢN PHẨM (0.5 điểm):
   * 1. Hiển thị danh sách loại sách và % lợi nhuận mặc định.
   * 2. Nút "Sửa": Đưa tên và % lợi nhuận lên form để chỉnh sửa.
   * 3. Nút "Ẩn/Hiện": Ẩn loại sách để không cho hiển thị ngoài cửa hàng.
   * 4. Nút "Xóa": Xóa loại sách (chặn không cho xóa nếu trong loại vẫn còn sách).
   */
  function renderCategories() {
    const categories = read("categories");
    const books = read("books");
    root.querySelector("#category-table").innerHTML = categories.map(function (category) {
      const activeLabel = category.active ? "Đang bán" : "Đã ẩn";
      return "<tr><td>" + escapeHtml(category.name) + "</td><td>" +
        numberField(category.marginPercent) + "%</td><td><span class=\"status-pill\">" +
        activeLabel + "</span></td><td class=\"table-actions\">" +
        '<button class="button button--small button--quiet" type="button" data-action="category-edit" data-id="' + escapeHtml(category.id) + '">Sửa</button>' +
        '<button class="button button--small button--quiet" type="button" data-action="category-toggle" data-id="' + escapeHtml(category.id) + '">' +
        (category.active ? "Ẩn" : "Hiện") + "</button>" +
        '<button class="button button--small button--danger" type="button" data-action="category-delete" data-id="' + escapeHtml(category.id) + '"' +
        (books.some(function (book) { return book.categoryId === category.id; }) ? " disabled title=\"Hãy chuyển hoặc xóa sách trong loại này trước\"" : "") +
        ">Xóa</button></td></tr>";
    }).join("") || '<tr><td colspan="4">Chưa có loại sách.</td></tr>';

    // Đổ danh sách loại sách vào các thẻ <select> ở form thêm sách và bộ lọc tồn kho
    const activeOptions = categories.filter(function (category) {
      return category.active;
    }).map(function (category) {
      return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + "</option>";
    }).join("");
    root.querySelector("#book-category").innerHTML = '<option value="">Chọn loại sách</option>' + activeOptions;
    const inventoryOptions = categories.map(function (category) {
      return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name + (category.active ? "" : " (đã ẩn)")) + "</option>";
    }).join("");
    root.querySelector("#inventory-category").innerHTML = '<option value="">Tất cả loại</option>' + inventoryOptions;
  }

  /**
   * [BAREM I.4] QUẢN LÝ DANH MỤC SẢN PHẨM / SÁCH (0.75 điểm):
   * 1. Hiển thị danh sách sách (hình ảnh, tên, mã, tác giả, loại, giá bán, tồn, trạng thái).
   * 2. BAREM BẮT BUỘC: "Sửa sản phẩm: hiển thị đúng thông tin trước khi sửa".
   *    -> Khi bấm nút "Sửa" (data-action="book-edit"), toàn bộ dữ liệu của sách được tự động gán vào form!
   * 3. Nút "Ẩn/Hiện": Ngưng bán hoặc tiếp tục bán sách ngoài cửa hàng.
   * 4. Nút "Xóa": Xóa sách khỏi danh mục bán.
   */
  function renderBooks() {
    const books = read("books");
    const categories = read("categories");
    root.querySelector("#book-table").innerHTML = books.map(function (book) {
      const category = categories.find(function (item) { return item.id === book.categoryId; });
      return "<tr><td><div class=\"table-book\">" +
        (validImage(book.image) ? '<img src="' + escapeHtml(book.image) + '" alt="">' : "") +
        "<span><strong>" + escapeHtml(book.title) + "</strong><small>" + escapeHtml(book.code) + " · " + escapeHtml(book.author) + "</small></span></div></td>" +
        "<td>" + escapeHtml(category ? category.name : "Không rõ") + "</td>" +
        "<td>" + formatMoney(book.sellingPrice) + "</td><td>" + numberField(book.stock) + "</td>" +
        "<td>" + (book.active ? "Đang bán" : "Đã ẩn") + "</td><td class=\"table-actions\">" +
        '<button class="button button--small button--quiet" type="button" data-action="book-edit" data-id="' + escapeHtml(book.id) + '">Sửa</button>' +
        '<button class="button button--small button--quiet" type="button" data-action="book-toggle" data-id="' + escapeHtml(book.id) + '">' + (book.active ? "Ẩn" : "Hiện") + "</button>" +
        '<button class="button button--small button--danger" type="button" data-action="book-delete" data-id="' + escapeHtml(book.id) + '">Xóa</button>' +
        "</td></tr>";
    }).join("") || '<tr><td colspan="6">Chưa có sách.</td></tr>';
  }

  /**
   * [BAREM I.6] QUẢN LÝ GIÁ BÁN (0.5 điểm):
   * 1. Hiển thị và sửa tỷ lệ % lợi nhuận theo từng Loại sách.
   * 2. Hiển thị và sửa tỷ lệ % lợi nhuận riêng cho từng cuốn Sách.
   * 3. Bảng tra cứu giá vốn, % lợi nhuận, giá bán hiện tại và giá bán dự kiến.
   */
  function renderPricing() {
    const categories = read("categories");
    const books = read("books");

    // Bảng 1: Lợi nhuận theo Loại sách
    root.querySelector("#category-margin-table").innerHTML = categories.map(function (category) {
      return "<tr><td>" + escapeHtml(category.name) + "</td><td>" +
        '<input class="table-input" type="number" min="0" max="500" step="0.1" value="' + numberField(category.marginPercent) +
        '" aria-label="Tỷ lệ lợi nhuận loại ' + escapeHtml(category.name) + '" data-margin-category="' + escapeHtml(category.id) + '">' +
        "</td><td><button class=\"button button--small button--primary\" type=\"button\" data-action=\"save-category-margin\" data-id=\"" +
        escapeHtml(category.id) + '">Lưu</button></td></tr>';
    }).join("");

    // Bảng 2: Lợi nhuận theo từng cuốn Sách cụ thể
    root.querySelector("#book-margin-table").innerHTML = books.map(function (book) {
      const category = categories.find(function (item) { return item.id === book.categoryId; });
      return "<tr><td>" + escapeHtml(book.title) + "</td><td>" + formatMoney(book.costPrice) + "</td><td>" +
        '<input class="table-input" type="number" min="0" max="500" step="0.1" value="' +
        (book.marginPercent == null ? "" : numberField(book.marginPercent)) +
        '" placeholder="' + numberField(category ? category.marginPercent : 0) +
        '" aria-label="Tỷ lệ riêng cho ' + escapeHtml(book.title) + '" data-margin-book="' + escapeHtml(book.id) + '">' +
        "</td><td>" + formatMoney(book.sellingPrice) + "</td><td>" +
        formatMoney(getSellingPrice(book, category || { marginPercent: 0 })) +
        '</td><td><button class="button button--small button--primary\" type=\"button\" data-action=\"save-book-margin\" data-id="' +
        escapeHtml(book.id) + '">Lưu</button></td></tr>';
    }).join("") || '<tr><td colspan="6">Chưa có sách.</td></tr>';
  }

  /**
   * Đổ danh sách sách vào ô chọn sách ở form Báo cáo Nhập-Xuất-Tồn.
   */
  function renderInventoryOptions() {
    const books = read("books");
    const select = root.querySelector("#movement-book");
    const current = select.value;
    select.innerHTML = books.map(function (book) {
      return '<option value="' + escapeHtml(book.id) + '">' + escapeHtml(book.code + " — " + book.title) + "</option>";
    }).join("");
    if (books.some(function (book) { return book.id === current; })) {
      select.value = current;
    }
  }

  /**
   * [BAREM I.8] Tính số lượng tồn kho của một cuốn sách tại MỘT THỜI ĐIỂM (asOfDate):
   * Lọc toàn bộ lịch sử biến động kho (stockMovements) có ngày xảy ra <= thời điểm chọn:
   * Tổng tồn = (Tổng số lượng nhập 'in') - (Tổng số lượng xuất 'out').
   */
  function inventoryAt(bookId, asOfDate) {
    const cutoff = new Date(asOfDate + "T23:59:59.999");
    if (Number.isNaN(cutoff.getTime())) {
      throw new Error("Ngày tra cứu tồn không hợp lệ.");
    }
    return read("stockMovements").filter(function (movement) {
      return movement.bookId === bookId && new Date(movement.occurredAt) <= cutoff;
    }).reduce(function (total, movement) {
      const quantity = numberField(movement.quantity);
      return total + (movement.direction === "in" ? quantity : -quantity);
    }, 0);
  }

  /**
   * [BAREM I.8] QUẢN LÝ TỒN KHO & CẢNH BÁO SẮP HẾT HÀNG:
   * 1. Tra cứu số lượng tồn của sản phẩm theo Loại tại một ngày chọn.
   * 2. BAREM BẮT BUỘC: "Cảnh báo sản phẩm sắp hết hàng" -> Nếu tồn <= 5 cuốn, hiện nhãn đỏ "Sắp hết hàng"!
   */
  function renderInventory(asOf, categoryId) {
    const books = read("books");
    const categories = read("categories");
    const rows = books.filter(function (book) {
      return !categoryId || book.categoryId === categoryId;
    }).map(function (book) {
      const category = categories.find(function (item) { return item.id === book.categoryId; });
      const stock = inventoryAt(book.id, asOf);
      return "<tr><td>" + escapeHtml(book.code) + "</td><td>" + escapeHtml(book.title) +
        "</td><td>" + escapeHtml(category ? category.name : "Không rõ") + "</td><td>" + stock +
        '</td><td>' + (stock <= 5 ? '<span class="stock-alert">Sắp hết hàng</span>' : '<span class="status-pill">Đủ hàng</span>') + "</td></tr>";
    }).join("");
    root.querySelector("#inventory-table").innerHTML = rows || '<tr><td colspan="5">Không có sản phẩm trong loại đã chọn.</td></tr>';
  }

  /**
   * [BAREM I.8] BÁO CÁO NHẬP – XUẤT – TỒN CỦA MỘT SẢN PHẨM TRONG KHOẢNG THỜI GIAN:
   * - Tồn đầu kỳ: Tổng biến động kho trước ngày bắt đầu (fromDate).
   * - Nhập trong kỳ: Tổng biến động 'in' (từ phiếu nhập hoàn tất) từ fromDate đến toDate.
   * - Xuất trong kỳ: Tổng biến động 'out' (từ khách đặt hàng) từ fromDate đến toDate.
   * - Tồn cuối kỳ = Đầu kỳ + Nhập - Xuất.
   */
  function renderMovementReport(bookId, fromDate, toDate) {
    if (fromDate > toDate) {
      throw new Error("Ngày bắt đầu không được sau ngày kết thúc.");
    }
    const cutoff = new Date(toDate + "T23:59:59.999");
    const start = new Date(fromDate + "T00:00:00.000");
    const movements = read("stockMovements").filter(function (movement) {
      const when = new Date(movement.occurredAt);
      return movement.bookId === bookId && when <= cutoff;
    });

    // 1. Tính tồn đầu kỳ
    const opening = movements.filter(function (movement) {
      return new Date(movement.occurredAt) < start;
    }).reduce(function (sum, movement) {
      const quantity = numberField(movement.quantity);
      return sum + (movement.direction === "in" ? quantity : -quantity);
    }, 0);

    // 2. Lấy biến động trong kỳ
    const period = movements.filter(function (movement) {
      const when = new Date(movement.occurredAt);
      return when >= start && when <= cutoff;
    });

    // 3. Tính tổng nhập và xuất trong kỳ
    const inbound = period.filter(function (movement) { return movement.direction === "in"; })
      .reduce(function (sum, movement) { return sum + numberField(movement.quantity); }, 0);
    const outbound = period.filter(function (movement) { return movement.direction === "out"; })
      .reduce(function (sum, movement) { return sum + numberField(movement.quantity); }, 0);

    // 4. Hiển thị lên bảng báo cáo
    root.querySelector("#movement-table").innerHTML =
      "<tr><td>" + opening + "</td><td>" + inbound + "</td><td>" + outbound + "</td><td>" +
      (opening + inbound - outbound) + "</td><td>" + escapeHtml(fromDate) + " – " + escapeHtml(toDate) + "</td></tr>";
  }

  /**
   * Gọi hàm render lại tất cả các phần dữ liệu của catalog để đồng bộ giao diện.
   */
  function renderAll() {
    renderCategories();
    renderBooks();
    renderPricing();
    renderInventoryOptions();
    const asOfInput = root.querySelector('[name="asOf"]');
    const fromInput = root.querySelector('[name="from"]');
    const toInput = root.querySelector('[name="to"]');
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (!asOfInput.value) {
      asOfInput.value = today;
    }
    if (!fromInput.value) {
      fromInput.value = today.slice(0, 8) + "01";
    }
    if (!toInput.value) {
      toInput.value = today;
    }
    renderInventory(asOfInput.value, root.querySelector("#inventory-category").value);
    if (root.querySelector("#movement-book").value) {
      renderMovementReport(root.querySelector("#movement-book").value, fromInput.value, toInput.value);
    }
  }

  // ==========================================================================
  // XỬ LÝ SỰ KIỆN CLICK VÀ THAO TÁC NÚT BẤM (BUTTON ACTIONS)
  // ==========================================================================
  root.addEventListener("click", function (event) {
    // 1. Chuyển tab con bên trong catalog (Loại sách, Sách, Giá bán, Tồn kho)
    const tab = event.target.closest("[data-admin-tab]");
    if (tab) {
      activeTab = tab.dataset.adminTab;
      root.querySelectorAll("[data-admin-tab]").forEach(function (button) {
        const selected = button === tab;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
      });
      root.querySelectorAll("[data-panel]").forEach(function (panel) {
        panel.hidden = panel.dataset.panel !== activeTab;
      });
      showMessage("", false);
      return;
    }

    // 2. Thao tác trên các nút có data-action
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) {
      return;
    }
    const id = button.dataset.id;
    try {
      // Sửa loại sách -> điền sẵn tên & % lợi nhuận lên form
      if (button.dataset.action === "category-edit") {
        const category = read("categories").find(function (item) { return item.id === id; });
        if (!category) { throw new Error("Không tìm thấy loại sách để sửa."); }
        const form = root.querySelector("#category-form");
        form.elements.id.value = category.id;
        form.elements.name.value = category.name;
        form.elements.marginPercent.value = category.marginPercent;
        form.querySelector("[data-submit-label]").textContent = "Lưu loại sách";
        form.elements.name.focus();
      }
      // Ẩn / Hiện loại sách
      else if (button.dataset.action === "category-toggle") {
        write("categories", read("categories").map(function (item) {
          return item.id === id ? Object.assign({}, item, { active: !item.active }) : item;
        }));
        renderAll();
        showMessage("Đã cập nhật trạng thái loại sách.", false);
      }
      // Xóa loại sách (chặn nếu còn sách)
      else if (button.dataset.action === "category-delete") {
        const books = read("books");
        if (books.some(function (book) { return book.categoryId === id; })) {
          throw new Error("Không thể xóa loại đang có sách. Hãy chuyển hoặc xóa sách trước; có thể ẩn loại thay thế.");
        }
        if (!window.confirm("Xóa loại sách này?")) { return; }
        write("categories", read("categories").filter(function (item) { return item.id !== id; }));
        renderAll();
        showMessage("Đã xóa loại sách.", false);
      }
      // [BAREM I.4] Sửa sách -> ĐIỀN ĐÚNG THÔNG TIN HIỆN CÓ VÀO FORM
      else if (button.dataset.action === "book-edit") {
        const book = read("books").find(function (item) { return item.id === id; });
        if (!book) { throw new Error("Không tìm thấy sách để sửa."); }
        const form = root.querySelector("#book-form");
        const category = read("categories").find(function (item) {
          return item.id === book.categoryId;
        });
        if (category && !category.active && !form.elements.categoryId.querySelector('[value="' + CSS.escape(category.id) + '"]')) {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name + " (đã ẩn)";
          form.elements.categoryId.appendChild(option);
        }
        // Điền tất cả giá trị cũ vào form
        Object.keys(book).forEach(function (key) {
          if (form.elements[key]) {
            form.elements[key].value = book[key] == null ? "" : book[key];
          }
        });
        form.elements.image.value = book.image.indexOf("data:image/") === 0 ? "" : book.image;
        selectedImage = book.image;
        form.querySelector("[data-submit-label]").textContent = "Lưu thay đổi";
        renderImagePreview(book.image);
        activeTab = "books";
        root.querySelector('[data-admin-tab="books"]').click();
        form.elements.title.focus();
      }
      // Ẩn / Hiện sách
      else if (button.dataset.action === "book-toggle") {
        write("books", read("books").map(function (item) {
          return item.id === id ? Object.assign({}, item, { active: !item.active }) : item;
        }));
        renderAll();
        showMessage("Đã cập nhật trạng thái sách.", false);
      }
      // Xóa sách khỏi danh mục
      else if (button.dataset.action === "book-delete") {
        if (!window.confirm("Xóa sách này khỏi dữ liệu demo?")) { return; }
        write("books", read("books").filter(function (item) { return item.id !== id; }));
        write("cart", read("cart").filter(function (item) { return item.bookId !== id; }));
        renderAll();
        showMessage("Đã xóa sách khỏi danh mục bán; lịch sử biến động kho được giữ lại.", false);
      }
      // Lưu tỷ lệ lợi nhuận theo Loại sách & tự động tính lại giá bán cho toàn bộ sách trong loại
      else if (button.dataset.action === "save-category-margin") {
        const input = root.querySelector('[data-margin-category="' + CSS.escape(id) + '"]');
        const margin = Number(input.value);
        if (!Number.isFinite(margin) || margin < 0 || margin > 500) {
          throw new Error("Tỷ lệ lợi nhuận phải từ 0 đến 500%.");
        }
        write("categories", read("categories").map(function (item) {
          return item.id === id ? Object.assign({}, item, { marginPercent: margin }) : item;
        }));
        updateAllSellingPrices();
        renderAll();
        showMessage("Đã lưu tỷ lệ loại và tính lại giá bán.", false);
      }
      // Lưu tỷ lệ lợi nhuận riêng cho từng cuốn sách & tính lại giá bán
      else if (button.dataset.action === "save-book-margin") {
        const input = root.querySelector('[data-margin-book="' + CSS.escape(id) + '"]');
        const raw = input.value.trim();
        const margin = raw === "" ? null : Number(raw);
        if (margin !== null && (!Number.isFinite(margin) || margin < 0 || margin > 500)) {
          throw new Error("Tỷ lệ riêng phải để trống hoặc nằm trong khoảng 0–500%.");
        }
        write("books", read("books").map(function (item) {
          return item.id === id ? Object.assign({}, item, { marginPercent: margin }) : item;
        }));
        updateAllSellingPrices();
        renderAll();
        showMessage("Đã lưu tỷ lệ riêng và tính lại giá bán.", false);
      }
    } catch (error) {
      fail(error);
    }
  });

  // Nút bấm làm mới biểu mẫu (reset form)
  root.addEventListener("click", function (event) {
    const reset = event.target.closest("[data-reset-form]");
    if (reset) {
      resetForm(reset.dataset.resetForm);
      showMessage("", false);
    }
  });

  // Sự kiện submit form thêm / sửa Loại sách
  root.querySelector("#category-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.elements.id.value || "cat-" + Date.now();
    const name = form.elements.name.value.trim();
    const marginPercent = Number(form.elements.marginPercent.value);
    try {
      if (!name || !Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > 500) {
        throw new Error("Vui lòng nhập tên loại và tỷ lệ lợi nhuận hợp lệ (0–500%).");
      }
      const categories = read("categories");
      if (categories.some(function (item) { return item.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi") && item.id !== id; })) {
        throw new Error("Tên loại sách đã tồn tại.");
      }
      if (form.elements.id.value) {
        write("categories", categories.map(function (item) {
          return item.id === id ? Object.assign({}, item, { name: name, marginPercent: marginPercent }) : item;
        }));
      } else {
        write("categories", categories.concat([{ id: id, name: name, active: true, marginPercent: marginPercent }]));
      }
      updateAllSellingPrices();
      resetForm("category-form");
      renderAll();
      showMessage("Đã lưu loại sách.", false);
    } catch (error) {
      fail(error);
    }
  });

  // Xử lý khi người dùng nhập đường dẫn ảnh bằng tay
  root.querySelector("#book-image-path").addEventListener("input", function (event) {
    if (event.target.value.trim()) {
      selectedImage = event.target.value.trim();
      renderImagePreview(selectedImage);
    }
  });

  // Xử lý khi người dùng chọn file ảnh từ máy (dùng FileReader chuyển thành Base64)
  root.querySelector("#book-image-file").addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      showMessage("Ảnh phải là PNG, JPEG, WebP hoặc GIF.", true);
      event.target.value = "";
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      showMessage("Ảnh vượt quá 1.5 MB; hãy chọn ảnh nhỏ hơn để tránh đầy bộ nhớ demo.", true);
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      selectedImage = String(reader.result);
      root.querySelector("#book-image-path").value = "";
      renderImagePreview(selectedImage);
      showMessage("Đã chọn ảnh. Ảnh sẽ được lưu cùng dữ liệu demo trên trình duyệt này.", false);
    };
    reader.onerror = function () {
      showMessage("Không đọc được ảnh đã chọn.", true);
    };
    reader.readAsDataURL(file);
  });

  // [BAREM I.4] Sự kiện submit form thêm / sửa Sách
  root.querySelector("#book-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.elements.id.value || "book-" + Date.now();
    const categoryId = form.elements.categoryId.value;
    const code = form.elements.code.value.trim();
    const title = form.elements.title.value.trim();
    const author = form.elements.author.value.trim();
    const costPrice = Number(form.elements.costPrice.value);
    const stock = Number(form.elements.stock.value);
    const image = selectedImage || form.elements.image.value.trim();
    try {
      const categories = read("categories");
      const books = read("books");
      const existing = books.find(function (book) { return book.id === id; });
      const category = categories.find(function (item) { return item.id === categoryId; });
      if (!category || (!category.active && (!existing || existing.categoryId !== categoryId))) {
        throw new Error("Hãy chọn một loại sách đang hoạt động.");
      }
      if (!code || !title || !author || !Number.isFinite(costPrice) || costPrice <= 0 ||
          !Number.isInteger(stock) || stock < 0) {
        throw new Error("Kiểm tra mã, tên, tác giả, giá nhập và số lượng tồn.");
      }
      if (!image || !validImage(image)) {
        throw new Error("Hãy chọn ảnh từ máy hoặc nhập đường dẫn ảnh tương đối trong thư mục assets/.");
      }
      if (books.some(function (book) { return book.code.toLocaleLowerCase("vi") === code.toLocaleLowerCase("vi") && book.id !== id; })) {
        throw new Error("Mã sách đã tồn tại.");
      }
      const book = {
        id: id,
        categoryId: categoryId,
        code: code,
        title: title,
        author: author,
        publisher: form.elements.publisher.value.trim(),
        publishedYear: form.elements.publishedYear.value ? Number(form.elements.publishedYear.value) : null,
        pages: form.elements.pages.value ? Number(form.elements.pages.value) : null,
        description: form.elements.description.value.trim(),
        costPrice: costPrice,
        sellingPrice: 0,
        stock: stock,
        active: existing ? existing.active : true,
        image: image,
        marginPercent: existing ? existing.marginPercent : null
      };
      book.sellingPrice = getSellingPrice(book, category);
      if (existing) {
        const previousStock = numberField(existing.stock);
        if (stock > previousStock) {
          addStockMovement(id, "in", stock - previousStock, "manual-stock-adjustment");
        } else if (stock < previousStock) {
          addStockMovement(id, "out", previousStock - stock, "manual-stock-adjustment");
        }
        write("books", books.map(function (item) { return item.id === id ? book : item; }));
      } else {
        write("books", books.concat([book]));
        if (stock > 0) {
          addStockMovement(id, "in", stock, "initial-stock");
        }
      }
      resetForm("book-form");
      renderAll();
      showMessage(existing ? "Đã cập nhật sách. Biểu mẫu sửa được lưu với thông tin đã điền sẵn." : "Đã thêm sách.", false);
    } catch (error) {
      fail(error);
    }
  });

  /**
   * Thêm một bản ghi vào sổ biến động kho (stockMovements) để ghi vết nhập/xuất.
   */
  function addStockMovement(bookId, direction, quantity, referenceId) {
    const movements = read("stockMovements");
    movements.push({
      id: "move-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      bookId: bookId,
      direction: direction,
      quantity: quantity,
      occurredAt: new Date().toISOString(),
      referenceId: referenceId
    });
    write("stockMovements", movements);
  }

  /**
   * [BAREM I.6] Tính toán lại giá bán cho TOÀN BỘ sách khi tỷ lệ lợi nhuận của Loại sách thay đổi.
   */
  function updateAllSellingPrices() {
    const categories = read("categories");
    write("books", read("books").map(function (book) {
      const category = categories.find(function (item) { return item.id === book.categoryId; });
      return Object.assign({}, book, {
        sellingPrice: getSellingPrice(book, category || { marginPercent: 0 })
      });
    }));
  }

  // Sự kiện tra cứu tồn kho theo ngày
  root.querySelector("#inventory-query").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      renderInventory(form.elements.asOf.value, form.elements.categoryId.value);
      showMessage("Đã tra cứu tồn tại " + form.elements.asOf.value + ".", false);
    } catch (error) {
      fail(error);
    }
  });

  // Sự kiện lọc loại sách trong báo cáo tồn kho
  root.querySelector("#inventory-category").addEventListener("change", function () {
    const date = root.querySelector('[name="asOf"]').value;
    try {
      renderInventory(date, this.value);
    } catch (error) {
      fail(error);
    }
  });

  // Sự kiện tra cứu Báo cáo Nhập - Xuất - Tồn theo một cuốn sách trong khoảng ngày
  root.querySelector("#movement-query").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      renderMovementReport(form.elements.bookId.value, form.elements.from.value, form.elements.to.value);
      showMessage("Đã tổng hợp nhập – xuất – tồn theo khoảng ngày.", false);
    } catch (error) {
      fail(error);
    }
  });

  // Lắng nghe sự kiện thay đổi dữ liệu từ các trang khác để tự cập nhật
  window.addEventListener("storage", function (event) {
    if (event.key && event.key.startsWith("bookstore.")) {
      try {
        renderAll();
      } catch (error) {
        fail(error);
      }
    }
  });
  window.addEventListener("bookstore:changed", function () {
    try {
      renderAll();
    } catch (error) {
      fail(error);
    }
  });

  // Cung cấp API làm mới ra ngoài window
  window.BookstoreCatalogAdmin = {
    refresh: renderAll
  };

  // Khởi động render dữ liệu ban đầu
  try {
    renderAll();
  } catch (error) {
    fail(error);
  }
}());
