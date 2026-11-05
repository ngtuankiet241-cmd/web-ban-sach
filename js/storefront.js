/**
 * ==============================================================================
 * BOOKABOOK - MÔ-ĐUN CỬA HÀNG TRANG CHỦ (STOREFRONT / CATALOG)
 * ==============================================================================
 * Phụ trách bởi: Nguyễn Tấn Kiệt (MSSV 3124410175 - Trưởng nhóm 9)
 * 
 * BAREM ĐỒ ÁN MÔN LẬP TRÌNH WEB VÀ ỨNG DỤNG:
 * - [BAREM II.1] TRANG CHỦ & DANH MỤC SẢN PHẨM:
 *     + Hiển thị danh mục sách theo dạng lưới (Grid), phân trang (8 cuốn/trang).
 *     + Mỗi thẻ sách hiển thị: Bìa sách, tên sách, tác giả, thể loại, giá bán, số lượng tồn.
 *     + Nút "Xem chi tiết" mở hộp thoại Modal Dialog hiển thị đầy đủ thông tin sách.
 * - [BAREM II.2] TÌM KIẾM & LỌC SẢN PHẨM:
 *     + Tìm kiếm theo tên sách (hỗ trợ tìm kiếm không dấu tiếng Việt).
 *     + Lọc theo thể loại sách (Dropdown thể loại cập nhật động từ dữ liệu).
 *     + Lọc theo khoảng giá (Giá từ ... đến ...).
 *     + Sắp xếp sản phẩm theo: Nổi bật, Giá tăng dần, Giá giảm dần, Tên A-Z.
 * - [BAREM II.3] THÊM VÀO GIỎ HÀNG:
 *     + Nút "Thêm giỏ" nhanh ngay trên thẻ sách và trong popup xem chi tiết.
 *     + Kiểm tra trạng thái đăng nhập: Khách hàng phải đăng nhập mới được thêm giỏ.
 *     + Kiểm tra số lượng tồn kho: Không cho thêm quá số lượng sách có sẵn trong kho.
 *     + Cập nhật badge số lượng giỏ hàng trên thanh Menu Header.
 * ==============================================================================
 */

(function () {
  "use strict";

  // Số lượng sách hiển thị trên 1 trang (phân trang 8 sản phẩm/trang)
  const pageSize = 8;

  // Biến trạng thái (State) quản lý trang hiện tại, dữ liệu sách, bộ lọc, sắp xếp
  const state = {
    page: 1,               // Trang hiện tại (bắt đầu từ trang 1)
    books: [],             // Danh sách tất cả sách lấy từ kho dữ liệu
    categories: [],        // Danh sách thể loại sách
    filters: null,         // Điều kiện lọc người dùng đang chọn (tên, thể loại, khoảng giá)
    sort: "featured"       // Thứ tự sắp xếp (mặc định: nổi bật)
  };

  // Lấy các phần tử DOM trên trang index.html
  const form = document.querySelector("#catalog-search");
  // Nếu không tìm thấy form tìm kiếm (ví dụ đang ở trang admin hoặc cart) thì thoát mô-đun
  if (!form) {
    return;
  }

  const grid = document.querySelector("#book-grid");              // Vùng chứa lưới sách
  const count = document.querySelector("#result-count");          // Vùng hiển thị số lượng kết quả
  const pagination = document.querySelector("#pagination");        // Thanh nút chuyển trang
  const empty = document.querySelector("#empty-state");           // Khối thông báo khi không tìm thấy sách
  const errorBox = document.querySelector("#catalog-error");       // Khối hiển thị thông báo lỗi
  const detailDialog = document.querySelector("#book-dialog");     // Thẻ <dialog> xem chi tiết sách
  const detailContent = document.querySelector("#book-details");   // Nội dung chi tiết sách trong dialog
  const currency = new Intl.NumberFormat("vi-VN");                 // Bộ định dạng tiền tệ Việt Nam (VNĐ)

  /**
   * HÀM TIỆN ÍCH: CHỐNG TẤN CÔNG XSS (ESCAPE HTML)
   * Chuyển đổi các ký tự nguy hiểm <, >, &, ", ' thành mã HTML an toàn
   * giúp ngăn ngừa hacker chèn mã JavaScript độc hại vào trang web.
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
   * HÀM TIỆN ÍCH: CHUẨN HÓA TIẾNG VIỆT (TÌM KIẾM KHÔNG DẤU)
   * Biến "Nhà giả kim" thành "nha gia kim" để khi người dùng gõ không dấu
   * vẫn tìm ra được sách có dấu tiếng Việt.
   */
  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLocaleLowerCase("vi");
  }

  /**
   * HÀM TIỆN ÍCH: ĐỊNH DẠNG TIỀN TỆ (VND)
   * Ví dụ: 80000 -> "80.000 ₫"
   */
  function money(value) {
    return currency.format(Number(value) || 0) + " ₫";
  }

  /**
   * HÀM TIỆN ÍCH: XỬ LÝ NGUỒN ẢNH BÌA SÁCH
   * Chấp nhận đường dẫn file assets hoặc chuỗi Vector SVG Data URI.
   */
  function imageSource(value) {
    const source = String(value || "");
    if (/^(assets\/|data:image\/)/i.test(source)) {
      return escapeHtml(source);
    }
    return "";
  }

  /**
   * HIỂN THỊ THÔNG BÁO LỖI HỆ THỐNG
   */
  function setError(message) {
    errorBox.hidden = !message;
    errorBox.textContent = message || "";
  }

  /**
   * THÔNG BÁO CHO TRÌNH ĐỌC MÀN HÌNH (TRỢ NĂNG ACCESSIBILITY)
   */
  function announce(message) {
    const target = document.querySelector("#search-message");
    target.textContent = message || "";
  }

  /**
   * ĐỌC DỮ LIỆU TỪ LOCALSTORAGE VÀO BIẾN STATE
   */
  function readCatalog() {
    if (!window.Bookstore) {
      throw new Error("Không tải được mô-đun dữ liệu. Hãy tải lại trang.");
    }
    state.books = Bookstore.read(Bookstore.keys.books) || [];
    state.categories = Bookstore.read(Bookstore.keys.categories) || [];
  }

  /**
   * ĐỔ DANH SÁCH THỂ LOẠI VÀO DROPDOWN LỌC (<select id="search-category">)
   * Chỉ hiển thị các thể loại đang hoạt động (active: true).
   */
  function renderCategoryOptions() {
    const select = document.querySelector("#search-category");
    const selected = select.value;
    const options = state.categories.filter(function (category) {
      return category.active;
    }).map(function (category) {
      return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + "</option>";
    }).join("");
    select.innerHTML = '<option value="">Tất cả thể loại</option>' + options;
    select.value = state.categories.some(function (category) {
      return category.id === selected && category.active;
    }) ? selected : "";
  }

  /**
   * [BAREM II.1 & II.2] LẤY DANH SÁCH SÁCH THEO BỘ LỌC VÀ SẮP XẾP
   * 1. Lọc chỉ lấy sách đang kinh doanh (active: true) và thể loại tương ứng còn active.
   * 2. Nếu có bộ lọc tìm kiếm (state.filters):
   *    - Lọc theo từ khóa tên sách (hỗ trợ không dấu).
   *    - Lọc theo thể loại đã chọn.
   *    - Lọc theo giá tối thiểu (minPrice) và giá tối đa (maxPrice).
   * 3. Sắp xếp danh sách kết quả theo yêu cầu (giá tăng dần, giảm dần, hoặc theo bảng chữ cái A-Z).
   */
  function currentBooks() {
    let books = state.books.filter(function (book) {
      return book.active && state.categories.some(function (category) {
        return category.id === book.categoryId && category.active;
      });
    });

    // Áp dụng bộ lọc tìm kiếm nếu người dùng đã nhập
    if (state.filters) {
      const nameQuery = normalize(state.filters.name);
      books = books.filter(function (book) {
        const title = normalize(book.title);
        return (!nameQuery || title.includes(nameQuery)) &&
          (!state.filters.category || book.categoryId === state.filters.category) &&
          (state.filters.minPrice === null || Number(book.sellingPrice) >= state.filters.minPrice) &&
          (state.filters.maxPrice === null || Number(book.sellingPrice) <= state.filters.maxPrice);
      });
    }

    // Xử lý sắp xếp theo lựa chọn
    if (state.sort === "price-asc") {
      books.sort(function (a, b) { return a.sellingPrice - b.sellingPrice; });
    } else if (state.sort === "price-desc") {
      books.sort(function (a, b) { return b.sellingPrice - a.sellingPrice; });
    } else if (state.sort === "title-asc") {
      books.sort(function (a, b) { return a.title.localeCompare(b.title, "vi"); });
    }
    return books;
  }

  /**
   * [BAREM II.1] VẼ DANH SÁCH SÁCH RA MÀN HÌNH TRANG CHỦ (RENDER SẢN PHẨM)
   * - Tính toán phân trang (8 cuốn/trang).
   * - Cắt mảng sách bằng hàm `.slice(start, start + pageSize)`.
   * - Duyệt qua từng cuốn sách để tạo mã HTML của thẻ sách (Book Card).
   * - Hiển thị nhãn tồn kho: "Còn X cuốn" hoặc "Tạm hết hàng".
   */
  function renderBooks() {
    try {
      setError("");
      readCatalog();
      renderCategoryOptions();
      const books = currentBooks();

      // Tính tổng số trang = trần của (tổng số sách / 8)
      const pageCount = Math.max(1, Math.ceil(books.length / pageSize));
      state.page = Math.min(state.page, pageCount);
      const start = (state.page - 1) * pageSize;
      // Cắt lấy 8 cuốn sách của trang hiện tại
      const visibleBooks = books.slice(start, start + pageSize);

      // Cập nhật số lượng kết quả (Ví dụ: "Hiển thị 1–8 trong 14 cuốn sách")
      count.textContent = books.length
        ? "Hiển thị " + (start + 1) + "–" + Math.min(start + pageSize, books.length) + " trong " + books.length + " cuốn sách"
        : "0 cuốn sách";
      empty.hidden = books.length > 0;
      grid.hidden = books.length === 0;

      // Sinh mã HTML cho từng thẻ sách
      grid.innerHTML = visibleBooks.map(function (book) {
        const category = state.categories.find(function (item) {
          return item.id === book.categoryId;
        });
        const image = imageSource(book.image);
        // Nhãn trạng thái tồn kho
        const stockLabel = Number(book.stock) > 0
          ? '<span class="stock-label">Còn ' + Number(book.stock) + " cuốn</span>"
          : '<span class="stock-label stock-label--out">Tạm hết hàng</span>';

        return '<article class="book-card">' +
          // Bìa sách - Click vào xem chi tiết
          '<button class="book-card__cover" type="button" data-book-detail="' + escapeHtml(book.id) + '" aria-label="Xem chi tiết ' + escapeHtml(book.title) + '">' +
          (image ? '<img src="' + image + '" alt="Bìa sách ' + escapeHtml(book.title) + '" loading="lazy">' : '<span class="book-cover-fallback" aria-hidden="true">M</span>') +
          "</button>" +
          '<div class="book-card__body">' +
          // Tên thể loại
          '<p class="book-card__category">' + escapeHtml(category ? category.name : "Sách") + "</p>" +
          // Tiêu đề sách - Click vào xem chi tiết
          '<h3><button class="text-button" type="button" data-book-detail="' + escapeHtml(book.id) + '">' + escapeHtml(book.title) + "</button></h3>" +
          // Tên tác giả
          '<p class="book-card__author">' + escapeHtml(book.author) + "</p>" +
          // Giá bán
          '<p class="book-card__price">' + money(book.sellingPrice) + "</p>" +
          // Chân thẻ sách: Tồn kho & Nút Thêm vào giỏ
          '<div class="book-card__footer">' + stockLabel +
          '<button class="button button--small button--primary" type="button" data-add-book="' + escapeHtml(book.id) + '"' +
          (Number(book.stock) < 1 ? " disabled" : "") + ">Thêm giỏ</button></div>" +
          "</div></article>";
      }).join("");

      // Vẽ thanh phân trang và cập nhật số giỏ hàng
      renderPagination(pageCount);
      renderCartCount();
    } catch (error) {
      grid.innerHTML = "";
      setError(error.message);
    }
  }

  /**
   * [BAREM II.1] VẼ CÁC NÚT PHÂN TRANG (PAGINATION)
   * Tạo các nút: ‹ (Trang trước), 1, 2, 3..., › (Trang sau)
   */
  function renderPagination(pageCount) {
    if (pageCount <= 1) {
      pagination.innerHTML = "";
      return;
    }
    // Nút Trang trước (‹)
    let html = '<button class="pagination__button" type="button" data-page="' + (state.page - 1) +
      '" aria-label="Trang trước"' + (state.page === 1 ? " disabled" : "") + ">‹</button>";
    // Các nút số trang
    for (let page = 1; page <= pageCount; page += 1) {
      html += '<button class="pagination__button' + (page === state.page ? " is-current" : "") +
        '" type="button" data-page="' + page + '" aria-label="Trang ' + page + '"' +
        (page === state.page ? ' aria-current="page"' : "") + ">" + page + "</button>";
    }
    // Nút Trang sau (›)
    html += '<button class="pagination__button" type="button" data-page="' + (state.page + 1) +
      '" aria-label="Trang sau"' + (state.page === pageCount ? " disabled" : "") + ">›</button>";
    pagination.innerHTML = html;
  }

  /**
   * CẬP NHẬT BADGE ĐẾM SỐ LƯỢNG SẢN PHẨM TRÊN HEADER GIỎ HÀNG
   */
  function renderCartCount() {
    try {
      const cart = Bookstore.read(Bookstore.keys.cart) || [];
      const total = cart.reduce(function (sum, line) {
        return sum + Math.max(0, Number(line.quantity) || 0);
      }, 0);
      document.querySelectorAll("[data-cart-count]").forEach(function (element) {
        element.textContent = total;
      });
    } catch (error) {
      setError(error.message);
    }
  }

  /**
   * [BAREM II.1 & II.2] MỞ HỘP THOẠI MODAL XEM CHI TIẾT SÁCH (BOOK DETAILS)
   * Dùng thẻ chuẩn HTML5 <dialog id="book-dialog"> và hàm showModal()
   * Hiển thị đầy đủ: Bìa, Tên sách, Tác giả, Giá bán, Mô tả, Mã sách, NXB, Năm XB, Số trang, Tồn kho.
   */
  function openDetails(bookId) {
    const book = state.books.find(function (item) {
      return item.id === bookId && item.active;
    });
    if (!book) {
      announce("Sách này không còn được bán.");
      return;
    }
    const category = state.categories.find(function (item) {
      return item.id === book.categoryId;
    });
    const image = imageSource(book.image);

    detailContent.innerHTML =
      '<div class="book-detail">' +
      '<div class="book-detail__image">' + (image
        ? '<img src="' + image + '" alt="Bìa sách ' + escapeHtml(book.title) + '">'
        : '<span class="book-cover-fallback" aria-hidden="true">M</span>') + "</div>" +
      '<div class="book-detail__content">' +
      '<p class="eyebrow">' + escapeHtml(category ? category.name : "Sách") + "</p>" +
      '<h2 id="dialog-title">' + escapeHtml(book.title) + "</h2>" +
      '<p class="book-card__author">Tác giả: ' + escapeHtml(book.author) + "</p>" +
      '<p class="book-card__price">' + money(book.sellingPrice) + "</p>" +
      '<p>' + escapeHtml(book.description) + "</p>" +
      '<dl class="book-specs">' +
      "<div><dt>Mã sách</dt><dd>" + escapeHtml(book.code) + "</dd></div>" +
      "<div><dt>Nhà xuất bản</dt><dd>" + escapeHtml(book.publisher || "Đang cập nhật") + "</dd></div>" +
      "<div><dt>Năm xuất bản</dt><dd>" + escapeHtml(book.publishedYear || "Đang cập nhật") + "</dd></div>" +
      "<div><dt>Số trang</dt><dd>" + escapeHtml(book.pages || "Đang cập nhật") + "</dd></div>" +
      "<div><dt>Tình trạng</dt><dd>" + (Number(book.stock) > 0 ? "Còn " + Number(book.stock) + " cuốn" : "Tạm hết hàng") + "</dd></div>" +
      "</dl>" +
      '<button class="button button--primary" type="button" data-add-book="' + escapeHtml(book.id) + '"' +
      (Number(book.stock) < 1 ? " disabled" : "") + ">Thêm vào giỏ</button>" +
      '<p class="form-message" data-book-message role="status" aria-live="polite"></p>' +
      "</div></div>";

    detailDialog.showModal();
  }

  /**
   * [BAREM II.3] XỬ LÝ THÊM SÁCH VÀO GIỎ HÀNG
   * 1. Kiểm tra sách có tồn tại và tồn kho > 0 không.
   * 2. Bắt buộc đăng nhập: Kiểm tra có tài khoản khách hàng nào đang đăng nhập không.
   *    Nếu chưa đăng nhập -> Nhắc nhở người dùng phải đăng nhập trước.
   * 3. Kiểm tra số lượng tồn kho:
   *    Nếu số lượng trong giỏ + 1 > tồn kho thực tế -> Báo lỗi "Đã bằng số lượng trong kho".
   * 4. Ghi dữ liệu giỏ hàng mới vào LocalStorage và phát sự kiện cập nhật giao diện.
   */
  function addToCart(bookId) {
    const book = state.books.find(function (item) {
      return item.id === bookId && item.active;
    });
    if (!book || Number(book.stock) < 1) {
      announce("Sách hiện không có sẵn để thêm vào giỏ.");
      return;
    }

    try {
      // Kiểm tra đăng nhập khách hàng
      const customerId = Bookstore.read(Bookstore.keys.currentCustomerId);
      const customers = Bookstore.read(Bookstore.keys.customers) || [];
      const customer = customers.find(function (item) {
        return item.id === customerId && item.status !== "locked";
      });
      if (!customer) {
        const message = "Vui lòng đăng nhập tài khoản khách hàng trước khi sử dụng giỏ hàng.";
        const detailMessage = detailContent.querySelector("[data-book-message]");
        if (detailDialog.open && detailMessage) {
          detailMessage.textContent = message;
        } else {
          announce(message);
        }
        return;
      }

      // Xử lý thêm vào mảng giỏ hàng
      const cart = Bookstore.read(Bookstore.keys.cart) || [];
      const line = cart.find(function (item) { return item.bookId === bookId; });
      if (line) {
        // Kiểm tra không cho thêm quá tồn kho
        if (Number(line.quantity) >= Number(book.stock)) {
          announce("Số lượng trong giỏ đã bằng số lượng sách còn trong kho.");
          return;
        }
        line.quantity = Number(line.quantity) + 1;
      } else {
        cart.push({ bookId: bookId, quantity: 1 });
      }

      // Lưu lại vào LocalStorage
      Bookstore.write(Bookstore.keys.cart, cart);
      announce("Đã thêm “" + book.title + "” vào giỏ hàng.");
      const detailMessage = detailContent.querySelector("[data-book-message]");
      if (detailDialog.open && detailMessage) {
        detailMessage.textContent = "Đã thêm vào giỏ hàng.";
      }
      renderCartCount();
      window.dispatchEvent(new CustomEvent("bookstore:changed", { detail: { key: "cart" } }));
    } catch (error) {
      setError(error.message);
    }
  }

  // ==============================================================================
  // GẮN CÁC SỰ KIỆN TƯƠNG TÁC (EVENT LISTENERS)
  // ==============================================================================

  /**
   * [BAREM II.2] SỰ KIỆN SUBMIT FORM TÌM KIẾM VÀ LỌC NÂNG CAO
   */
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Chặn tải lại trang của form mặc định
    const values = new FormData(form);
    const rawMin = String(values.get("minPrice") || "").trim();
    const rawMax = String(values.get("maxPrice") || "").trim();
    const minPrice = rawMin === "" ? null : Number(rawMin);
    const maxPrice = rawMax === "" ? null : Number(rawMax);

    // Kiểm tra tính hợp lệ của khoảng giá
    if ((minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0))) {
      announce("Khoảng giá phải là số không âm.");
      return;
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      announce("Giá tối thiểu không được lớn hơn giá tối đa.");
      return;
    }

    // Lưu các tiêu chí lọc vào state và quay về trang 1
    state.filters = {
      name: String(values.get("name") || "").trim(),
      category: String(values.get("category") || ""),
      minPrice: minPrice,
      maxPrice: maxPrice
    };
    state.page = 1;
    announce("");
    renderBooks();
  });

  /**
   * SỰ KIỆN NÚT XÓA BỘ LỌC (ĐẶT LẠI TÌM KIẾM VỀ MẶC ĐỊNH)
   */
  document.querySelector("#clear-search").addEventListener("click", function () {
    form.reset();
    state.filters = null;
    state.page = 1;
    state.sort = "featured";
    document.querySelector("#sort-books").value = "featured";
    announce("");
    renderBooks();
  });

  /**
   * SỰ KIỆN THAY ĐỔI DROPDOWN SẮP XẾP SẢN PHẨM (SORT)
   */
  document.querySelector("#sort-books").addEventListener("change", function (event) {
    state.sort = event.target.value;
    state.page = 1;
    renderBooks();
  });

  /**
   * SỰ KIỆN CLICK CHUYỂN TRANG PHÂN TRANG (PAGINATION)
   * Sử dụng kỹ thuật Event Delegation (bắt sự kiện ở phần tử cha #pagination)
   */
  pagination.addEventListener("click", function (event) {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) {
      return;
    }
    state.page = Number(button.dataset.page);
    renderBooks();
    // Cuộn mượt lên đầu danh sách sản phẩm để người dùng tiện xem
    document.querySelector("#book-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /**
   * SỰ KIỆN CLICK TRÊN LƯỚI SÁCH (XEM CHI TIẾT HOẶC THÊM GIỎ HÀNG)
   * Dùng Event Delegation bắt sự kiện click cho các nút động
   */
  grid.addEventListener("click", function (event) {
    const detailButton = event.target.closest("[data-book-detail]");
    const addButton = event.target.closest("[data-add-book]");
    if (detailButton) {
      openDetails(detailButton.dataset.bookDetail);
    } else if (addButton) {
      addToCart(addButton.dataset.addBook);
    }
  });

  /**
   * SỰ KIỆN CLICK NÚT THÊM VÀO GIỎ TRONG POPUP CHI TIẾT SÁCH
   */
  detailContent.addEventListener("click", function (event) {
    const button = event.target.closest("[data-add-book]");
    if (button) {
      addToCart(button.dataset.addBook);
    }
  });

  /**
   * TỰ ĐỘNG CẬP NHẬT GIAO DIỆN KHI DỮ LIỆU LOCALSTORAGE THAY ĐỔI TỪ TAB KHÁC HOẶC MODULE KHÁC
   */
  window.addEventListener("storage", function (event) {
    if (event.key && event.key.startsWith("bookstore.")) {
      renderBooks();
    }
  });
  window.addEventListener("bookstore:changed", renderBooks);

  /**
   * ĐÓNG POPUP CHI TIẾT SÁCH KHI CLICK RA NGOÀI VÙNG CHỨA
   */
  if (!detailDialog.showModal) {
    detailDialog.addEventListener("click", function (event) {
      if (event.target === detailDialog) {
        detailDialog.close();
      }
    });
  }

  // Khởi động hiển thị danh sách sách lần đầu tiên khi mở trang web
  renderBooks();
}());
