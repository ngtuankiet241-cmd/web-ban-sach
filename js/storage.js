(function () {
  const prefix = "bookstore.";
  const schemaVersion = 1;

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
    migrateInventoryLedger();
  }

  function migrateInventoryLedger() {
    if (read("schemaVersion", null) === schemaVersion) {
      return;
    }

    const books = read("books", []);
    const movements = read("stockMovements", []);
    if (!Array.isArray(books) || !Array.isArray(movements)) {
      throw new Error("Không thể cập nhật sổ tồn vì dữ liệu sách hoặc biến động kho không hợp lệ.");
    }

    const validMovementDates = movements.map(function (movement) {
      const occurredAt = new Date(movement.occurredAt).getTime();
      if (!Number.isFinite(occurredAt)) {
        throw new Error("Không thể cập nhật sổ tồn: ngày biến động kho không hợp lệ.");
      }
      return occurredAt;
    });
    const openingDate = validMovementDates.length
      ? new Date(Math.min.apply(null, validMovementDates) - 1).toISOString()
      : "1900-01-01T00:00:00.000Z";
    let changed = false;

    books.forEach(function (book) {
      const currentStock = Number(book.stock);
      if (!Number.isFinite(currentStock) || currentStock < 0) {
        throw new Error("Không thể cập nhật sổ tồn: số lượng sách '" + book.id + "' không hợp lệ.");
      }

      const recordedBalance = movements.filter(function (movement) {
        return movement.bookId === book.id;
      }).reduce(function (balance, movement) {
        const quantity = Number(movement.quantity);
        if ((movement.direction !== "in" && movement.direction !== "out") ||
            !Number.isFinite(quantity) || quantity < 0) {
          throw new Error("Không thể cập nhật sổ tồn: biến động kho của sách '" + book.id + "' không hợp lệ.");
        }
        return balance + (movement.direction === "in" ? quantity : -quantity);
      }, 0);
      const openingBalance = currentStock - recordedBalance;
      const openingMovementId = "migration-opening-" + book.id;

      if (Math.abs(openingBalance) > 0.000001 &&
          !movements.some(function (movement) { return movement.id === openingMovementId; })) {
        movements.push({
          id: openingMovementId,
          bookId: book.id,
          direction: openingBalance > 0 ? "in" : "out",
          quantity: Math.abs(openingBalance),
          occurredAt: openingDate,
          referenceId: "migration-opening-balance"
        });
        changed = true;
      }
    });

    if (changed) {
      write("stockMovements", movements);
    }
    write("schemaVersion", schemaVersion);
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
    write("schemaVersion", schemaVersion);
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
