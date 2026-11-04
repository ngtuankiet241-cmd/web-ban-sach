(function () {
  "use strict";

  var PREFIX = "bookstore.";

  var seedCategories = [
    { id: "cat-fiction", name: "Văn học", active: true, marginPercent: 25 },
    { id: "cat-business", name: "Kinh tế", active: true, marginPercent: 20 },
    { id: "cat-children", name: "Thiếu nhi", active: true, marginPercent: 30 }
  ];

  var seedBooks = [
    { id: "book-1", categoryId: "cat-fiction", code: "VH001", title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài", image: "", description: "Tác phẩm văn học thiếu nhi kinh điển.", costPrice: 60000, sellingPrice: 80000, stock: 12, active: true, marginPercent: null },
    { id: "book-2", categoryId: "cat-fiction", code: "VH002", title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ", author: "Nguyễn Nhật Ánh", image: "", description: "Truyện ký tuổi thơ đầy cảm xúc.", costPrice: 70000, sellingPrice: 95000, stock: 4, active: true, marginPercent: null },
    { id: "book-3", categoryId: "cat-business", code: "KT001", title: "Nhà Đầu Tư Thông Minh", author: "Benjamin Graham", image: "", description: "Kinh điển về đầu tư dài hạn.", costPrice: 120000, sellingPrice: 150000, stock: 8, active: true, marginPercent: null },
    { id: "book-4", categoryId: "cat-children", code: "TN001", title: "Hoàng Tử Bé", author: "Antoine de Saint-Exupéry", image: "", description: "Câu chuyện triết lý dành cho mọi lứa tuổi.", costPrice: 45000, sellingPrice: 65000, stock: 3, active: true, marginPercent: null }
  ];

  var seedCustomers = [
    { id: "customer-1", name: "Nguyễn Minh An", email: "an@example.com", phone: "0901234567", password: "123456", status: "active", addresses: [{ id: "addr-1", label: "Nhà riêng", recipient: "Nguyễn Minh An", phone: "0901234567", address: "12 Nguyễn Trãi, Quận 5, TP.HCM" }] },
    { id: "customer-2", name: "Trần Thu Hà", email: "ha@example.com", phone: "0912345678", password: "123456", status: "locked", addresses: [{ id: "addr-2", label: "Văn phòng", recipient: "Trần Thu Hà", phone: "0912345678", address: "38 Lê Lợi, Quận 1, TP.HCM" }] },
    { id: "customer-3", name: "Lê Hoàng Nam", email: "nam@example.com", phone: "0987654321", password: "123456", status: "active", addresses: [] }
  ];

  var seedOrders = [
    {
      id: "DH001",
      customerId: "customer-1",
      items: [{ bookId: "book-1", title: "Dế Mèn Phiêu Lưu Ký", quantity: 1, price: 80000 }],
      deliveryAddress: "12 Nguyễn Trãi, Quận 5, TP.HCM",
      paymentMethod: "COD",
      status: "Mới đặt",
      orderedAt: "2026-11-02T09:30:00.000Z",
      total: 80000
    },
    {
      id: "DH002",
      customerId: "customer-3",
      items: [{ bookId: "book-4", title: "Hoàng Tử Bé", quantity: 2, price: 65000 }],
      deliveryAddress: "25 Cách Mạng Tháng Tám, Quận 3, TP.HCM",
      paymentMethod: "Chuyển khoản",
      status: "Đã giao",
      orderedAt: "2026-10-28T14:15:00.000Z",
      total: 130000
    }
  ];

  var seedReceipts = [
    {
      id: "PN001",
      receivedAt: "2026-10-30T00:00:00.000Z",
      status: "completed",
      items: [{ bookId: "book-1", quantity: 10, costPrice: 60000 }]
    },
    {
      id: "PN002",
      receivedAt: "2026-11-03T00:00:00.000Z",
      status: "draft",
      items: [
        { bookId: "book-2", quantity: 5, costPrice: 70000 },
        { bookId: "book-3", quantity: 6, costPrice: 120000 }
      ]
    }
  ];

  var seedMovements = [
    { id: "mv-1", bookId: "book-1", direction: "in", quantity: 10, occurredAt: "2026-10-30T08:00:00.000Z", referenceId: "PN001" },
    { id: "mv-2", bookId: "book-1", direction: "out", quantity: 1, occurredAt: "2026-11-02T09:30:00.000Z", referenceId: "DH001" },
    { id: "mv-3", bookId: "book-4", direction: "out", quantity: 2, occurredAt: "2026-10-28T14:15:00.000Z", referenceId: "DH002" }
  ];

  function read(key, fallback) {
    try {
      var value = localStorage.getItem(PREFIX + key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }

  function seed() {
    if (read("categories", null) === null) write("categories", seedCategories);
    if (read("books", null) === null) write("books", seedBooks);
    if (read("customers", null) === null) write("customers", seedCustomers);
    if (read("orders", null) === null) write("orders", seedOrders);
    if (read("receipts", null) === null) write("receipts", seedReceipts);
    if (read("stockMovements", null) === null) write("stockMovements", seedMovements);
  }

  function createId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  seed();

  window.BookStoreStorage = {
    prefix: PREFIX,
    read: read,
    write: write,
    seed: seed,
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
    resetDemoData: function () {
      write("categories", seedCategories);
      write("books", seedBooks);
      write("customers", seedCustomers);
      write("orders", seedOrders);
      write("receipts", seedReceipts);
      write("stockMovements", seedMovements);
    }
  };
})();
