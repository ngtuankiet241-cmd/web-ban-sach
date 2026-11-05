(function () {
  const prefix = "bookstore.";

  function storage() {
    try {
      return window.localStorage;
    } catch (error) {
      throw new Error("Trình duyệt không cho phép truy cập bộ nhớ cục bộ: " + error.message);
    }
  }

  function read(name, fallback) {
    const raw = storage().getItem(prefix + name);
    if (raw === null) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error("Dữ liệu '" + prefix + name + "' bị lỗi định dạng JSON: " + error.message);
    }
  }

  function write(name, value) {
    let serialized;
    try {
      serialized = JSON.stringify(value);
      storage().setItem(prefix + name, serialized);
    } catch (error) {
      throw new Error("Không thể lưu dữ liệu '" + prefix + name + "': " + error.message);
    }
    window.dispatchEvent(new CustomEvent("bookstore:changed", { detail: { key: name } }));
  }

  function initialize() {
    Object.keys(window.BookstoreSeed).forEach(function (name) {
      if (storage().getItem(prefix + name) === null) {
        write(name, window.BookstoreSeed[name]);
      }
    });

    // Tự động đồng bộ ảnh bìa mới cho các cuốn sách seed nếu đang dùng ảnh SVG demo cũ
    try {
      const existingBooks = read("books");
      if (Array.isArray(existingBooks) && window.BookstoreSeed && Array.isArray(window.BookstoreSeed.books)) {
        let hasChanges = false;
        const seedMap = new Map();
        window.BookstoreSeed.books.forEach(function (b) {
          seedMap.set(b.id, b.image);
        });
        existingBooks.forEach(function (book) {
          if (seedMap.has(book.id) && typeof book.image === "string" && book.image.indexOf("data:image/svg+xml") === 0) {
            const freshImage = seedMap.get(book.id);
            if (book.image !== freshImage) {
              book.image = freshImage;
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          write("books", existingBooks);
        }
      }
    } catch (ignore) {
      // Bỏ qua nếu môi trường kiểm thử không có localStorage
    }
  }

  function update(name, updater) {
    const current = read(name);
    if (current === undefined) {
      throw new Error("Không tìm thấy dữ liệu '" + prefix + name + "'.");
    }
    const next = updater(current);
    write(name, next);
    return next;
  }

  function resetDemoData() {
    Object.keys(window.BookstoreSeed).forEach(function (name) {
      write(name, window.BookstoreSeed[name]);
    });
  }

  function createId(name) {
    return name + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const api = {
    prefix: prefix,
    keys: {
      categories: "categories",
      books: "books",
      customers: "customers",
      currentCustomerId: "currentCustomerId",
      cart: "cart",
      orders: "orders",
      receipts: "receipts",
      stockMovements: "stockMovements",
      adminSession: "adminSession"
    },
    read: read,
    write: write,
    update: update,
    initialize: initialize,
    createId: createId,
    clone: clone,
    getCategories: function () { return read("categories", []); },
    getBooks: function () { return read("books", []); },
    getCustomers: function () { return read("customers", []); },
    getOrders: function () { return read("orders", []); },
    getReceipts: function () { return read("receipts", []); },
    getStockMovements: function () { return read("stockMovements", []); },
    setCategories: function (value) { write("categories", value); },
    setBooks: function (value) { write("books", value); },
    setCustomers: function (value) { write("customers", value); },
    setOrders: function (value) { write("orders", value); },
    setReceipts: function (value) { write("receipts", value); },
    setStockMovements: function (value) { write("stockMovements", value); },
    resetDemoData: resetDemoData
  };

  window.Bookstore = api;
  window.BookStoreStorage = api;

  try {
    initialize();
  } catch (error) {
    console.error(error);
    document.addEventListener("DOMContentLoaded", function () {
      const message = document.querySelector("[data-storage-error]");
      if (message) {
        message.hidden = false;
        message.textContent = error.message;
      }
    });
  }
}());
