/**
 * ==============================================================================
 * BOOKABOOK - MÔ-ĐUN QUẢN LÝ DỮ LIỆU CỤC BỘ (LOCAL STORAGE)
 * ==============================================================================
 * Dành cho sinh viên năm nhất:
 * - Trong môn "Lập trình web và ứng dụng", đồ án là Clickable Prototype chạy offline.
 * - Website không dùng Database hay Backend thật (như MySQL/NodeJS/PHP), mà toàn bộ
 *   dữ liệu (sách, thể loại, tài khoản, đơn hàng, giỏ hàng) được lưu trong bộ nhớ
 *   của trình duyệt thông qua cơ chế `window.localStorage`.
 * - LocalStorage chỉ lưu được dữ liệu dạng chuỗi (String), nên:
 *     + Khi lưu (write): Phải dùng `JSON.stringify(object)` để biến Object thành chuỗi.
 *     + Khi đọc (read): Phải dùng `JSON.parse(string)` để biến chuỗi thành Object.
 * ==============================================================================
 */

(function () {
  "use strict";

  // Tiền tố cho mọi key trong LocalStorage để tránh trùng lặp với các web khác trên cùng trình duyệt
  // Ví dụ: bookstore.books, bookstore.customers, bookstore.cart
  const prefix = "bookstore.";

  /**
   * Hàm lấy đối tượng localStorage của trình duyệt
   * Có bọc try...catch đề phòng trường hợp trình duyệt chặn quyền (ví dụ chế độ ẩn danh quá nghiêm ngặt)
   */
  function storage() {
    try {
      return window.localStorage;
    } catch (error) {
      throw new Error("Trình duyệt không cho phép truy cập bộ nhớ cục bộ: " + error.message);
    }
  }

  /**
   * ĐỌC DỮ LIỆU TỪ LOCALSTORAGE
   * @param {string} name - Tên trường dữ liệu (ví dụ: 'books', 'cart')
   * @param {*} fallback - Giá trị mặc định trả về nếu trong kho chưa có dữ liệu này
   * @returns {*} Dữ liệu sau khi giải mã JSON, hoặc giá trị fallback
   */
  function read(name, fallback) {
    const raw = storage().getItem(prefix + name);
    // Nếu trong storage chưa từng lưu key này (lần đầu vào web), trả về giá trị fallback
    if (raw === null) {
      return fallback;
    }

    try {
      // Giải mã chuỗi JSON thành Array/Object trong JavaScript
      return JSON.parse(raw);
    } catch (error) {
      throw new Error("Dữ liệu '" + prefix + name + "' bị lỗi định dạng JSON: " + error.message);
    }
  }

  /**
   * GHI DỮ LIỆU VÀO LOCALSTORAGE
   * @param {string} name - Tên trường dữ liệu (ví dụ: 'books', 'orders')
   * @param {*} value - Giá trị cần lưu (Object, Array, chuỗi, số...)
   */
  function write(name, value) {
    let serialized;
    try {
      // Biến Object/Array thành chuỗi văn bản JSON
      serialized = JSON.stringify(value);
      storage().setItem(prefix + name, serialized);
    } catch (error) {
      throw new Error("Không thể lưu dữ liệu '" + prefix + name + "': " + error.message);
    }
    // Phát ra một sự kiện (CustomEvent) để các trang/thành phần khác trong web biết
    // dữ liệu vừa thay đổi và tự động cập nhật lại giao diện (Observer Pattern)
    window.dispatchEvent(new CustomEvent("bookstore:changed", { detail: { key: name } }));
  }

  /**
   * KHỞI TẠO DỮ LIỆU BAN ĐẦU (SEED DATA)
   * Chạy mỗi khi tải trang:
   * - Duyệt qua tất cả các bảng dữ liệu mẫu có trong window.BookstoreSeed (từ file data.js).
   * - Bảng nào trong LocalStorage chưa có thì nạp dữ liệu mẫu vào.
   */
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

  /**
   * CẬP NHẬT DỮ LIỆU THÔNG QUA MỘT HÀM BIẾN ĐỔI (UPDATER)
   * Đọc dữ liệu cũ -> Gọi hàm updater để sửa -> Lưu lại dữ liệu mới
   */
  function update(name, updater) {
    const current = read(name);
    if (current === undefined) {
      throw new Error("Không tìm thấy dữ liệu '" + prefix + name + "'.");
    }
    const next = updater(current);
    write(name, next);
    return next;
  }

  /**
   * KHÔI PHỤC DỮ LIỆU GỐC (RESET DEMO)
   * Ghi đè toàn bộ dữ liệu trong LocalStorage bằng dữ liệu ban đầu trong data.js.
   * Rất hữu ích khi demo cho thầy cô xem xong muốn đưa dữ liệu về như mới.
   */
  function resetDemoData() {
    Object.keys(window.BookstoreSeed).forEach(function (name) {
      write(name, window.BookstoreSeed[name]);
    });
  }

  /**
   * HÀM SINH MÃ ĐỊNH DANH DUY NHẤT (ID GENERATOR)
   * Tạo ID ngẫu nhiên không trùng lặp dựa trên tiền tố + timestamp + số ngẫu nhiên
   * Ví dụ: createId('order') -> 'order-m4j9k2-3x8y7z'
   */
  function createId(name) {
    return name + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  /**
   * HÀM SAO CHÉP SÂU (DEEP CLONE)
   * Giúp nhân bản 1 Object/Array độc lập hoàn toàn, tránh việc sửa đổi đối tượng con
   * bị ảnh hưởng ngược lại đối tượng gốc (tránh lỗi tham chiếu trong JS).
   */
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /**
   * GÓI TẤT CẢ CÁC HÀM TIỆN ÍCH THÀNH ĐỐI TƯỢNG API DÙNG CHUNG
   * Đưa vào biến toàn cục `window.Bookstore` để các file khác (storefront.js, admin.js...) gọi được.
   */
  const api = {
    prefix: prefix,
    // Danh sách các khóa (key) lưu trong LocalStorage
    keys: {
      categories: "categories",           // Thể loại sách
      books: "books",                     // Danh mục sách
      customers: "customers",             // Danh sách khách hàng
      currentCustomerId: "currentCustomerId", // ID khách hàng đang đăng nhập
      cart: "cart",                       // Giỏ hàng hiện tại
      orders: "orders",                   // Danh sách đơn hàng
      receipts: "receipts",               // Phiếu nhập kho
      stockMovements: "stockMovements",   // Lịch sử biến động kho
      adminSession: "adminSession"        // Phiên đăng nhập Admin
    },
    read: read,
    write: write,
    update: update,
    initialize: initialize,
    createId: createId,
    clone: clone,
    // Các hàm getter/setter tiện ích giúp viết code ngắn gọn hơn
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

  // Gán đối tượng api vào window để các file script khác gọi được
  window.Bookstore = api;
  window.BookStoreStorage = api; // Tên alias tương thích ngược

  // Tự động khởi tạo dữ liệu ngay khi nạp file script
  try {
    initialize();
  } catch (error) {
    console.error(error);
    // Nếu có lỗi truy cập storage, hiển thị thông báo lỗi lên màn hình
    document.addEventListener("DOMContentLoaded", function () {
      const message = document.querySelector("[data-storage-error]");
      if (message) {
        message.hidden = false;
        message.textContent = error.message;
      }
    });
  }
}());
