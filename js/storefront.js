// Logic cửa hàng của index.html; đọc sách/thể loại và lưu thao tác mua qua API trong storage.js.
(function () {
  const pageSize = 8;
  const state = { page: 1, books: [], categories: [], filters: null, sort: "featured" };
  const form = document.querySelector("#catalog-search");
  if (!form) {
    return;
  }

  const grid = document.querySelector("#book-grid");
  const count = document.querySelector("#result-count");
  const pagination = document.querySelector("#pagination");
  const empty = document.querySelector("#empty-state");
  const errorBox = document.querySelector("#catalog-error");
  const detailDialog = document.querySelector("#book-dialog");
  const detailContent = document.querySelector("#book-details");
  const currency = new Intl.NumberFormat("vi-VN");

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLocaleLowerCase("vi");
  }

  function money(value) {
    return currency.format(Number(value) || 0) + " ₫";
  }

  function imageSource(value) {
    const source = String(value || "");
    if (/^(assets\/|data:image\/)/i.test(source)) {
      return escapeHtml(source);
    }
    return "";
  }

  function setError(message) {
    errorBox.hidden = !message;
    errorBox.textContent = message || "";
  }

  function announce(message) {
    const target = document.querySelector("#search-message");
    target.textContent = message || "";
  }

  function readCatalog() {
    if (!window.Bookstore) {
      throw new Error("Không tải được mô-đun dữ liệu. Hãy tải lại trang.");
    }
    state.books = Bookstore.read(Bookstore.keys.books) || [];
    state.categories = Bookstore.read(Bookstore.keys.categories) || [];
  }

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

  function currentBooks() {
    let books = state.books.filter(function (book) {
      return book.active && state.categories.some(function (category) {
        return category.id === book.categoryId && category.active;
      });
    });

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

    if (state.sort === "price-asc") {
      books.sort(function (a, b) { return a.sellingPrice - b.sellingPrice; });
    } else if (state.sort === "price-desc") {
      books.sort(function (a, b) { return b.sellingPrice - a.sellingPrice; });
    } else if (state.sort === "title-asc") {
      books.sort(function (a, b) { return a.title.localeCompare(b.title, "vi"); });
    }
    return books;
  }

  function renderBooks() {
    try {
      setError("");
      readCatalog();
      renderCategoryOptions();
      const books = currentBooks();
      const pageCount = Math.max(1, Math.ceil(books.length / pageSize));
      state.page = Math.min(state.page, pageCount);
      const start = (state.page - 1) * pageSize;
      const visibleBooks = books.slice(start, start + pageSize);

      count.textContent = books.length
        ? "Hiển thị " + (start + 1) + "–" + Math.min(start + pageSize, books.length) + " trong " + books.length + " cuốn sách"
        : "0 cuốn sách";
      empty.hidden = books.length > 0;
      grid.hidden = books.length === 0;
      grid.innerHTML = visibleBooks.map(function (book) {
        const category = state.categories.find(function (item) {
          return item.id === book.categoryId;
        });
        const image = imageSource(book.image);
        const stockLabel = Number(book.stock) > 0
          ? '<span class="stock-label">Còn ' + Number(book.stock) + " cuốn</span>"
          : '<span class="stock-label stock-label--out">Tạm hết hàng</span>';
        return '<article class="book-card">' +
          '<button class="book-card__cover" type="button" data-book-detail="' + escapeHtml(book.id) + '" aria-label="Xem chi tiết ' + escapeHtml(book.title) + '">' +
          (image ? '<img src="' + image + '" alt="Bìa sách ' + escapeHtml(book.title) + '" loading="lazy">' : '<span class="book-cover-fallback" aria-hidden="true">M</span>') +
          "</button>" +
          '<div class="book-card__body">' +
          '<p class="book-card__category">' + escapeHtml(category ? category.name : "Sách") + "</p>" +
          '<h3><button class="text-button" type="button" data-book-detail="' + escapeHtml(book.id) + '">' + escapeHtml(book.title) + "</button></h3>" +
          '<p class="book-card__author">' + escapeHtml(book.author) + "</p>" +
          '<p class="book-card__price">' + money(book.sellingPrice) + "</p>" +
          '<div class="book-card__footer">' + stockLabel +
          '<button class="button button--small button--primary" type="button" data-add-book="' + escapeHtml(book.id) + '"' +
          (Number(book.stock) < 1 ? " disabled" : "") + ">Thêm giỏ</button></div>" +
          "</div></article>";
      }).join("");

      renderPagination(pageCount);
      renderCartCount();
    } catch (error) {
      grid.innerHTML = "";
      setError(error.message);
    }
  }

  function renderPagination(pageCount) {
    if (pageCount <= 1) {
      pagination.innerHTML = "";
      return;
    }
    let html = '<button class="pagination__button" type="button" data-page="' + (state.page - 1) +
      '" aria-label="Trang trước"' + (state.page === 1 ? " disabled" : "") + ">‹</button>";
    for (let page = 1; page <= pageCount; page += 1) {
      html += '<button class="pagination__button' + (page === state.page ? " is-current" : "") +
        '" type="button" data-page="' + page + '" aria-label="Trang ' + page + '"' +
        (page === state.page ? ' aria-current="page"' : "") + ">" + page + "</button>";
    }
    html += '<button class="pagination__button" type="button" data-page="' + (state.page + 1) +
      '" aria-label="Trang sau"' + (state.page === pageCount ? " disabled" : "") + ">›</button>";
    pagination.innerHTML = html;
  }

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

  function addToCart(bookId) {
    const book = state.books.find(function (item) {
      return item.id === bookId && item.active;
    });
    if (!book || Number(book.stock) < 1) {
      announce("Sách hiện không có sẵn để thêm vào giỏ.");
      return;
    }

    try {
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

      const cart = Bookstore.read(Bookstore.keys.cart) || [];
      const line = cart.find(function (item) { return item.bookId === bookId; });
      if (line) {
        if (Number(line.quantity) >= Number(book.stock)) {
          announce("Số lượng trong giỏ đã bằng số lượng sách còn trong kho.");
          return;
        }
        line.quantity = Number(line.quantity) + 1;
      } else {
        cart.push({ bookId: bookId, quantity: 1 });
      }
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const values = new FormData(form);
    const rawMin = String(values.get("minPrice") || "").trim();
    const rawMax = String(values.get("maxPrice") || "").trim();
    const minPrice = rawMin === "" ? null : Number(rawMin);
    const maxPrice = rawMax === "" ? null : Number(rawMax);
    if ((minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0))) {
      announce("Khoảng giá phải là số không âm.");
      return;
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      announce("Giá tối thiểu không được lớn hơn giá tối đa.");
      return;
    }
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

  document.querySelector("#clear-search").addEventListener("click", function () {
    form.reset();
    state.filters = null;
    state.page = 1;
    state.sort = "featured";
    document.querySelector("#sort-books").value = "featured";
    announce("");
    renderBooks();
  });

  document.querySelector("#sort-books").addEventListener("change", function (event) {
    state.sort = event.target.value;
    state.page = 1;
    renderBooks();
  });

  pagination.addEventListener("click", function (event) {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) {
      return;
    }
    state.page = Number(button.dataset.page);
    renderBooks();
    document.querySelector("#book-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  grid.addEventListener("click", function (event) {
    const detailButton = event.target.closest("[data-book-detail]");
    const addButton = event.target.closest("[data-add-book]");
    if (detailButton) {
      openDetails(detailButton.dataset.bookDetail);
    } else if (addButton) {
      addToCart(addButton.dataset.addBook);
    }
  });

  detailContent.addEventListener("click", function (event) {
    const button = event.target.closest("[data-add-book]");
    if (button) {
      addToCart(button.dataset.addBook);
    }
  });

  window.addEventListener("storage", function (event) {
    if (event.key && event.key.startsWith("bookstore.")) {
      renderBooks();
    }
  });
  window.addEventListener("bookstore:changed", renderBooks);

  if (!detailDialog.showModal) {
    detailDialog.addEventListener("click", function (event) {
      if (event.target === detailDialog) {
        detailDialog.close();
      }
    });
  }

  renderBooks();
}());
