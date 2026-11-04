(function () {
  const prefix = "bookstore.";

  function storage() {
    try {
      return window.localStorage;
    } catch (error) {
      throw new Error("Trình duyệt không cho phép truy cập bộ nhớ cục bộ: " + error.message);
    }
  }

  function read(name) {
    const raw = storage().getItem(prefix + name);
    if (raw === null) {
      return undefined;
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
  }

  function initialize() {
    Object.keys(window.BookstoreSeed).forEach(function (name) {
      if (storage().getItem(prefix + name) === null) {
        write(name, window.BookstoreSeed[name]);
      }
    });
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

  window.Bookstore = {
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
    initialize: initialize
  };

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
